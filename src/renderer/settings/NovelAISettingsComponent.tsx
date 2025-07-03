/* eslint-disable react/jsx-no-useless-fragment */
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';

type NovelAISettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function NovelAISettingsComponent({
  apiType,
  children,
}: NovelAISettingsComponentProps) {
  if (apiType !== ApiType.NovelAI) {
    return <></>;
  }

  return <>{children}</>;
}
