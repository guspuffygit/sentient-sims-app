/* eslint-disable promise/always-return */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import icon from '../../assets/icon.png';

function Hello() {
  const [sendingLogs, setSendingLogs] = useState(false);
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
      .then((res) => res.json())
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

  useEffect(() => {
    testOpenAI();
  }, []);

  const sendLogs = async () => {
    setSendingLogs(true);
    await fetch('http://localhost:25148/send-logs');
    setSendingLogs(false);
  };

  return (
    <div>
      <div className="Hello">
        <img width="75" alt="icon" src={icon} />
      </div>
      <h1>Sentient Sims</h1>
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
      {/* <LoadingButton
        loading={sendingLogs}
        sx={{ marginRight: 2 }}
        color="secondary"
        variant="outlined"
        onClick={sendLogs}
      >
        Send Logs to Gus
      </LoadingButton> */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
