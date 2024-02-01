import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { sentientSimsAIHost } from 'main/sentient-sims/constants';
import AppCard from './AppCard';
import { useCustomLLMHealth } from './hooks/useCustomLLM';
import useSetting from './hooks/useSetting';

export default function CustomLLMComponent() {
  const customLLMHostname = useSetting(SettingsEnum.CUSTOM_LLM_HOSTNAME, false);
  const { customLLMStatus, testCustomLLM } = useCustomLLMHealth();

  let label = 'Sentient Sims AI';
  if (customLLMHostname.value !== sentientSimsAIHost) {
    label = 'Custom Remote/Local LLM';
  }

  return (
    <AppCard>
      <Typography sx={{ marginBottom: 3 }}>
        {label} Status: {customLLMStatus.status}
      </Typography>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <LoadingButton
            loading={customLLMStatus.loading}
            onClick={() => {
              testCustomLLM();
            }}
            color="primary"
            variant="outlined"
          >
            Test
          </LoadingButton>
        </div>
      </div>
    </AppCard>
  );
}
