export enum ElevenLabsOutputFormat {
  mp3_22050_32 = 'mp3_22050_32',
  mp3_44100_32 = 'mp3_44100_32',
  mp3_44100_64 = 'mp3_44100_64',
  mp3_44100_96 = 'mp3_44100_96',
  mp3_44100_128 = 'mp3_44100_128',
  mp3_44100_192 = 'mp3_44100_192',
  pcm_16000 = 'pcm_16000',
  pcm_22050 = 'pcm_22050',
  pcm_24000 = 'pcm_24000',
  pcm_44100 = 'pcm_44100',
  ulaw_8000 = 'ulaw_8000',
}

export enum ElevenLabsSpeechModel {
  ELEVEN_MULTILINGUAL_V2 = 'eleven_multilingual_v2',
  ELEVEN_FLASH_V2_5 = 'eleven_flash_v2_5',
  ELEVEN_FLASH_V2 = 'eleven_flash_v2',
  ELEVEN_MULTILINGUAL_STS_V2 = 'eleven_multilingual_sts_v2',
  ELEVEN_ENGLISH_STS_V2 = 'eleven_english_sts_v2',
}

export type ElevenLabsVoiceSettings = {
  stability?: number;
  similarity_boost?: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
};

export type ElevenLabsTTSSettings = {
  model: (string & {}) | ElevenLabsSpeechModel;
  voice: string;
  output_format: ElevenLabsOutputFormat;
  voice_settings: ElevenLabsVoiceSettings;
};

export const defaultElevenLabsTTSSettings: ElevenLabsTTSSettings = {
  model: ElevenLabsSpeechModel.ELEVEN_FLASH_V2_5,
  voice: '21m00Tcm4TlvDq8ikWAM',
  output_format: ElevenLabsOutputFormat.mp3_44100_128,
  voice_settings: {
    similarity_boost: 0,
    style: 0,
    use_speaker_boost: true,
    speed: 1.0,
  },
};

export function toSpeechModel(model?: string): ElevenLabsSpeechModel {
  if (
    Object.values(ElevenLabsSpeechModel).includes(
      model as ElevenLabsSpeechModel,
    )
  ) {
    return model as ElevenLabsSpeechModel;
  }

  throw Error(`Unknown ElevenLabsSpeechModel ${model}`);
}
