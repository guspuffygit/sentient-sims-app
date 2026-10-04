// J3 (the 2026-09-04 playtest handoff, cause 3): the scene and ask prompts listed only the Sims in
// the event, so "which cats are here?" had no roster to answer from and the model
// supplied Luna and Leo - one a dog on another lot, one nobody. The state report already
// knows who is on the lot (every reported Sim plus everyone they perceive in the room),
// and the mod now says what species they are. This block puts that roster in front of
// the director, the actors and the ask decision, with the one rule that matters.
import { SimStateReport } from '../models/SimStateReport';

export const ALSO_PRESENT_CAP = 12;

export const ALSO_PRESENT_RULE =
  'Only the people and pets listed here and in the character blocks are present. Do not invent others.';

type Present = { simId: string; name: string; species?: string };

const SPECIES_WORDS: Record<string, string> = {
  CAT: 'cat',
  DOG: 'dog',
  SMALLDOG: 'small dog',
  FOX: 'fox',
  HORSE: 'horse',
};

export function speciesWord(species?: string): string | undefined {
  if (!species) {
    return undefined;
  }
  const key = species.trim().toUpperCase();
  if (key === 'HUMAN' || key === '') {
    return undefined;
  }
  return SPECIES_WORDS[key] ?? key.toLowerCase();
}

// Everyone the report places on `lotId` who is not already a performer, deduplicated by
// sim id, reported Sims first (they are named for sure) then the Sims they perceive.
export function presentOnLot(report: SimStateReport | undefined, lotId: string, performerIds: Set<string>): Present[] {
  if (!report?.lot || report.lot.lot_id === undefined || report.lot.lot_id !== lotId) {
    return [];
  }
  const seen = new Set<string>(performerIds);
  const present: Present[] = [];
  const add = (simId: string | undefined, name: string | undefined, species?: string) => {
    if (!simId || !name || seen.has(simId)) {
      return;
    }
    seen.add(simId);
    present.push({ simId, name, species });
  };
  const sims = report.sims ?? [];
  sims.forEach((entry) => {
    add(entry.sim_id, entry.sim_name, entry.self?.species);
  });
  sims.forEach((entry) => {
    entry.sims.forEach((perceived) => {
      if (perceived.tier === 'same_room') {
        add(perceived.sim_id, perceived.name, perceived.species);
      }
    });
  });
  return present;
}

export function buildAlsoPresentBlock(
  report: SimStateReport | undefined,
  lotId: string | number | undefined,
  performerIds: Iterable<string>,
): string | undefined {
  if (lotId === undefined) {
    return undefined;
  }
  const present = presentOnLot(report, String(lotId), new Set(performerIds)).slice(0, ALSO_PRESENT_CAP);
  if (present.length === 0) {
    return undefined;
  }
  const lines = present.map((sim) => {
    const word = speciesWord(sim.species);
    return `- ${sim.name}${word ? ` (${word})` : ''}`;
  });
  return `<ALSO_PRESENT>\n${lines.join('\n')}\n${ALSO_PRESENT_RULE}\n</ALSO_PRESENT>`;
}
