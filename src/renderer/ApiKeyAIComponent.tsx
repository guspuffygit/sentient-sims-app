import { Box } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import APIKeyInput from './APIKeyInput';
import useSetting from './hooks/useSetting';

export type ApiKeyAIComponentProperties = {
  setting: SettingsEnum;
  aiName: string;

  optional?: boolean;
};

export default function ApiKeyAIComponent({ setting, aiName, optional = false }: ApiKeyAIComponentProperties) {
  const apiKeySetting = useSetting(setting, '');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 2,
      }}
    >
      <APIKeyInput setting={apiKeySetting} aiName={aiName} optional={optional} />
    </Box>
  );
}
