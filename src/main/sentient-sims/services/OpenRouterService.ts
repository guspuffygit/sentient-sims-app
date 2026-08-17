import log from 'electron-log';
import { AIModel } from '../models/AIModel';
import { buildOpenRouterModels } from '../models/OpenRouterModels';
import { OpenAIService } from './OpenAIService';

export class OpenRouterKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterKeyNotSetError';
  }
}

// OpenRouter speaks the OpenAI API, so this reuses OpenAIService wholesale and only swaps
// in the OpenRouter endpoint, key, and model. Keeping the settings separate means a user
// can keep an OpenAI key configured and switch providers without retyping either one.
export class OpenRouterService extends OpenAIService {
  serviceUrl(): string {
    return this.ctx.settings.openrouterEndpoint;
  }

  getOpenAIModel(): string {
    return this.ctx.settings.openrouterModel;
  }

  getOpenAIKey(): string | undefined {
    const keyFromSettings = this.ctx.settings.openrouterKey;
    if (keyFromSettings) {
      log.debug('Using openrouter key from settings');
      return keyFromSettings;
    }

    const keyFromEnv = process.env.OPENROUTER_KEY;
    if (keyFromEnv) {
      log.debug('Using openrouter key from environment');
      return keyFromEnv;
    }

    throw new OpenRouterKeyNotSetError('No OpenRouter Key set, Edit OpenRouter Key to set it');
  }

  // OpenRouter routes to whichever provider is serving the model, and not all of them
  // accept a strict json_schema response format, so guided choice stays a plain prompt.
  protected supportsJsonSchema(): boolean {
    return false;
  }

  async getModels(): Promise<AIModel[]> {
    const models = await this.getOpenAIClient().models.list();

    return buildOpenRouterModels(models.data.map((model) => model.id));
  }
}
