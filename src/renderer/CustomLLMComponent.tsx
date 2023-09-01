import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import AppCard from './AppCard';
import { useCustomLLMHealth, useCustomLLMWorkers } from './hooks/useCustomLLM';
import CustomLLMWorkersModal from './CustomLLMWorkersModal';
import useSetting from './hooks/useSetting';
import { SettingsEnum } from '../main/sentient-sims/models/SettingsEnum';
import { sentientSimsAIHost } from '../main/sentient-sims/constants';

export default function CustomLLMComponent() {
  const customLLMHostname = useSetting(SettingsEnum.CUSTOM_LLM_HOSTNAME, false);
  const { customLLMStatus, testCustomLLM } = useCustomLLMHealth();
  const { workers, workersLoading, getCustomLLMWorkers } =
    useCustomLLMWorkers();
  const [open, setOpen] = useState(false);

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
              getCustomLLMWorkers();
            }}
            color="primary"
            variant="outlined"
          >
            Test
          </LoadingButton>
        </div>
        <div>
          <LoadingButton
            loading={workersLoading}
            variant="outlined"
            color="secondary"
            onClick={() => {
              if (workers.length > 0) {
                setOpen(true);
              }
            }}
          >
            {workers.length} worker/s
          </LoadingButton>
        </div>
      </div>
      <CustomLLMWorkersModal
        open={open}
        onClose={() => setOpen(false)}
        workers={workers}
      />
    </AppCard>
  );
}
