export enum ApiType {
  OpenAI = 'openai',
  SentientSimsAI = 'sentientsimsai',
  CustomAI = 'customai',
  NovelAI = 'novelai',
  KoboldAI = 'koboldai',
  Gemini = 'gemini',
  Kokoro = 'kokoro',
  ElevenLabs = 'elevenlabs',
}

export function ApiTypeFromValue(value: any): ApiType {
  switch (value) {
    case ApiType.SentientSimsAI:
      return ApiType.SentientSimsAI;
    case ApiType.CustomAI:
      return ApiType.CustomAI;
    case ApiType.KoboldAI:
      return ApiType.KoboldAI;
    case ApiType.NovelAI:
      return ApiType.NovelAI;
    case ApiType.Gemini:
      return ApiType.Gemini;
    case ApiType.Kokoro:
      return ApiType.Kokoro;
    case ApiType.ElevenLabs:
      return ApiType.ElevenLabs;
    default:
      return ApiType.OpenAI;
  }
}

export function ApiTypeName(apiType: ApiType): string {
  switch (apiType) {
    case ApiType.SentientSimsAI:
      return 'Sentient Sims AI';
    case ApiType.KoboldAI:
      return 'Kobold AI';
    case ApiType.NovelAI:
      return 'Novel AI';
    case ApiType.OpenAI:
      return 'OpenAI';
    case ApiType.Gemini:
      return 'Gemini';
    case ApiType.Kokoro:
      return 'Kokoro';
    case ApiType.ElevenLabs:
      return 'ElevenLabs';
    default:
      return 'AI';
  }
}
