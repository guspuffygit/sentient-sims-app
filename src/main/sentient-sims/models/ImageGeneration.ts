import { openaiDefaultImageModel, openaiImageModels } from '../constants';
import { ApiType } from './ApiType';

// 'dds' returns a ready-to-write DXT1 painting texture for the game mod;
// absent/'png' returns the provider's PNG untouched (older mods send no format)
export type ImageOutputFormat = 'png' | 'dds';

export type ImageGenerationRequest = {
  prompt: string;
  // Route to a specific image provider config; missing means the default config
  configId?: string;
  model?: string;
  size?: string;
  format?: ImageOutputFormat;
  // Small painting context (artist name, recipe style) kept on the record
  metadata?: Record<string, unknown>;
};

export type ImageGenerationResponse = {
  imageBase64: string;
  model?: string;
  apiType: ApiType;
  // SSLocalWork texture id of the stored painting record, so the mod writes
  // the texture under an id the database can always map back to the artwork;
  // only set for 'dds' requests when a save database is loaded
  textureInstanceId?: string;
};

// The model each image-capable provider uses when a config doesn't pin one
export function defaultImageModelFor(apiType: ApiType): string | undefined {
  switch (apiType) {
    case ApiType.OpenAI:
      return openaiDefaultImageModel;
    default:
      return undefined;
  }
}

// Image providers don't expose a filtered model listing endpoint, so the
// config UI offers a static list per provider instead of fetching one
export function imageModelSuggestions(apiType: ApiType): string[] {
  switch (apiType) {
    case ApiType.OpenAI:
      return openaiImageModels;
    default:
      return [];
  }
}
