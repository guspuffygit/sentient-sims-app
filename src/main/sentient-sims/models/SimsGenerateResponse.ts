import { OpenAICompatibleRequest } from './OpenAICompatibleRequest';

export type SimsGenerateResponse = {
  text: string;
  request: OpenAICompatibleRequest;
};
