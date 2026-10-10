import { ApiType } from '../models/ApiType';
import { OpenAIEmbeddingService } from './EmbeddingService';

// OpenRouter's /embeddings endpoint speaks the OpenAI API, so only the endpoint, key and
// model differ from OpenAIEmbeddingService.
export class OpenRouterEmbeddingService extends OpenAIEmbeddingService {
  get model(): string {
    return this.ctx.embeddingProviderConfigs.modelFor(ApiType.OpenRouter);
  }

  protected getKey(): string | undefined {
    return this.ctx.settings.openrouterKey || process.env.OPENROUTER_KEY || undefined;
  }

  protected baseURL(): string {
    return this.ctx.settings.openrouterEndpoint;
  }

  // Some OpenRouter providers (mistral-embed) answer a base64 request with plain floats,
  // which the SDK's base64 decoder turns into an empty vector.
  protected encodingFormat(): 'float' | undefined {
    return 'float';
  }
}
