import { StageId } from '../pipeline/stages';
import { AIActionType } from './AIActionType';
import { ApiType } from './ApiType';
import { OpenAICompatibleRequest } from './OpenAICompatibleRequest';

// One row in the dev-mode AI log list. Deliberately free of the full prompt so the list
// can be polled cheaply; the prompt arrives with the detail fetch.
export type AIExchangeSummary = {
  id: number;
  at: string;
  label: string;
  actionType?: AIActionType;
  // Which pipeline stage this call was. Set wherever the call site knows it; the bench reads
  // rows by stage, which an action type cannot express (one carries up to three stages).
  stageId?: StageId;
  apiType?: ApiType;
  model?: string;
  durationMs: number;
  promptChars: number;
  responsePreview: string;
  // Set once the memory this call produced has been written
  memoryId?: string;
  // Present when the prompt did not fit its token budget and the user message was truncated
  promptOverflow?: { budgetTokens: number; requestedTokens: number; droppedTokens: number };
  error?: string;
};

export type AIExchangeDetail = AIExchangeSummary & {
  request: OpenAICompatibleRequest;
  responseText: string;
};
