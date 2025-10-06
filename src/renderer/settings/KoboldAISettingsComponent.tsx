import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { AIEndpointComponent } from './AIEndpointComponent';

type KoboldAISettingsProps = {
  apiType: ApiType;
};

export function KoboldAISettingsComponent({ apiType }: KoboldAISettingsProps) {
  if (apiType !== ApiType.KoboldAI) {
    return <></>;
  }

  return (
    <AIEndpointComponent
      type={ApiType.KoboldAI}
      selectedApiType={apiType}
      settingsEnum={SettingsEnum.KOBOLDAI_ENDPOINT}
    />
  );
}
