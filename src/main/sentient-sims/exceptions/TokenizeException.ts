import { VLLMRTokenizeResponse } from '../models/VLLMChatCompletionRequest';

export class TokenizeException extends Error {
  constructor(public status?: VLLMRTokenizeResponse) {
    super(
      `tokenizeMessages response is not valid: ${JSON.stringify(status, null, 2)}`,
    );
    this.name = 'TokenizeException';
  }
}
