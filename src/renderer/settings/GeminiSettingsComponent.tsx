import { ApiType } from 'main/sentient-sims/models/ApiType';
import { PropsWithChildren } from 'react';
import LocalizationSettingsComponent from './LocalizationSettingsComponent'; // [NEW] Импорт компонента перевода

// [NEW] Component to manage Gemini-specific settings in the UI
type GeminiSettingsComponentProps = {
  apiType: ApiType;
} & PropsWithChildren;

export default function GeminiSettingsComponent({
  apiType,
  children,
}: GeminiSettingsComponentProps) {
  if (apiType !== ApiType.Gemini) {
    return <></>;
  }

  return (
    <>
      {children}
      <LocalizationSettingsComponent /> {/* [NEW] Добавляем галку для перевода */}
    </>
  );
}
