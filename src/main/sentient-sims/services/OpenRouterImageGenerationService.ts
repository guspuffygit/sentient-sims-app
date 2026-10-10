import log from 'electron-log';
import { openrouterDefaultImageModel } from '../constants';
import { ApiType } from '../models/ApiType';
import { ImageGenerationRequest, ImageGenerationResponse } from '../models/ImageGeneration';
import { ImageGenerationService } from './ImageGenerationService';
import { OpenRouterService } from './OpenRouterService';

type OpenRouterImagesResponse = {
  data?: { b64_json?: string }[];
};

// OpenRouter serves images at /images, where the OpenAI SDK's images.generate posts to
// /images/generations, so the request goes through the client's raw post instead.
export class OpenRouterImageGenerationService implements ImageGenerationService {
  private readonly openRouterService: OpenRouterService;

  constructor(openRouterService: OpenRouterService) {
    this.openRouterService = openRouterService;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = request.model ?? openrouterDefaultImageModel;

    log.debug(`OpenRouter image request: model=${model}`);

    const result = await this.openRouterService.getOpenAIClient().post<OpenRouterImagesResponse>('/images', {
      body: { model, prompt: request.prompt },
    });
    const imageBase64 = result.data?.at(0)?.b64_json;
    if (!imageBase64) {
      log.error(`No image data returned from OpenRouter image API:\n${JSON.stringify(result)}`);
      throw new Error('No image data returned from OpenRouter image API');
    }

    return {
      imageBase64,
      model,
      apiType: ApiType.OpenRouter,
    };
  }
}
