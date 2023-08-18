import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import CustomLLMComponent from './CustomLLMComponent';
import useSetting from './hooks/useSetting';
import OpenAIComponent from './OpenAIComponent';

export default function AIStatusComponent() {
  const customLLMEnabled = useSetting(SettingsEnum.CUSTOM_LLM_ENABLED, false);
  if (customLLMEnabled.value) {
    return <CustomLLMComponent />;
  }

  return <OpenAIComponent />;
}
