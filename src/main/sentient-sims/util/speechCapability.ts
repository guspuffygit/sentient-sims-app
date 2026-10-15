// Who may say a line aloud. Players asked for pets that keep their inner life but never
// talk (2026-10-15); the same goes for babies and infants - the sims the player cannot
// control. Toddlers and up, every occult and ghosts always speak. Unknown fails OPEN: a
// missing age or species never silences a sim, like isBelowChild.
import { SentientSim } from '../models/SentientSim';
import { SimAge } from '../models/SimAge';
import { lifeStageOf } from './simLifeStage';
import { speciesWord } from './alsoPresent';

type SpeechSources = {
  settings: { nonControllableSimsSpeak: boolean };
  simStateCache?: { getSim(simId: string): { self?: { age?: string; species?: string } } | undefined };
  semanticMemory?: {
    getCurrentFacts(simId: string): { predicate: string; objectText?: string }[];
    speciesFor?(simId: string): string | undefined;
  };
};

type SpeechSubject = Pick<SentientSim, 'sim_id'> & Partial<Pick<SentientSim, 'is_pet' | 'age'>>;

const SILENT_STAGES = new Set(['BABY', 'INFANT']);

// A pet, a baby or an infant. The state report and the fact store outrank the event: a
// Twitch ask is built with is_pet false and age ADULT whatever the target is
// (util/twitchSimTarget.ts), and the event's age is the raw enum.
export function isNonControllable(ctx: SpeechSources, sim: SpeechSubject): boolean {
  if (sim.is_pet === true) {
    return true;
  }
  try {
    if (speciesWord(ctx.simStateCache?.getSim(sim.sim_id)?.self?.species)) {
      return true;
    }
  } catch {
    // no report for this sim
  }
  try {
    if (speciesWord(ctx.semanticMemory?.speciesFor?.(sim.sim_id))) {
      return true;
    }
  } catch {
    // no fact store
  }
  const stage = lifeStageOf(ctx, sim.sim_id);
  if (stage) {
    return SILENT_STAGES.has(stage);
  }
  return sim.age === SimAge.BABY || sim.age === SimAge.INFANT;
}

export function canSpeak(ctx: SpeechSources, sim: SpeechSubject): boolean {
  if (ctx.settings.nonControllableSimsSpeak) {
    return true;
  }
  return !isNonControllable(ctx, sim);
}
