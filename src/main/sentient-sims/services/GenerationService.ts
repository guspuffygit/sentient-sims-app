import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { AIHealthCheckResponse } from '../models/AIHealthCheckResponse';
import { AIModel } from '../models/AIModel';

export interface GenerationService {
  serviceUrl(): string;
  sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse>;
  healthCheck(apiKey?: string): Promise<AIHealthCheckResponse>;
  getModels(): Promise<AIModel[]>;
}
