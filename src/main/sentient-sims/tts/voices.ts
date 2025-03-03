/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';

export type Voice = {
  name: string;
  language: string;
  gender: string;
  traits?: string;
  targetQuality: string;
  overallGrade: string;
};

export const VOICES: Record<string, Voice> = {
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
};

const VOICE_DATA_URL =
  'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices';

async function getVoiceFile(id: keyof typeof VOICES): Promise<ArrayBufferLike> {
  await app.whenReady();

  const voicesPath: string = path.join(
    app.getPath('userData'),
    'kokoro-voices'
  );
  log.debug(`Kokoro Voices: ${voicesPath}`);

  const voiceFileName = `${id}.bin`;
  const url = `${VOICE_DATA_URL}/${voiceFileName}`;

  const file = path.join(voicesPath, voiceFileName);
  if (!fs.existsSync(voicesPath)) {
    fs.mkdirSync(voicesPath);
  }
  if (!fs.existsSync(file)) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error getting ${url}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(file, buffer);
  }

  return fs.readFileSync(file);
}

const VOICE_CACHE = new Map();
export async function getVoiceData(voice: string) {
  if (VOICE_CACHE.has(voice)) {
    return VOICE_CACHE.get(voice);
  }

  const buffer = new Float32Array(await getVoiceFile(voice));
  VOICE_CACHE.set(voice, buffer);
  return buffer;
}
