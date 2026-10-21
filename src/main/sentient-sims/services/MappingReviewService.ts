import log from 'electron-log';
import { ApiContext } from './ApiContext';
import { AIActionType } from '../models/AIActionType';
import { StageId } from '../pipeline/stages';
import {
  MAPPING_FLAGS,
  MappingFinding,
  MappingFindingConfidence,
  MappingFlag,
  MappingReview,
  MappingReviewRequest,
} from '../models/MappingReview';
import { lintMapping, mappingVerdict } from '../util/mappingLint';
import { firstJsonBlockLoose } from '../util/jsonBlock';
import { plainProviderError } from '../util/providerErrorWords';
import { ACTOR_WORD_PAIRS, MAPPING_SCENE_TOKENS } from '../formatter/PromptFormatter';

const MAX_REVIEW_TOKENS = 600;
const MAX_SAMPLE_CHARS = 700;

export const MAPPING_REVIEW_SYSTEM_PROMPT = `You review prompt templates ("mappings") that players of The Sims 4 write for the Sentient Sims mod. A mapping is keyed to one in-game interaction or animation. The app fills in the tokens, puts the sims' moods, traits, relationships, location and recent history around it, and asks an AI to narrate the moment. Mappings are shared online, so one bad template reaches every player, for every pair of sims, in every mood.

A good mapping is ONE short present-tense sentence that says only what the interaction itself means, with a token for every sim. Example: "{actor.0} and {actor.1} are showering together."

Tokens the app fills: {actor.0}, {actor.1}, ... for each sim; {actor.N.${ACTOR_WORD_PAIRS.map((pair) => pair.token).join('}, {actor.N.')}} for gendered words; ${MAPPING_SCENE_TOKENS.map((token) => `{${token}}`).join(', ')}.

Flag only what you can point to, with one of these flags:
- AI_DIRECTIVE: words aimed at the model rather than describing the scene ("AI ignore this", "[do not describe...]", "please vary", "thank you", anything about "the output" or "the response", asides about whether the sim is sitting or standing).
- UNWARRANTED_CONTEXT: a mood, backstory, continuity claim ("still", "after what just happened"), prop, scenery, or physical detail the interaction's name does not call for. The app already supplies live mood and history; a fixed guess in the template overrides them and fires when it is wrong. An adverb the interaction name itself asks for (an awkward social saying "awkwardly") is fine. Marketing or medical-claim copy is flagged.
- HARDCODED_NAME: a literal character name where {actor.N} belongs, or third-party fiction (Baldur's Gate). Sims 4 world and game nouns (Willow Creek, Simoleons, Landgraab) are fine. An NPC role the interaction is about (Father Winter) is fine.
- RAW_PRONOUN: a bare he/she/him/his/her/himself/herself in the prose instead of the {actor.N.he/she} form. Pronouns inside tokens are fine; they/them is fine.
- NON_ENGLISH: prose mostly in another language.
- BROKEN: empty or cut-off text, a malformed token, grammar that renders wrong ({actor.0.his/her}'s gives "his's"), subject-verb disagreement, text pasted from another interaction, a raw game identifier.
- VERBOSE: more than one short sentence.

Read the test responses: if the narration repeats a mood or detail that came only from the template, that is UNWARRANTED_CONTEXT in the template. Judge the template, not the narration's quality.

Answer with one JSON object and nothing else:
{"summary": "one plain sentence a player can act on, naming what to change or saying it reads clean", "findings": [{"flag": "FLAG", "confidence": "high|medium|low", "quote": "the words in the mapping this is about", "why": "one short sentence"}], "suggestion": "the mapping rewritten as one short sentence in token form, or an empty string when it is already good"}

Keep the suggestion in the same spirit as the mapping; it describes the interaction, nothing more. Use {actor.N} tokens for every sim and {actor.N.he/she} forms for every pronoun. No findings means an empty findings array.`;

type ParsedReview = {
  summary?: string;
  findings?: MappingFinding[];
  suggestion?: string;
};

function asConfidence(value: unknown): MappingFindingConfidence {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium';
}

function asFlag(value: unknown): MappingFlag | undefined {
  const flag =
    typeof value === 'string'
      ? value
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_')
      : '';
  return MAPPING_FLAGS.find((known) => known === flag);
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function parseMappingReview(raw: string): ParsedReview | undefined {
  const block = firstJsonBlockLoose(raw);
  if (!block || typeof block !== 'object') {
    return undefined;
  }
  const record = block as Record<string, unknown>;
  const findings: MappingFinding[] = [];
  if (Array.isArray(record.findings)) {
    record.findings.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }
      const finding = entry as Record<string, unknown>;
      const flag = asFlag(finding.flag);
      const why = asText(finding.why) ?? asText(finding.reason);
      if (!flag || !why) {
        return;
      }
      findings.push({
        flag,
        confidence: asConfidence(finding.confidence),
        quote: asText(finding.quote),
        why,
        source: 'ai',
      });
    });
  }
  return { summary: asText(record.summary), findings, suggestion: asText(record.suggestion) };
}

export class MappingReviewService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async review(request: MappingReviewRequest): Promise<MappingReview> {
    const sims = request.sims ?? [];
    const { action } = request;
    const savedNames = this.ctx.interactions.namesFromSaveIn(action);
    const checks = lintMapping(action, { kind: request.kind, simCount: sims.length || undefined, savedNames });

    // Nothing for a reviewer to read: the player sees the check and tries again
    if (action.trim().length === 0) {
      return { verdict: 'bad', summary: 'Write what the sims are doing first.', findings: checks, aiReviewed: false };
    }

    let parsed: ParsedReview | undefined;
    let aiError: { plain: string; inSettings: boolean } | undefined;
    try {
      const oneShot = await this.ctx.ai.runOneShot(
        `Mapping Review: ${request.name}`,
        MAPPING_REVIEW_SYSTEM_PROMPT,
        this.userText(request, action),
        MAX_REVIEW_TOKENS,
        undefined,
        AIActionType.MAPPING_REVIEW,
        undefined,
        { stageId: StageId.MAPPING_REVIEW, interactive: true },
      );
      parsed = parseMappingReview(oneShot.text);
      if (!parsed) {
        log.warn(`[MappingReview] ${request.name}: the reviewer's answer was not JSON: ${oneShot.text.slice(0, 200)}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`[MappingReview] ${request.name}: the reviewer could not be asked: ${message}`);
      const { plain, inSettings } = plainProviderError(message);
      aiError = { plain, inSettings };
    }

    const findings = mergeFindings(checks, parsed?.findings ?? []);
    const verdict = mappingVerdict(findings);
    const suggestion = this.usableSuggestion(parsed?.suggestion, action, request, sims.length);
    const summary = parsed?.summary ?? defaultSummary(verdict, findings, parsed !== undefined);
    return {
      verdict,
      summary,
      findings,
      suggestion,
      aiReviewed: parsed !== undefined,
      aiError:
        aiError?.plain ?? (parsed ? undefined : 'The reviewer gave no readable answer; the checks above still stand.'),
      inSettings: aiError?.inSettings,
    };
  }

  private userText(request: MappingReviewRequest, action: string): string {
    const lines: string[] = [];
    lines.push(
      request.kind === 'animation' ? `WickedWhims animation: ${request.name}` : `Interaction: ${request.name}`,
    );
    const sims = request.sims ?? [];
    if (sims.length > 0) {
      const cast = sims.map((sim, index) => `{actor.${index}} = ${sim.name} (${sim.gender.toLowerCase()})`).join(', ');
      lines.push(`Sims in the test: ${cast}`);
    }
    lines.push('', 'Mapping:', action);
    const samples = (request.samples ?? []).map((sample) => sample.trim()).filter((sample) => sample.length > 0);
    if (samples.length > 0) {
      lines.push('', 'What the AI narrated from it in the test:');
      samples.forEach((sample, index) => {
        const clipped = sample.length > MAX_SAMPLE_CHARS ? `${sample.slice(0, MAX_SAMPLE_CHARS)}...` : sample;
        lines.push(`${index + 1}. ${clipped}`);
      });
    }
    return lines.join('\n');
  }

  // A rewrite that fails the same checks, or changes nothing, is not offered
  private usableSuggestion(
    suggestion: string | undefined,
    action: string,
    request: MappingReviewRequest,
    simCount: number,
  ): string | undefined {
    if (!suggestion) {
      return undefined;
    }
    const cleaned = suggestion.replace(/^["'`]+|["'`]+$/g, '').trim();
    if (cleaned.length === 0 || cleaned === action.trim()) {
      return undefined;
    }
    const problems = lintMapping(cleaned, {
      kind: request.kind,
      simCount: simCount || undefined,
      savedNames: this.ctx.interactions.namesFromSaveIn(cleaned),
    });
    if (problems.some((problem) => problem.confidence === 'high' && problem.flag !== 'VERBOSE')) {
      log.info(`[MappingReview] ${request.name}: dropped a suggestion that fails the checks: ${cleaned}`);
      return undefined;
    }
    return cleaned;
  }
}

// The checks come first and keep their flag; the reviewer adds what the checks cannot see
export function mergeFindings(checks: MappingFinding[], fromAi: MappingFinding[]): MappingFinding[] {
  const merged = [...checks];
  fromAi.forEach((finding) => {
    const covered = checks.some((check) => check.flag === finding.flag);
    const repeated = merged.some((known) => known.flag === finding.flag && known.quote === finding.quote);
    if (!covered && !repeated) {
      merged.push(finding);
    }
  });
  const order: Record<MappingFindingConfidence, number> = { high: 0, medium: 1, low: 2 };
  return merged.sort((a, b) => order[a.confidence] - order[b.confidence]);
}

function defaultSummary(verdict: string, findings: MappingFinding[], reviewed: boolean): string {
  if (verdict === 'good') {
    return reviewed
      ? 'Reads clean: one sentence, tokens throughout.'
      : 'The checks found nothing; the reviewer could not be asked.';
  }
  return findings.length > 0 ? findings[0].why : 'Something in this mapping needs a look.';
}
