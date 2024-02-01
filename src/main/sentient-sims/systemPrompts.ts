import {
  defaultMythoMaxNsfwSystemPrompt,
  defaultMythoMaxSystemPrompt,
  defaultSystemPrompt,
  defaultWantsSystemPrompt,
} from './constants';
import { AIType } from './models/AIType';
import { SSEventType } from './models/InteractionEvents';

export function getSystemPrompt(
  eventType: SSEventType,
  aiType: AIType
): string {
  if (eventType === SSEventType.WANTS) {
    return defaultWantsSystemPrompt;
  }

  if (eventType === SSEventType.WICKED_WHIMS) {
    return defaultMythoMaxNsfwSystemPrompt;
  }

  if (aiType === AIType.OPENAI) {
    return defaultSystemPrompt;
  }

  return defaultMythoMaxSystemPrompt;
}
