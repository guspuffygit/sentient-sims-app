import { SentientSimsAIError } from '../exceptions/SentientSimsAIError';
import { AIModel } from '../models/AIModel';
import { ApiType } from '../models/ApiType';
import { InteractionEventResult } from '../models/InteractionEventResult';
import { InteractionEvents } from '../models/InteractionEvents';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { DirectedSceneRequest } from '../models/DirectedSceneRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class AIClient extends ApiClient {
  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const response = await axiosClient.post<SimsGenerateResponse>(`${this.apiUrl}/ai/v2/generate`, request);
    return response.data;
  }

  async interactionEvent(event: InteractionEvents): Promise<InteractionEventResult> {
    const response = await axiosClient.post<InteractionEventResult>(`${this.apiUrl}/ai/v2/event/interaction`, event);
    return response.data;
  }

  async directedScene(request: DirectedSceneRequest): Promise<InteractionEventResult> {
    const response = await axiosClient.post<InteractionEventResult>(
      `${this.apiUrl}/ai/v2/event/directed-scene`,
      request,
    );
    return response.data;
  }

  async getModels(apiType?: ApiType): Promise<AIModel[]> {
    const query = apiType ? `?${new URLSearchParams({ apiType: apiType.toString() }).toString()}` : '';
    const response = await fetch(`${this.apiUrl}/ai/v2/models${query}`);

    if (!response.ok) {
      try {
        const errorResponse = (await response.json()) as { error?: string };
        const errorMessage = errorResponse.error || 'Unknown JSON error occurred';
        throw new SentientSimsAIError(`Error getting models: ${errorMessage}`);
      } catch (e: unknown) {
        if (e instanceof SentientSimsAIError) {
          throw e;
        }

        // If JSON parsing fails, fall back to plain text error message
        const textMessage = await response.text();
        throw new Error(`Error getting models message: ${textMessage}`, { cause: e });
      }
    }

    return (await response.json()) as AIModel[];
  }
}
