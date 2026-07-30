import log from 'electron-log';
import { ImageGenerateParamsNonStreaming } from 'openai/resources/images.js';
import { openaiDefaultImageModel } from '../constants';
import { ApiType } from '../models/ApiType';
import { ImageGenerationRequest, ImageGenerationResponse } from '../models/ImageGeneration';
import { ImageGenerationService } from './ImageGenerationService';
import { OpenAIService } from './OpenAIService';

export class OpenAIImageGenerationService implements ImageGenerationService {
  private readonly openAIService: OpenAIService;

  constructor(openAIService: OpenAIService) {
    this.openAIService = openAIService;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = request.model ?? openaiDefaultImageModel;
    const params: ImageGenerateParamsNonStreaming = {
      model,
      prompt: request.prompt,
      n: 1,
    };
    if (request.size) {
      params.size = request.size as ImageGenerateParamsNonStreaming['size'];
    }
    // gpt-image models always return base64; dall-e models return URLs unless asked
    if (model.startsWith('dall-e')) {
      params.response_format = 'b64_json';
    }

    log.debug(`OpenAI image request: model=${model}, size=${params.size ?? 'default'}`);

    const result = await this.openAIService.getOpenAIClient().images.generate(params);
    const imageBase64 = result.data?.at(0)?.b64_json;
    if (!imageBase64) {
      log.error(`No image data returned from OpenAI image API:\n${JSON.stringify(result)}`);
      throw new Error('No image data returned from OpenAI image API');
    }

    return {
      imageBase64,
      model,
      apiType: ApiType.OpenAI,
    };
  }
}
