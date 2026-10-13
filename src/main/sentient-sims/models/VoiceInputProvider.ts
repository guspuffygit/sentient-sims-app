import {
  defaultVoiceInputModel,
  geminiDefaultTranscriptionModel,
  geminiTranscriptionModels,
  openaiDefaultEndpoint,
  openaiDefaultTranscriptionModel,
  openaiTranscriptionModels,
  openrouterDefaultTranscriptionModel,
  openrouterTranscriptionModels,
} from '../constants';
import { ApiType, ApiTypeName } from './ApiType';

// Any OpenAI-compatible /audio/transcriptions server with its own endpoint, key and
// model settings (Groq, a local faster-whisper or speaches server)
export const customVoiceInputProvider = 'custom';

export type VoiceInputProvider =
  | ApiType.SentientSimsAI
  | ApiType.OpenAI
  | ApiType.OpenRouter
  | ApiType.Gemini
  | typeof customVoiceInputProvider;

export const voiceInputProviders: VoiceInputProvider[] = [
  ApiType.SentientSimsAI,
  ApiType.OpenAI,
  ApiType.OpenRouter,
  ApiType.Gemini,
  customVoiceInputProvider,
];

// Older builds saved only sentientsimsai or openai, where openai pointed at any endpoint;
// with the endpoint given, an openai value aimed away from OpenAI reads as a custom server
export function voiceInputProviderFromValue(value: unknown, endpoint?: string): VoiceInputProvider {
  switch (value) {
    case ApiType.OpenAI:
      return endpoint !== undefined && endpoint.trim() !== openaiDefaultEndpoint
        ? customVoiceInputProvider
        : ApiType.OpenAI;
    case ApiType.OpenRouter:
      return ApiType.OpenRouter;
    case ApiType.Gemini:
      return ApiType.Gemini;
    case customVoiceInputProvider:
      return customVoiceInputProvider;
    default:
      return ApiType.SentientSimsAI;
  }
}

export function voiceInputProviderName(provider: VoiceInputProvider): string {
  return provider === customVoiceInputProvider ? 'OpenAI-compatible endpoint' : ApiTypeName(provider);
}

// Sentient Sims AI picks its own model server side
export function defaultVoiceInputModelFor(provider: VoiceInputProvider): string | undefined {
  switch (provider) {
    case ApiType.OpenAI:
      return openaiDefaultTranscriptionModel;
    case ApiType.OpenRouter:
      return openrouterDefaultTranscriptionModel;
    case ApiType.Gemini:
      return geminiDefaultTranscriptionModel;
    case customVoiceInputProvider:
      return defaultVoiceInputModel;
    default:
      return undefined;
  }
}

export function voiceInputModelSuggestions(provider: VoiceInputProvider): string[] {
  switch (provider) {
    case ApiType.OpenAI:
      return openaiTranscriptionModels;
    case ApiType.OpenRouter:
      return openrouterTranscriptionModels;
    case ApiType.Gemini:
      return geminiTranscriptionModels;
    case customVoiceInputProvider:
      return [defaultVoiceInputModel];
    default:
      return [];
  }
}
