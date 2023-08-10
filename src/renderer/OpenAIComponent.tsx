import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import AppCard from './AppCard';
import OpenAIKeyModal from './OpenAIKeyModal';
import OpenAIModelSelection from './OpenAIModelSelection';
import useOpenAITest from './hooks/useOpenAITest';

export default function OpenAIComponent() {
  const [open, setOpen] = useState(false);
  const { openAIStatus, testOpenAI } = useOpenAITest();

  const handleClose = () => {
    setOpen(false);
    testOpenAI();
  };

  return (
    <div>
      <AppCard>
        <Typography sx={{ marginBottom: 3 }}>
          Open AI Status: {openAIStatus.status}
        </Typography>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <LoadingButton
              loading={openAIStatus.loading}
              onClick={testOpenAI}
              sx={{ marginRight: 2 }}
              color="primary"
              variant="outlined"
            >
              Test
            </LoadingButton>
          </div>
          <OpenAIModelSelection />
        </div>

        <OpenAIKeyModal open={open} onClose={handleClose} />
      </AppCard>
    </div>
  );
}
