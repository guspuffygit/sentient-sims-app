// What a sexual act may be told from, and what may come out of telling it.
//
// Live 2026-09-23 at Rustic Residence: a WickedWhims solo scene for Adrian House was
// built like an everyday scene - the lot roster (a toddler on it), the house's verbatim
// scene history (that toddler's diaper and bedtime lines) and the everyday director notes
// - under the sexual-narration system prompt. The model continued the bedtime dialogue:
// "Elliot Chatman is having an intimate moment with Elliot Jr Chatman." It went through
// the director review and TTS and was stored as Adrian's memory. The prompt now gives a
// sexual act only its performers (PromptRequestBuilderService); this file holds the rules
// for that and the last line behind it: nothing about a sexual act is saved or voiced if it
// names anyone outside the act or involves anyone under young adult.
//
// Refusals ride along because they come from the same place: 25 WickedWhims rows in the
// 09-24 save read "I can't help with that.", and one Scene Reflection was stored as Wren's
// diary reading "I can't create explicit content, but I'd be happy to help...".
import { SimAge } from '../models/SimAge';
import { SimStateReport } from '../models/SimStateReport';

const ADULT_AGE_VALUES = new Set<number>([SimAge.YOUNGADULT, SimAge.ADULT, SimAge.ELDER]);
const ADULT_AGE_NAMES = new Set(['YOUNGADULT', 'ADULT', 'ELDER']);

// The mod sends SimAge as its numeric flag on sentient_sims and as a name on the state
// report. An unknown age is not evidence of a minor (older mods, a sim with no report), so
// it reads as adult here; WickedWhims itself never starts an act with a minor.
export function isAdultAge(age: SimAge | number | string | undefined | null): boolean {
  if (age === undefined || age === null || age === '') {
    return true;
  }
  if (typeof age === 'number') {
    return ADULT_AGE_VALUES.has(age);
  }
  const trimmed = age.trim().toUpperCase();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return ADULT_AGE_VALUES.has(numeric);
  }
  return ADULT_AGE_NAMES.has(trimmed);
}

// A sexual-act row may be replayed into a SCENE only when every sim it involves is
// performing this scene and every performer is an adult: Adrian and Mara talking after
// sex keep their own row, Elliot cooking in the next room never sees it, and a child's
// scene never carries one at all.
export function keepIntimateRowForScene(
  rowParticipantIds: string[],
  performerIds: Set<string>,
  performersAdult: boolean,
): boolean {
  if (!performersAdult || rowParticipantIds.length === 0) {
    return false;
  }
  return rowParticipantIds.every((id) => performerIds.has(id));
}

// A DIARY may remember a sexual act only its own adult author took part in. Membership,
// not subset: Adrian's diary keeps his night with Mara although she is not the author.
export function keepIntimateRowForDiary(
  rowParticipantIds: string[],
  povId: string | undefined,
  povAdult: boolean,
): boolean {
  return povId !== undefined && povAdult && rowParticipantIds.includes(povId);
}

// A model declining the task, stored as if a sim had said it. Anchored to the start of the
// text (after an optional "Name (diary):" label) so in-character lines such as
// "I can't help myself" are never mistaken for one.
const REFUSAL_OPENING =
  /^\W*(?:[A-Z][\w .'-]*\s\((?:diary|thinking|thought)\):\s*)?(?:I|You)\s+(?:can(?:no|'|’)t|cannot|won(?:'|’)t|am unable to|am not able to)\s+(?:help with|assist with|create|write|generate|produce|fulfil|fulfill|provide|continue with|narrate|engage in)\b/i;
const EXPLICIT_REFUSAL =
  /\b(?:can(?:no|'|’)t|cannot|won(?:'|’)t|unable to|not able to)\s+(?:create|write|generate|produce|provide)\s+(?:sexually\s+)?explicit\b/i;

export function isRefusal(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  const trimmed = text.trim();
  return REFUSAL_OPENING.test(trimmed) || EXPLICIT_REFUSAL.test(trimmed);
}

type Performer = { sim_id: string; name: string; age?: SimAge | number | string };

// Everyone the state report names (reported sims and everyone they perceive, any tier)
// who is not performing. A wider net than ALSO_PRESENT on purpose: a name from the next
// room in a sex scene is just as wrong as one from the same room.
export function namesOutsideAct(report: SimStateReport | undefined, performers: Performer[]): string[] {
  const performerIds = new Set(performers.map((sim) => sim.sim_id));
  const performerNames = new Set(performers.map((sim) => sim.name.trim().toLowerCase()));
  const names = new Set<string>();
  const add = (simId: string | undefined, name: string | undefined) => {
    if (!name || !name.trim() || (simId && performerIds.has(simId))) {
      return;
    }
    if (performerNames.has(name.trim().toLowerCase())) {
      return;
    }
    names.add(name.trim());
  };
  (report?.sims ?? []).forEach((entry) => {
    add(entry.sim_id, entry.sim_name);
    entry.sims.forEach((perceived) => {
      add(perceived.sim_id, perceived.name);
    });
  });
  return [...names];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Why a sexual-act output must be thrown away, or undefined when it may be kept. A false
// positive only costs one unnarrated animation; a false negative is the 09-23 memory.
export function intimateOutputProblem(
  text: string,
  performers: Performer[],
  outsideNames: string[],
): string | undefined {
  if (isRefusal(text)) {
    return 'model refusal';
  }
  const minor = performers.find((sim) => !isAdultAge(sim.age));
  if (minor) {
    return `performer ${minor.name} is under young adult`;
  }
  const performerFirstNames = new Set(performers.map((sim) => sim.name.trim().split(/\s+/)[0].toLowerCase()));
  for (const name of outsideNames) {
    if (new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i').test(text)) {
      return `names ${name}, who is not in the act`;
    }
    // A first name alone counts too ("Elliot Jr" for Elliot Jr Chatman), unless a
    // performer shares it, where it would be the performer being named
    const first = name.split(/\s+/)[0];
    if (first.length >= 3 && !performerFirstNames.has(first.toLowerCase())) {
      if (new RegExp(`\\b${escapeRegExp(first)}\\b`).test(text)) {
        return `names ${name}, who is not in the act`;
      }
    }
  }
  return undefined;
}
