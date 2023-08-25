import { MythoMaxPromptFormatter } from './MythoMaxPromptFormatter';
import { OpenAIPromptFormatter } from './OpenAIPromptFormatter';
import { PromptFormatter } from './PromptFormatter';

export function createPromptFormatter(
  customLLMEnabled: boolean
): PromptFormatter {
  if (customLLMEnabled) {
    return new MythoMaxPromptFormatter();
  }

  return new OpenAIPromptFormatter();
}
