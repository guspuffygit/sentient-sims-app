import {
  defaultMythoMaxNsfwSystemPrompt,
  defaultMythoMaxSystemPrompt,
  defaultSystemPrompt,
  defaultWantsSystemPrompt,
} from './constants';
import { ApiType } from './models/ApiType';
import { SSEventType } from './models/InteractionEvents';

export function getSystemPrompt(
  eventType: SSEventType,
  apiType: ApiType
): string {
  if (eventType === SSEventType.WANTS) {
    return defaultWantsSystemPrompt;
  }

  if (eventType === SSEventType.WICKED_WHIMS) {
    return defaultMythoMaxNsfwSystemPrompt;
  }

  if (apiType === ApiType.OpenAI) {
    return defaultSystemPrompt;
  }

  return defaultMythoMaxSystemPrompt;
}
