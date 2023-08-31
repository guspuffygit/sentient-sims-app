import { PromptRequest } from '../models/PromptRequest';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';

export interface GenerationService {
  sentientSimsGenerate(
    promptRequest: PromptRequest
  ): Promise<SimsGenerateResponse>;
}
