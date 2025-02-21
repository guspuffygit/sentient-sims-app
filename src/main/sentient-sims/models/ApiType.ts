export enum ApiType {
  OpenAI = 'openai',
  SentientSimsAI = 'sentientsimsai',
  CustomAI = 'customai',
  NovelAI = 'novelai',
  KoboldAI = 'koboldai',
  Gemini = 'gemini',
}

export function ApiTypeFromValue(value: any): ApiType | null {
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
    default:
      return ApiType.OpenAI;
  }
}

export function ApiTypeName(apiType: ApiType | null): string {
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
    default:
      return 'AI';
  }
}
