import {
  geminiDefaultEmbeddingModel,
  geminiEmbeddingModels,
  openaiDefaultEmbeddingModel,
  openaiEmbeddingModels,
  sentientSimsAIDefaultEmbeddingModel,
  sentientSimsAIEmbeddingModels,
} from '../constants';
import { ApiType } from './ApiType';

// The model each embedding-capable provider uses when a config doesn't pin one
export function defaultEmbeddingModelFor(apiType: ApiType): string | undefined {
  switch (apiType) {
    case ApiType.OpenAI:
      return openaiDefaultEmbeddingModel;
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI:
      return sentientSimsAIDefaultEmbeddingModel;
    case ApiType.Gemini:
      return geminiDefaultEmbeddingModel;
    default:
      return undefined;
  }
}

// Embedding providers don't expose a filtered model listing endpoint, so the
// config UI offers a static list per provider instead of fetching one
export function embeddingModelSuggestions(apiType: ApiType): string[] {
  switch (apiType) {
    case ApiType.OpenAI:
      return openaiEmbeddingModels;
    case ApiType.SentientSimsAI:
    case ApiType.CustomAI:
      return sentientSimsAIEmbeddingModels;
    case ApiType.Gemini:
      return geminiEmbeddingModels;
    default:
      return [];
  }
}
