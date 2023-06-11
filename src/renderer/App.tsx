/* eslint-disable promise/always-return */
import './App.css';
import { Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Outlet } from 'react-router-dom';
import MenuBar from './MenuBar';
import WidgetWithOverlay from './WidgetWithOverlay';
import OpenAIKeyModal from './OpenAIKeyModal';
import AppCard from './AppCard';
import UpdateComponent from './UpdateComponent';
import SendLogButton from './SendLogButton';

export function Hello() {
  const [open, setOpen] = useState(false);

  // const handleButtonClick = () => {
  //   // setOpen(true);
  // };

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
        <p>Sentient Sims Companion App</p>
        <p>
          Keep this app running while you are playing the Sentient Sims Mod!
        </p>
      </AppCard>
      <UpdateComponent />
      <AppCard>
        <Typography sx={{ margin: 2 }}>
          Open AI Status: {openAIStatus.status}
        </Typography>
        <LoadingButton
          loading={openAIStatus.loading}
          onClick={testOpenAI}
          sx={{ marginRight: 2 }}
          color="primary"
          variant="outlined"
        >
          Test Open AI
        </LoadingButton>
        <OpenAIKeyModal open={open} onClose={handleClose} />
        <SendLogButton />
      </AppCard>
    </div>
  );
}

export default function App() {
  return (
    <Container maxWidth="lg" className="root">
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <MenuBar />
          <Outlet />
        </Grid>
        <Grid item xs={4}>
          <WidgetWithOverlay />
        </Grid>
      </Grid>
    </Container>
  );
}
