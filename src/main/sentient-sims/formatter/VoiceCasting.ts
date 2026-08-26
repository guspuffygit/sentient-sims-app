import { SentientSim } from '../models/SentientSim';
import { VoiceType } from '../models/VoiceType';
import { castElevenLabsVoice } from './ElevenLabsVoiceCasting';
import { castKokoroVoice } from './KokoroVoiceCasting';
import { DialogueLine } from './PromptFormatter';

export function castVoiceForSim(sim: SentientSim, voiceType: VoiceType): string {
  return voiceType === VoiceType.Kokoro ? castKokoroVoice(sim) : castElevenLabsVoice(sim);
}

function findSimForSpeaker(speaker: string, sims: SentientSim[]): SentientSim | undefined {
  const speakerLower = speaker.toLowerCase();
  return sims.find((sim) => {
    const nameLower = sim.name.toLowerCase();
    return nameLower === speakerLower || nameLower.startsWith(`${speakerLower} `);
  });
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
    const voiceId = voiceOverrides?.get(sim.sim_id) ?? castVoiceForSim(sim, voiceType);
    return voiceId ? { ...line, voiceId } : line;
  });
}
