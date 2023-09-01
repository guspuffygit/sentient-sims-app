import { MythoMaxPromptFormatter } from './MythoMaxPromptFormatter';
import { OpenAIPromptFormatter } from './OpenAIPromptFormatter';

export function createPromptFormatter(
  customLLMEnabled: boolean
): OpenAIPromptFormatter | MythoMaxPromptFormatter {
  if (customLLMEnabled) {
    return new MythoMaxPromptFormatter();
  }

  return new OpenAIPromptFormatter();
}
