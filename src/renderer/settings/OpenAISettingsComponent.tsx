/* eslint-disable react/jsx-no-useless-fragment */
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import AIModelSelection from 'renderer/AIModelSelection';
import {
  openaiDefaultEndpoint,
  openaiDefaultModel,
} from 'main/sentient-sims/constants';
import { AIEndpointComponent } from './AIEndpointComponent';

type OpenAISettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function OpenAISettingsComponent({
  apiType,
  children,
}: OpenAISettingsComponentProps) {
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
      />
      <AIModelSelection
        apiType={apiType}
        defaultModel={openaiDefaultModel}
        defaultEndpoint={openaiDefaultEndpoint}
        modelSetting={SettingsEnum.OPENAI_MODEL}
        endpointSetting={SettingsEnum.OPENAI_ENDPOINT}
      />
    </>
  );
}
