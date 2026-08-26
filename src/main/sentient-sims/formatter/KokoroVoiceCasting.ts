import { SentientSim } from '../models/SentientSim';
import { bestVoicesForSim, CastableVoice, simAgeToVoiceAge, voiceAgeOrder } from './CastableVoice';
import { hashString } from './VoiceAssignment';

// Kokoro voices with hand-assigned characteristics. Kokoro publishes no age or
// personality metadata, so age and tags here are judgment calls from listening,
// kept to the same tag vocabulary the trait affinities map onto.
// bf_isabella is excluded because it doesn't work (see SentientSimsAIVoiceSettingsComponent).
export const kokoroVoiceCatalog: CastableVoice[] = [
  { voiceId: 'af_heart', name: 'Heart', gender: 'female', age: 'young', tags: ['warm', 'cheerful'] },
  { voiceId: 'af_alloy', name: 'Alloy', gender: 'female', age: 'middle', tags: ['confident', 'formal'] },
  { voiceId: 'af_aoede', name: 'Aoede', gender: 'female', age: 'young', tags: ['calm', 'gentle'] },
  { voiceId: 'af_bella', name: 'Bella', gender: 'female', age: 'young', tags: ['seductive', 'intense'] },
  { voiceId: 'af_jessica', name: 'Jessica', gender: 'female', age: 'young', tags: ['casual', 'cheerful'] },
  { voiceId: 'af_kore', name: 'Kore', gender: 'female', age: 'middle', tags: ['confident', 'calm'] },
  { voiceId: 'af_nicole', name: 'Nicole', gender: 'female', age: 'young', tags: ['soft', 'gentle'] },
  { voiceId: 'af_nova', name: 'Nova', gender: 'female', age: 'young', tags: ['energetic', 'confident'] },
  { voiceId: 'af_river', name: 'River', gender: 'female', age: 'young', tags: ['casual', 'calm'] },
  { voiceId: 'af_sarah', name: 'Sarah', gender: 'female', age: 'middle', tags: ['warm', 'calm'] },
  { voiceId: 'af_sky', name: 'Sky', gender: 'female', age: 'young', tags: ['cheerful', 'energetic'] },
  { voiceId: 'bf_emma', name: 'Emma', gender: 'female', age: 'middle', tags: ['formal', 'warm'] },
  { voiceId: 'bf_alice', name: 'Alice', gender: 'female', age: 'young', tags: ['formal', 'gentle'] },
  { voiceId: 'bf_lily', name: 'Lily', gender: 'female', age: 'young', tags: ['soft', 'gentle'] },
  { voiceId: 'am_adam', name: 'Adam', gender: 'male', age: 'middle', tags: ['deep', 'confident'] },
  { voiceId: 'am_echo', name: 'Echo', gender: 'male', age: 'young', tags: ['calm', 'soft'] },
  { voiceId: 'am_eric', name: 'Eric', gender: 'male', age: 'middle', tags: ['formal', 'calm'] },
  { voiceId: 'am_fenrir', name: 'Fenrir', gender: 'male', age: 'young', tags: ['intense', 'deep'] },
  { voiceId: 'am_liam', name: 'Liam', gender: 'male', age: 'young', tags: ['casual', 'energetic'] },
  { voiceId: 'am_michael', name: 'Michael', gender: 'male', age: 'middle', tags: ['warm', 'calm'] },
  { voiceId: 'am_onyx', name: 'Onyx', gender: 'male', age: 'middle', tags: ['deep', 'gruff'] },
  { voiceId: 'am_puck', name: 'Puck', gender: 'male', age: 'young', tags: ['cheerful', 'energetic'] },
  { voiceId: 'am_santa', name: 'Santa', gender: 'male', age: 'old', tags: ['warm', 'gruff'] },
  { voiceId: 'bm_george', name: 'George', gender: 'male', age: 'old', tags: ['formal', 'warm'] },
  { voiceId: 'bm_lewis', name: 'Lewis', gender: 'male', age: 'young', tags: ['casual', 'energetic'] },
  { voiceId: 'bm_daniel', name: 'Daniel', gender: 'male', age: 'middle', tags: ['formal', 'calm'] },
  { voiceId: 'bm_fable', name: 'Fable', gender: 'male', age: 'middle', tags: ['warm', 'gentle'] },
];

/**
 * Casts a Kokoro voice blend for a sim. Kokoro synthesizes a brand-new voice from a
 * 'primary+partner' combination, so instead of reusing one of ~27 stock voices per sim,
 * the personality-matched primary is blended with a deterministically hashed partner of
 * the same gender and a nearby age — hundreds of possible voices, and two sims that tie
 * on the same primary still usually sound different. Deterministic on the sim's name so
 * the same character always speaks with the same voice.
 */
export function castKokoroVoice(sim: SentientSim): string {
  const bestVoices = bestVoicesForSim(sim, kokoroVoiceCatalog);
  if (bestVoices.length === 0) {
    return '';
  }
  const primary = bestVoices[hashString(sim.name) % bestVoices.length];

  const targetAgeIndex = voiceAgeOrder.indexOf(simAgeToVoiceAge(sim.age));
  let partners = kokoroVoiceCatalog.filter(
    (voice) =>
      voice.gender === primary.gender &&
      voice.voiceId !== primary.voiceId &&
      Math.abs(voiceAgeOrder.indexOf(voice.age) - targetAgeIndex) <= 1,
  );
  if (partners.length === 0) {
    partners = kokoroVoiceCatalog.filter(
      (voice) => voice.gender === primary.gender && voice.voiceId !== primary.voiceId,
    );
  }
  if (partners.length === 0) {
    return primary.voiceId;
  }

  const partner = partners[hashString(`${sim.name}+${primary.voiceId}`) % partners.length];
  return `${primary.voiceId}+${partner.voiceId}`;
}
