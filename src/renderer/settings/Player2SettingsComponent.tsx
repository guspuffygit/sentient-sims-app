import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';
import LocalizationSettingsComponent from './LocalizationSettingsComponent';

type Player2SettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function Player2SettingsComponent({ apiType, children }: Player2SettingsComponentProps) {
  if (apiType !== ApiType.Player2) {
    return <></>;
  }

  return (
    <>
      {children}
      <LocalizationSettingsComponent />
    </>
  );
}