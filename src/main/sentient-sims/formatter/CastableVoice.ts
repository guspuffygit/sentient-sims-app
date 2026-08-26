import { SentientSim } from '../models/SentientSim';
import { SimAge } from '../models/SimAge';

export type VoiceGender = 'male' | 'female';
export type VoiceAge = 'child' | 'young' | 'middle' | 'old';

export type CastableVoice = {
  voiceId: string;
  name: string;
  gender: VoiceGender;
  age: VoiceAge;
  // Personality/intonation qualities of the voice, matched against sim traits and moods
  tags: string[];
};

// Sim trait/mood key fragments (case-insensitive) mapped to the voice qualities they suggest
const traitTagAffinities: [string, string[]][] = [
  ['evil', ['intense', 'gruff', 'deep']],
  ['mean', ['intense', 'gruff']],
  ['hotheaded', ['intense', 'energetic']],
  ['angry', ['intense', 'gruff']],
  ['romantic', ['seductive', 'warm']],
  ['flirty', ['seductive', 'warm']],
  ['outgoing', ['energetic', 'cheerful']],
  ['cheerful', ['cheerful', 'warm']],
  ['goofball', ['cheerful', 'energetic', 'childish']],
  ['playful', ['cheerful', 'energetic']],
  ['childish', ['childish', 'cheerful']],
  ['loner', ['soft', 'calm']],
  ['shy', ['soft', 'nervous']],
  ['gloomy', ['soft', 'calm']],
  ['sad', ['soft', 'gentle']],
  ['ambitious', ['confident', 'formal']],
  ['selfassured', ['confident']],
  ['confident', ['confident']],
  ['perfectionist', ['formal', 'confident']],
  ['snob', ['formal']],
  ['genius', ['formal', 'calm']],
  ['bookworm', ['calm', 'soft']],
  ['creative', ['emotional', 'warm']],
  ['music', ['emotional', 'warm']],
  ['active', ['energetic']],
  ['fitness', ['energetic']],
  ['lazy', ['casual', 'calm']],
  ['tense', ['nervous']],
  ['scared', ['nervous', 'soft']],
  ['energized', ['energetic']],
  ['happy', ['cheerful', 'warm']],
  ['good', ['warm', 'gentle']],
  ['family', ['warm', 'gentle']],
];

export function simGenderToVoiceGender(gender: string): VoiceGender {
  return gender.toLowerCase() === 'female' ? 'female' : 'male';
}

export function simAgeToVoiceAge(age: SimAge): VoiceAge {
  switch (age) {
    case SimAge.BABY:
    case SimAge.INFANT:
    case SimAge.TODDLER:
    case SimAge.CHILD:
      return 'child';
    case SimAge.TEEN:
    case SimAge.YOUNGADULT:
      return 'young';
    case SimAge.ADULT:
      return 'middle';
    case SimAge.ELDER:
      return 'old';
    default:
      return 'middle';
  }
}

export const voiceAgeOrder: VoiceAge[] = ['child', 'young', 'middle', 'old'];

function desiredTagsForSim(sim: SentientSim): string[] {
  const descriptors = [...sim.traits, ...sim.moods].map((key) => key.toLowerCase());
  const tags: string[] = [];
  traitTagAffinities.forEach(([fragment, affinityTags]) => {
    if (descriptors.some((descriptor) => descriptor.includes(fragment))) {
      tags.push(...affinityTags);
    }
  });
  return tags;
}

/**
 * Ranks a voice catalog for a sim based on who they are: gender is a hard filter, age
 * closeness and trait/mood-derived voice qualities are scored. Returns every voice tied
 * for the best score so callers can break the tie deterministically per sim.
 */
export function bestVoicesForSim(sim: SentientSim, catalog: CastableVoice[]): CastableVoice[] {
  const gender = simGenderToVoiceGender(sim.gender);
  const targetAge = simAgeToVoiceAge(sim.age);

  let candidates = catalog.filter((voice) => voice.gender === gender);
  // Adults should never get a child voice; children only get child/young voices
  if (targetAge === 'child') {
    const childish = candidates.filter((voice) => voice.age === 'child' || voice.age === 'young');
    if (childish.length > 0) candidates = childish;
  } else {
    const grown = candidates.filter((voice) => voice.age !== 'child');
    if (grown.length > 0) candidates = grown;
  }

  const desiredTags = desiredTagsForSim(sim);
  const targetAgeIndex = voiceAgeOrder.indexOf(targetAge);

  let bestScore = -Infinity;
  let bestVoices: CastableVoice[] = [];
  candidates.forEach((voice) => {
    const ageDistance = Math.abs(voiceAgeOrder.indexOf(voice.age) - targetAgeIndex);
    const tagScore = voice.tags.reduce((score, tag) => score + (desiredTags.includes(tag) ? 2 : 0), 0);
    const score = tagScore - ageDistance;
    if (score > bestScore) {
      bestScore = score;
      bestVoices = [voice];
    } else if (score === bestScore) {
      bestVoices.push(voice);
    }
  });

  return bestVoices;
}
