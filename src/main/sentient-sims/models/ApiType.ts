export enum ApiType {
  OpenAI = 'openai',
  SentientSimsAI = 'sentientsimsai',
  CustomAI = 'customai',
  NovelAI = 'novelai',
  KoboldAI = 'koboldai',
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
    default:
      return 'AI';
  }
}
