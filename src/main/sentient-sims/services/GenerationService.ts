import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { AIHealthCheckResponse } from '../models/AIHealthCheckResponse';
import { AIModel } from '../models/AIModel';

// How a caller can end one provider call early: a signal that fires when the scene the call
// serves is over, and a cap on how long the call may take before the game gives up on it
export type GenerationCallControl = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface GenerationService {
  serviceUrl(): string;
  sentientSimsGenerate(
    request: OpenAICompatibleRequest,
    control?: GenerationCallControl,
  ): Promise<SimsGenerateResponse>;
  healthCheck(apiKey?: string): Promise<AIHealthCheckResponse>;
  getModels(): Promise<AIModel[]>;
}
