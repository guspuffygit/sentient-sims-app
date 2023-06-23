import { Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import AppCard from './AppCard';
import OpenAIKeyModal from './OpenAIKeyModal';
import OpenAIModelSelection from './OpenAIModelSelection';

export default function OpenAIComponent() {
  const [open, setOpen] = useState(false);

  const [openAIStatus, setOpenAIStatus] = useState({
    status: '',
    loading: false,
  });

  const testOpenAI = () => {
    setOpenAIStatus({
      status: '',
      loading: true,
    });
    fetch('http://localhost:25148/test-open-ai')
      .then((res) => {
        // if (res.status === 400) {
        //   setOpen(true);
        // }
        return res.json();
      })
      // eslint-disable-next-line promise/always-return
      .then((response: any) => {
        setOpenAIStatus({
          status: response.status,
          loading: false,
        });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err: any) => {
        setOpenAIStatus({
          status: 'Error getting Open AI Status',
          loading: false,
        });
      });
  };

  const handleClose = () => {
    setOpen(false);
    testOpenAI();
  };

  useEffect(() => {
    testOpenAI();
  }, []);

  return (
    <div>
      <AppCard>
        <Typography sx={{ marginBottom: 3 }}>
          Open AI Status: {openAIStatus.status}
        </Typography>
        <div
          style={{
            display: 'flex',
            // marginTop: 10,
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
              Test Open AI
            </LoadingButton>
          </div>
          <OpenAIModelSelection />
        </div>

        <OpenAIKeyModal open={open} onClose={handleClose} />
      </AppCard>
    </div>
  );
}
