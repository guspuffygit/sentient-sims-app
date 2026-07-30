import { ImageGenerationRequest, ImageGenerationResponse } from '../models/ImageGeneration';

// Implemented by each AI provider capable of generating images. Responses
// always carry the image as base64 so callers never deal with provider URLs.
export interface ImageGenerationService {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}
