import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { AIHealthCheckResponse } from '../models/AIHealthCheckResponse';

export interface GenerationService {
  serviceUrl(): string;
  sentientSimsGenerate(
    request: OpenAICompatibleRequest
  ): Promise<SimsGenerateResponse>;
  healthCheck(apiKey?: string): Promise<AIHealthCheckResponse>;
}
