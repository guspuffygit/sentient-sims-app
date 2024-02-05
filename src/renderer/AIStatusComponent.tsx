import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import CustomLLMComponent from './CustomLLMComponent';
import useSetting from './hooks/useSetting';
import ApiKeyAIComponent from './ApiKeyAIComponent';

export default function AIStatusComponent() {
  const apiType = useSetting(
    SettingsEnum.AI_API_TYPE,
    ApiType.OpenAI.toString()
  );
  if (
    apiType.value === ApiType.SentientSimsAI ||
    apiType.value === ApiType.CustomAI
  ) {
    return <CustomLLMComponent />;
  }

  if (apiType.value === ApiType.NovelAI) {
    return (
      <ApiKeyAIComponent setting={SettingsEnum.NOVELAI_KEY} aiName="NovelAI" />
    );
  }

  return (
    <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
  );
}
