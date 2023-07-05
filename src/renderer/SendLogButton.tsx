import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Modal } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogSendInformationComponent from './LogSendInformationComponent';

export default function SendLogButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleSendLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:25148/send-logs');
      const responseJson = await response.json();
      if (response.ok) {
        setOpen(false);
        // eslint-disable-next-line no-alert
        alert(
          `Copy and paste this id into the #support channel in Discord:\n\n${responseJson.logId}`
        );
      } else {
        // eslint-disable-next-line no-alert
        alert(`Error sending logs:\n${JSON.stringify(responseJson, null, 2)}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Error sending logs:\n${JSON.stringify(err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <LogSendInformationComponent />
          <Divider sx={{ margin: 2 }} />
          <div
            style={{
              display: 'flex',
              marginTop: 10,
              justifyContent: 'space-between',
            }}
          >
            <div>
              <LoadingButton
                loading={loading}
                color="secondary"
                variant="contained"
                onClick={handleSendLogs}
              >
                Send Logs
              </LoadingButton>
            </div>
            <div>
              <LoadingButton
                loading={loading}
                onClick={handleClose}
                variant="contained"
              >
                Cancel
              </LoadingButton>
            </div>
          </div>
        </Box>
      </Modal>
      <div
        style={{
          display: 'flex',
          marginTop: 10,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Button onClick={handleClick}>Send Logs</Button>
        </div>
        <div>
          <Button
            color="secondary"
            onClick={() => navigate('/last-exception')}
            sx={{ margin: '10px' }}
          >
            Last Exception Browser
          </Button>
        </div>
      </div>
    </>
  );
}
