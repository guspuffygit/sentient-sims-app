import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import AppCard from './AppCard';
import OpenAIModelSelection from './OpenAIModelSelection';
import useApiKeyAITest from './hooks/useOpenAITest';
import APIKeyModal from './APIKeyModal';

export type ApiKeyAIComponentProperties = {
  setting: SettingsEnum;
  aiName: string;
};

export default function ApiKeyAIComponent({
  setting,
  aiName,
}: ApiKeyAIComponentProperties) {
  const [open, setOpen] = useState(false);
  const { aiStatus, testAI } = useApiKeyAITest();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AppCard>
      <div
        style={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <Typography sx={{ marginBottom: 3 }}>
            {aiName} Status: {aiStatus.status}
          </Typography>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <LoadingButton
            loading={aiStatus.loading}
            onClick={() => testAI()}
            sx={{ marginRight: 2 }}
            color="primary"
            variant="outlined"
          >
            Test
          </LoadingButton>
        </div>
        <div>
          <LoadingButton
            loading={aiStatus.loading}
            onClick={() => setOpen(true)}
            sx={{ marginRight: 2 }}
            color="secondary"
            variant="outlined"
          >
            Edit {aiName} Key
          </LoadingButton>
        </div>
        <OpenAIModelSelection />
      </div>

      <APIKeyModal
        open={open}
        onClose={handleClose}
        setting={setting}
        aiName={aiName}
      />
    </AppCard>
  );
}
