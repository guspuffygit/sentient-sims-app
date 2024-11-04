/* eslint-disable react/jsx-no-useless-fragment */
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';

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

  return <>{children}</>;
}
