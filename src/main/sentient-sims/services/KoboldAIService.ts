import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';

type KoboldAIModelResponse = {
  result: string;
};

export class KoboldAIService implements GenerationService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  serviceUrl(): string {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_HOSTNAME) as string;
  }

  async generate(prompt: string, maxResponseTokens: number): Promise<string> {
    const url = `${this.serviceUrl()}/api/v1/generate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_context_length: 4094,
        max_length: maxResponseTokens,
        rep_pen: 1.1,
        rep_pen_range: 4094,
        temperature: 0.8,
        top_p: 0.9,
        top_k: 40,
        typical: 1,
      }),
    });

    const result = await response.json();

    return result.results[0].text;
  }

  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = request.messages.map((m) => m.content).join('\n');
    log.debug(`prompt: ${JSON.stringify(prompt)}`);

    const response = await this.generate(prompt, request.maxResponseTokens);
    return {
      text: response,
      request,
    };
  }

  async healthCheck() {
    try {
      const models = await this.getModels();
      const currentModel = models[0].name.toLowerCase();

      if (currentModel.includes('read only')) {
        return {
          status:
            'Error: No AI loaded in Kobold AI yet, please load Mythomax into Kobold AI',
        };
      }
      if (!currentModel.includes('mythomax')) {
        return {
          status:
            'Kobold AI OK. Warning, using a model other than Mythomax will not work with Sentient Sims',
        };
      }
      return {
        status: 'Kobold AI OK',
      };
    } catch (e: any) {
      log.error('Error checking KoboldAI health', e);
      sendPopUpNotification(e?.message);
      return {
        status: 'Kobold AI Not accessible',
      };
    }
  }

  // KoboldAI Can only return the result of the current loaded model
  async getModels(): Promise<AIModel[]> {
    const url = `${this.serviceUrl()}/api/v1/model`;
    log.debug(`Grabbing koboldai model: ${url}`);
    try {
      const response = await fetch(url);
      const modelResponse: KoboldAIModelResponse = await response.json();
      const currentModel = modelResponse.result.toLowerCase();
      log.debug(`Current KoboldAI Model: ${currentModel}`);

      return [
        {
          name: modelResponse.result,
          displayName: modelResponse.result,
        },
      ];
    } catch (e: any) {
      log.error('Error getting KoboldAI models', e);

      throw e;
    }
  }
}
