import { SentientSim } from '../models/SentientSim';
import { VoiceType } from '../models/VoiceType';
import { getSimAliases } from '../util/simAliases';
import { castElevenLabsVoice } from './ElevenLabsVoiceCasting';
import { castKokoroVoice } from './KokoroVoiceCasting';
import { DialogueLine } from './PromptFormatter';

export function castVoiceForSim(sim: SentientSim, voiceType: VoiceType): string {
  return voiceType === VoiceType.Kokoro ? castKokoroVoice(sim) : castElevenLabsVoice(sim);
}

function findSimForSpeaker(speaker: string, sims: SentientSim[]): SentientSim | undefined {
  // A delivery label on the speaker ("Jasmine (to self)") never changes whose voice it is
  const speakerLower = speaker.replace(/\s*\([^)]*\)\s*$/, '').toLowerCase();
  // Exact full-name match beats first-name prefix, and an AMBIGUOUS prefix match casts
  // nobody rather than first-in-list: "Lillie:" in a scene holding two Lillies used to
  // bind whichever appeared first (live 2026-08-26, finding #4). Uncast falls back to
  // the configured default voice, which is the safe failure.
  const exact = sims.filter((sim) => sim.name.toLowerCase() === speakerLower);
  if (exact.length === 1) {
    return exact[0];
  }
  if (exact.length === 0) {
    const prefixMatches = sims.filter((sim) => sim.name.toLowerCase().startsWith(`${speakerLower} `));
    if (prefixMatches.length === 1) {
      return prefixMatches[0];
    }
  }
  // Namelessly-reported sims (service NPCs): the scene knows "Sim 153...", but the model
  // labels the line with the character's real name ("Grim Reaper:") — the alias table
  // bridges the two so the pinned voice still applies
  const alias = getSimAliases().find((entry) => {
    const aliasLower = entry.name.toLowerCase();
    return aliasLower === speakerLower || aliasLower.startsWith(`${speakerLower} `);
  });
  return alias ? sims.find((sim) => sim.sim_id === alias.simId) : undefined;
}

/**
 * Attaches a voice of the given type to each dialogue line whose speaker matches one of
 * the sims in the scene: the voice the user pinned to that sim in the Sims tab if there
 * is one, otherwise a personality cast one. Lines with no matching sim (e.g. Narrator)
 * are left uncast and fall back to the user's configured voice.
 */
export function castVoicesForLines(
  lines: DialogueLine[],
  sims: SentientSim[],
  voiceType: VoiceType,
  voiceOverrides?: Map<string, string>,
): DialogueLine[] {
  return lines.map((line) => {
    const sim = findSimForSpeaker(line.speaker, sims);
    if (!sim) {
      return line;
    }
    // A line that arrives pre-cast (e.g. a Twitch chat question in the dedicated chat
    // voice) keeps its voice; pins and automatic casting only fill the gaps
    const voiceId = line.voiceId ?? voiceOverrides?.get(sim.sim_id) ?? castVoiceForSim(sim, voiceType);
    return voiceId ? { ...line, voiceId } : line;
  });
}
