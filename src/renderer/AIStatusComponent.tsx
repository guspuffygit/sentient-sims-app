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
  switch (apiType.value) {
    case ApiType.SentientSimsAI:
      return <CustomLLMComponent aiName="Sentient Sims AI" />;
    case ApiType.CustomAI:
      return <CustomLLMComponent aiName="Custom" />;
    case ApiType.KoboldAI:
      return <CustomLLMComponent aiName="Kobold AI" />;
    case ApiType.NovelAI:
      return (
        <ApiKeyAIComponent
          setting={SettingsEnum.NOVELAI_KEY}
          aiName="NovelAI"
        />
      );
    default:
      return (
        <ApiKeyAIComponent setting={SettingsEnum.OPENAI_KEY} aiName="OpenAI" />
      );
  }
}
