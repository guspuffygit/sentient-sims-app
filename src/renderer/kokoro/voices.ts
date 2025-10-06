import log from 'electron-log';

export type SentientSimsVoice = {
  name: string;
  language: string;
  gender: 'Female' | 'Male';
  traits?: string;
  targetQuality: string;
  overallGrade: string;
};

export const VOICES: Readonly<Record<string, SentientSimsVoice>> = Object.freeze({
  af_heart: {
    name: 'Heart',
    language: 'en-us',
    gender: 'Female',
    traits: '❤️',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  af_alloy: {
    name: 'Alloy',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  af_aoede: {
    name: 'Aoede',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_bella: {
    name: 'Bella',
    language: 'en-us',
    gender: 'Female',
    traits: '🔥',
    targetQuality: 'A',
    overallGrade: 'A-',
  },
  af_jessica: {
    name: 'Jessica',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  af_kore: {
    name: 'Kore',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_nicole: {
    name: 'Nicole',
    language: 'en-us',
    gender: 'Female',
    traits: '🎧',
    targetQuality: 'B',
    overallGrade: 'B-',
  },
  af_nova: {
    name: 'Nova',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  af_river: {
    name: 'River',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  af_sarah: {
    name: 'Sarah',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  af_sky: {
    name: 'Sky',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C-',
  },
  am_adam: {
    name: 'Adam',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'D',
    overallGrade: 'F+',
  },
  am_echo: {
    name: 'Echo',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_eric: {
    name: 'Eric',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_fenrir: {
    name: 'Fenrir',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_liam: {
    name: 'Liam',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_michael: {
    name: 'Michael',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_onyx: {
    name: 'Onyx',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  am_puck: {
    name: 'Puck',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C+',
  },
  am_santa: {
    name: 'Santa',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D-',
  },
  bf_emma: {
    name: 'Emma',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'B',
    overallGrade: 'B-',
  },
  bf_isabella: {
    name: 'Isabella',
    language: 'en-gb',
    gender: 'Female',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  bm_george: {
    name: 'George',
    language: 'en-gb',
    gender: 'Male',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  bm_lewis: {
    name: 'Lewis',
    language: 'en-gb',
    gender: 'Male',
    targetQuality: 'C',
    overallGrade: 'D+',
  },
  bf_alice: {
    name: 'Alice',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bf_lily: {
    name: 'Lily',
    language: 'en-gb',
    gender: 'Female',
    traits: '🚺',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bm_daniel: {
    name: 'Daniel',
    language: 'en-gb',
    gender: 'Male',
    traits: '🚹',
    targetQuality: 'C',
    overallGrade: 'D',
  },
  bm_fable: {
    name: 'Fable',
    language: 'en-gb',
    gender: 'Male',
    traits: '🚹',
    targetQuality: 'B',
    overallGrade: 'C',
  },
  tara: {
    name: 'Tara',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  leah: {
    name: 'Leah',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  jess: {
    name: 'Jess',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  mia: {
    name: 'Mia',
    language: 'en-us',
    gender: 'Female',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  leo: {
    name: 'Leo',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  dan: {
    name: 'Dan',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'A',
    overallGrade: 'A',
  },
  zac: {
    name: 'Zac',
    language: 'en-us',
    gender: 'Male',
    targetQuality: 'A',
    overallGrade: 'A',
  },
});

const VOICE_DATA_URL = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices';

async function getVoiceFile(id: keyof typeof VOICES): Promise<ArrayBufferLike> {
  const url = `${VOICE_DATA_URL}/${id}.bin`;

  let cache;
  try {
    cache = await caches.open('kokoro-voices');
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      return await cachedResponse.arrayBuffer();
    }
  } catch (e) {
    log.warn('Unable to open cache', e);
  }

  // No cache, or cache failed to open. Fetch the file.
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  if (cache) {
    try {
      // NOTE: We use `new Response(buffer, ...)` instead of `response.clone()` to handle LFS files
      await cache.put(
        url,
        new Response(buffer, {
          headers: response.headers,
        }),
      );
    } catch (e) {
      log.warn('Unable to cache file', e);
    }
  }

  return buffer;
}

const VOICE_CACHE = new Map();
export async function getVoiceData(voice: keyof typeof VOICES) {
  if (VOICE_CACHE.has(voice)) {
    return VOICE_CACHE.get(voice);
  }

  const buffer = new Float32Array(await getVoiceFile(voice));
  VOICE_CACHE.set(voice, buffer);
  return buffer;
}
