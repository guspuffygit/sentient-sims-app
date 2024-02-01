import { InteractionEventResult } from '../models/InteractionEventResult';
import { SSEvent } from '../models/InteractionEvents';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { ApiClient } from './ApiClient';

export class AIClient extends ApiClient {
  async sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse> {
    const response = await fetch(`${this.apiUrl}/ai/v2/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async interactionEvent(event: SSEvent): Promise<InteractionEventResult> {
    const response = await fetch(`${this.apiUrl}/ai/v2/event/interaction`, {
      method: 'POST',
      body: JSON.stringify(event),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }
}
