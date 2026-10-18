import log from 'electron-log';
import { StageId } from '../pipeline/stages';
import { ApiContext } from './ApiContext';
import { AIActionType } from '../models/AIActionType';
import { SentientSim } from '../models/SentientSim';
import { LocationEntity } from '../db/entities/LocationEntity';
import { LotBlock } from '../models/SimStateReport';
import { cleanupAIOutput, formatSentientSim } from '../formatter/PromptFormatter';
import {
  DraftCandidate,
  lotFacts,
  lotFurnishingNames,
  lotHasFacts,
  lotTypeLabel,
  lotVenue,
  orderDrafts,
  placeDescriptionProblems,
} from '../util/lotDescription';
import { furnishingWords } from '../util/lotFurnishings';
import {
  LOCATION_DESCRIPTION_SYSTEM_PROMPT as LOCATION_SYSTEM_PROMPT,
  SIM_DESCRIPTION_SYSTEM_PROMPT as SIM_SYSTEM_PROMPT,
} from '../pipeline/prompts/utility';

// V-6: nobody should meet a character called "The Residence". A sim or a location that has
// never been described gets ONE cheap fire-and-forget one-shot written from what the game
// already knows (traits, likes, career, mood for a sim; venue, ownership, conditions and
// the zone name for a lot). It is a STARTING POINT the player is expected to edit, so it
// is written once and never overwrites: the persist step re-reads the row and stores only
// if the description is still empty (sim) or still the stock default (location). Nothing
// here blocks a generation — callers fire and forget, and a failure just means the old
// default text is used for another tick.

// A generated description is a one-shot per entity per app run: a miss that fails (no API
// key, provider down, refusal) must not re-queue on every single prompt build.
const MAX_DESCRIPTION_TOKENS = 220;

// description is versions[0]; the editor offers the rest
export type DescribedLocation = {
  description: string;
  versions: string[];
  facts: string;
  lotType?: string;
};

function isBlank(text?: string | null): boolean {
  return !text || text.trim().length === 0;
}

export class DefaultDescriptionService {
  private readonly ctx: ApiContext;

  private readonly attemptedSims = new Set<string>();

  private readonly attemptedLocations = new Set<string>();

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  private enabled(): boolean {
    return this.ctx.settings.generatedDefaultDescriptions;
  }

  // Called from the prompt builder after the participant join: the SentientSim in hand is
  // the richest picture of this character the app ever gets, and it is only complete while
  // an event is being formatted.
  considerSim(sentientSim: SentientSim, existingDescription?: string) {
    if (!this.enabled() || !isBlank(existingDescription)) {
      return;
    }
    const simId = sentientSim.sim_id;
    if (!simId || this.attemptedSims.has(simId)) {
      return;
    }
    this.attemptedSims.add(simId);
    // Fire and forget: prompt building is on the request path and must never wait on an LLM
    this.generateSimDescription(sentientSim).catch((error: unknown) => {
      log.warn(`[DefaultDescription] sim ${simId} failed`, error);
    });
  }

  /**
   * Allow this sim to be described again.
   *
   * The once-per-run gate above exists so a failed generation does not re-queue on every
   * prompt; it also means that clearing a stale description is not enough on its own, as
   * nothing would ever write the replacement in this app run (Phase 3.1 fix B).
   */
  forget(simId: string) {
    this.attemptedSims.delete(simId);
  }

  considerLocation(location: LocationEntity, lot?: LotBlock, zoneName?: string) {
    if (!this.enabled() || !location.is_generic) {
      return;
    }
    // No lot block (the state report was about another lot), or one that names no venue and
    // no object: the writer would only have the repository's defaults and still write three
    // sentences about "the home" (ten such rows by 2026-10-12). Return BEFORE the once-per-run
    // mark so the next event that does carry this lot's block gets to describe it.
    if (!lotHasFacts(lot)) {
      return;
    }
    const locationId = String(location.id);
    if (this.attemptedLocations.has(locationId)) {
      return;
    }
    this.attemptedLocations.add(locationId);
    this.generateLocationDescription(location, lot, zoneName).catch((error: unknown) => {
      log.warn(`[DefaultDescription] location ${locationId} failed`, error);
    });
  }

  private async generateSimDescription(sentientSim: SentientSim) {
    // formatSentientSim minus the description clause (there isn't one — that is the point)
    // and minus the trait-consistency instruction, which is direction for an actor, not fact
    // The list formatters index straight into these arrays; a sparse sim off the wire
    // would otherwise take the whole (fire-and-forget) call down silently. The casts are
    // deliberate: the type says non-null, the HTTP body does not.
    const sparse = sentientSim as Partial<SentientSim>;
    const facts = formatSentientSim(
      {
        ...sentientSim,
        traits: sparse.traits ?? [],
        moods: sparse.moods ?? [],
        careers: sparse.careers ?? [],
        description: undefined,
      },
      { traitConsistencyNote: false },
    );
    const name = sparse.name ?? 'this Sim';
    const oneShot = await this.ctx.ai.runOneShot(
      `Default Description: ${name}`,
      SIM_SYSTEM_PROMPT,
      `Facts about ${name}:\n${facts}`,
      MAX_DESCRIPTION_TOKENS,
      undefined,
      AIActionType.DESCRIPTION_DEFAULT,
      undefined,
      { stageId: StageId.DESCRIPTION_DEFAULT },
    );
    const description = cleanupAIOutput(oneShot.text).trim();
    if (description.length < 20) {
      log.warn(`[DefaultDescription] sim ${name} produced nothing usable`);
      return;
    }
    const stored = this.ctx.participantRepository.setDescriptionIfEmpty(sentientSim.sim_id, description, name);
    log.info(`[DefaultDescription] sim ${name}: ${stored ? 'stored' : 'skipped (already described)'}`);
  }

  /**
   * Cards for one lot from the facts the game reported about it, with the lot type the game's
   * venue gives. `versions` drafts are written in parallel, each gated, and come back in
   * orderDrafts order (no ranking call: see there). Nothing is stored: the fire-and-forget
   * fallback stores the one draft it asks for, and the Locations page's "Auto-Generate
   * Description" (three drafts) hands them to the editor, where the player's Save (or Save as
   * Default for Everyone) is what keeps one. Undefined when no draft passes the gate.
   * interactive: the player pressed the button, so a failure is theirs to see and stays out
   * of provider health.
   */
  async describeLocation(
    location: LocationEntity,
    lot: LotBlock | undefined,
    zoneName?: string,
    options: { interactive?: boolean; versions?: number } = {},
  ): Promise<DescribedLocation | undefined> {
    const facts = lotFacts(location, lot, zoneName);
    const label = zoneName || location.name || 'this place';
    const unmapped = furnishingWords(lotFurnishingNames(lot), { isHome: false }).unmapped;
    if (unmapped.length > 0) {
      log.info(`[DefaultDescription] ${label}: furnishings with no plain words: ${unmapped.join(', ')}`);
    }
    log.info(`[DefaultDescription] ${label}: facts for the writer:\n${facts}`);
    const venue = lotVenue(lot);
    const interactive = options.interactive === true;
    const wanted = Math.max(options.versions ?? 1, 1);
    const written = await Promise.all(
      Array.from({ length: wanted }, () => this.writeLocationDescription(label, facts, venue, interactive)),
    );
    const drafts = written.filter((draft): draft is DraftCandidate => draft !== undefined);
    if (drafts.length === 0) {
      return undefined;
    }
    const versions = orderDrafts(drafts).map((draft) => draft.text);
    const lotType = venue ? lotTypeLabel(venue) : undefined;
    return { description: versions[0], versions, facts, lotType };
  }

  private async generateLocationDescription(location: LocationEntity, lot?: LotBlock, zoneName?: string) {
    const written = await this.describeLocation(location, lot, zoneName);
    if (!written) {
      return;
    }
    const label = zoneName || location.name || 'this place';
    const stored = this.ctx.locationRepository.setDescriptionIfGeneric(
      location,
      written.description,
      zoneName,
      written.lotType,
    );
    log.info(`[DefaultDescription] location ${label}: ${stored ? 'stored' : 'skipped (already described)'}`);
  }

  // The reply is checked before it can be stored: a person in the place, a passing moment, or
  // a venue called a residence means ONE fresh sample, and a second miss keeps the stock text
  // (the row stays generic, so a later app run tries again). The gate is the safety net behind
  // the prompt and the facts, not the fix; see util/lotDescription.ts.
  private async writeLocationDescription(
    label: string,
    facts: string,
    venue?: string,
    interactive = false,
  ): Promise<DraftCandidate | undefined> {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const oneShot = await this.ctx.ai.runOneShot(
        `Default Description: ${label}`,
        LOCATION_SYSTEM_PROMPT,
        `Facts about ${label}:\n${facts}`,
        MAX_DESCRIPTION_TOKENS,
        undefined,
        AIActionType.DESCRIPTION_DEFAULT,
        undefined,
        { stageId: StageId.DESCRIPTION_DEFAULT, interactive },
      );
      const description = cleanupAIOutput(oneShot.text).trim();
      if (description.length < 20) {
        log.warn(`[DefaultDescription] location ${label} produced nothing usable`);
        return undefined;
      }
      const problems = placeDescriptionProblems(description, venue);
      if (problems.length === 0) {
        return { text: description, attempt };
      }
      log.warn(
        `[DefaultDescription] location ${label}: attempt ${attempt} rejected (${problems.join(', ')}): ${description.slice(0, 160)}`,
      );
    }
    log.warn(`[DefaultDescription] location ${label}: rejected twice, keeping the stock text`);
    return undefined;
  }
}
