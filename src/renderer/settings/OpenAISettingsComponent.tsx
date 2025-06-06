/* eslint-disable react/jsx-no-useless-fragment */
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';

type OpenAISettingsComponentProps = {
  apiType: ApiType;
  selectedApiType: ApiType;
} & PropsWithChildren;

export default function OpenAICompatibleSettingsComponent({
  apiType,
  selectedApiType,
  children,
}: OpenAISettingsComponentProps) {
  if (apiType !== selectedApiType) {
    return <></>;
  }

  return <>{children}</>;
}
