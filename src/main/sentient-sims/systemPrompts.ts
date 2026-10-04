import {
  classicChatPrompt,
  classicMythoMaxSystemPrompt,
  classicSystemPrompt,
  defaultChatPrompt,
  defaultMythoMaxNsfwSystemPrompt,
  defaultMythoMaxSystemPrompt,
  defaultSystemPrompt,
  defaultWantsSystemPrompt,
  defaultWickedWhimsSceneSystemPrompt,
} from './constants';
import { ApiType } from './models/ApiType';
import { SSEventType } from './models/InteractionEvents';

export function getSystemPrompt(eventType: SSEventType, apiType: ApiType, directedScenes: boolean): string {
  if (eventType === SSEventType.CHAT || eventType === SSEventType.CHAT_CONTINUE) {
    return directedScenes ? defaultChatPrompt : classicChatPrompt;
  }

  if (eventType === SSEventType.WANTS) {
    return defaultWantsSystemPrompt;
  }

  if (eventType === SSEventType.WICKED_WHIMS) {
    // Classic playback airs one Narrator utterance, so prose fits there; directed playback
    // parses Name: "line" rows and needs the prompt to ask for them
    return directedScenes ? defaultWickedWhimsSceneSystemPrompt : defaultMythoMaxNsfwSystemPrompt;
  }

  if (apiType === ApiType.OpenAI) {
    return directedScenes ? defaultSystemPrompt : classicSystemPrompt;
  }

  return directedScenes ? defaultMythoMaxSystemPrompt : classicMythoMaxSystemPrompt;
}
