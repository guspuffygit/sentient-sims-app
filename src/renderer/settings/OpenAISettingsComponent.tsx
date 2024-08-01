/* eslint-disable react/jsx-no-useless-fragment */
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import OpenAIModelSelection from 'renderer/OpenAIModelSelection';
import { useAIModels } from 'renderer/hooks/useAIModels';
import { AIEndpointComponent } from './AIEndpointComponent';

type OpenAISettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function OpenAISettingsComponent({
  apiType,
  children,
}: OpenAISettingsComponentProps) {
  const aiModels = useAIModels(ApiType.OpenAI);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChange = (value: string) => {
    aiModels.refetch();
  };

  if (apiType !== ApiType.OpenAI) {
    return <></>;
  }

  return (
    <>
      {children}
      <AIEndpointComponent
        type={ApiType.OpenAI}
        selectedApiType={ApiType.OpenAI}
        settingsEnum={SettingsEnum.OPENAI_ENDPOINT}
        label="OpenAI Endpoint"
        onChange={onChange}
      />
      <OpenAIModelSelection aiModels={aiModels} />
    </>
  );
}
