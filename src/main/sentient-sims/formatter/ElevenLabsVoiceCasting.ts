import { SentientSim } from '../models/SentientSim';
import { SimAge } from '../models/SimAge';
import { DialogueLine } from './PromptFormatter';
import { hashString } from './VoiceAssignment';

type VoiceGender = 'male' | 'female';
type VoiceAge = 'child' | 'young' | 'middle' | 'old';

type CastableVoice = {
  voiceId: string;
  name: string;
  gender: VoiceGender;
  age: VoiceAge;
  // Personality/intonation qualities of the voice, matched against sim traits and moods
  tags: string[];
};

// ElevenLabs premade voices with their published characteristics
export const elevenLabsVoiceCatalog: CastableVoice[] = [
  { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', age: 'young', tags: ['calm', 'warm'] },
  { voiceId: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', age: 'young', tags: ['confident', 'intense'] },
  { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', age: 'young', tags: ['soft', 'gentle'] },
  { voiceId: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', gender: 'female', age: 'young', tags: ['calm', 'gentle'] },
  { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', age: 'young', tags: ['emotional', 'cheerful'] },
  { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'female', age: 'young', tags: ['cheerful', 'warm'] },
  { voiceId: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', age: 'young', tags: ['seductive'] },
  { voiceId: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'female', age: 'middle', tags: ['confident', 'formal'] },
  { voiceId: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', age: 'young', tags: ['warm', 'cheerful'] },
  { voiceId: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', gender: 'female', age: 'child', tags: ['childish', 'cheerful'] },
  { voiceId: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', gender: 'female', age: 'young', tags: ['gentle', 'warm'] },
  { voiceId: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', age: 'middle', tags: ['warm', 'calm'] },
  { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena', gender: 'female', age: 'middle', tags: ['calm', 'gentle'] },
  { voiceId: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', gender: 'female', age: 'young', tags: ['soft', 'nervous'] },
  { voiceId: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', gender: 'female', age: 'young', tags: ['energetic', 'confident'] },
  { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', age: 'young', tags: ['warm', 'cheerful'] },
  { voiceId: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', gender: 'male', age: 'young', tags: ['calm', 'gentle'] },
  { voiceId: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', age: 'young', tags: ['energetic', 'casual'] },
  { voiceId: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', age: 'middle', tags: ['warm', 'calm'] },
  { voiceId: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', age: 'middle', tags: ['intense', 'gruff'] },
  { voiceId: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', gender: 'male', age: 'middle', tags: ['intense', 'energetic'] },
  { voiceId: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', gender: 'male', age: 'young', tags: ['nervous', 'soft'] },
  { voiceId: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', age: 'young', tags: ['confident', 'formal'] },
  { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', age: 'young', tags: ['deep', 'calm'] },
  { voiceId: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', age: 'middle', tags: ['confident', 'deep'] },
  { voiceId: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', gender: 'male', age: 'old', tags: ['calm', 'warm'] },
  { voiceId: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph', gender: 'male', age: 'middle', tags: ['formal', 'confident'] },
  { voiceId: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', gender: 'male', age: 'young', tags: ['energetic', 'cheerful'] },
  { voiceId: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', gender: 'male', age: 'old', tags: ['gentle', 'calm'] },
  { voiceId: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', age: 'middle', tags: ['formal', 'deep'] },
  { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', age: 'middle', tags: ['deep', 'confident'] },
  { voiceId: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male', age: 'old', tags: ['gruff', 'intense'] },
  { voiceId: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', age: 'young', tags: ['casual', 'gruff'] },
  { voiceId: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', gender: 'male', age: 'middle', tags: ['gruff', 'intense'] },
];

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

function simAgeToVoiceAge(age: SimAge): VoiceAge {
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

const voiceAgeOrder: VoiceAge[] = ['child', 'young', 'middle', 'old'];

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
 * Casts an ElevenLabs voice for a sim based on who they are: gender is a hard filter, age
 * closeness and trait/mood-derived voice qualities are scored, and ties break deterministically
 * on the sim's name so the same character always speaks with the same voice.
 */
export function castElevenLabsVoice(sim: SentientSim): string {
  const gender: VoiceGender = sim.gender.toLowerCase() === 'female' ? 'female' : 'male';
  const targetAge = simAgeToVoiceAge(sim.age);

  let candidates = elevenLabsVoiceCatalog.filter((voice) => voice.gender === gender);
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

  const chosen = bestVoices[hashString(sim.name) % bestVoices.length];
  return chosen.voiceId;
}

function findSimForSpeaker(speaker: string, sims: SentientSim[]): SentientSim | undefined {
  const speakerLower = speaker.toLowerCase();
  return sims.find((sim) => {
    const nameLower = sim.name.toLowerCase();
    return nameLower === speakerLower || nameLower.startsWith(`${speakerLower} `);
  });
}

/**
 * Attaches a personality-cast ElevenLabs voice id to each dialogue line whose speaker matches
 * one of the sims in the scene. Lines with no matching sim (e.g. Narrator) are left uncast and
 * fall back to the user's configured voice.
 */
export function castVoicesForLines(lines: DialogueLine[], sims: SentientSim[]): DialogueLine[] {
  return lines.map((line) => {
    const sim = findSimForSpeaker(line.speaker, sims);
    return sim ? { ...line, voiceId: castElevenLabsVoice(sim) } : line;
  });
}
