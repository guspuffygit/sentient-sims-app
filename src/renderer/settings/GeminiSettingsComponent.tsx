import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';
import LocalizationSettingsComponent from './LocalizationSettingsComponent';

type GeminiSettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function GeminiSettingsComponent({ apiType, children }: GeminiSettingsComponentProps) {
  if (apiType !== ApiType.Gemini) {
    return <></>;
  }

  return (
    <>
      {children}
      <LocalizationSettingsComponent />
    </>
  );
}
