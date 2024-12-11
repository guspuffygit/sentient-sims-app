import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Grid, Modal, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApiUrl } from 'main/sentient-sims/constants';
import { SendLogsRequest } from 'main/sentient-sims/models/SendLogsRequest';
import LogSendInformationComponent from './LogSendInformationComponent';
import SpaceBetweenDiv from './components/SpaceBetweenDiv';

export default function SendLogButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [errorDescription, setErrorDescription] = useState('');

  const handleClick = () => {
    setOpen(true);
  };

  const handleSendLogs = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sendLogsRequest: SendLogsRequest = {
        discordUsername,
        errorDescription,
      };
      const response = await fetch(`${appApiUrl}/debug/send-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendLogsRequest),
      });
      const responseJson = await response.json();
      if (response.ok) {
        setOpen(false);
        // eslint-disable-next-line no-alert
        alert(
          `To get support, copy paste this id into the #support channel in Discord!\n\n${responseJson.logId}`
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
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <form onSubmit={handleSendLogs}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discord Username"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Describe Error"
                  value={errorDescription}
                  onChange={(e) => setErrorDescription(e.target.value)}
                  required
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <SpaceBetweenDiv>
                  <div>
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      color="secondary"
                      variant="contained"
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
                </SpaceBetweenDiv>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
      <Box sx={{ marginTop: 3 }}>
        <SpaceBetweenDiv>
          <div>
            <Button variant="outlined" onClick={handleClick}>
              Send Logs
            </Button>
          </div>
          <div>
            <Button
              color="secondary"
              variant="outlined"
              sx={{ marginRight: 1 }}
              onClick={() => navigate('/logs')}
            >
              Logs
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => navigate('/last-exception')}
            >
              Last Exceptions
            </Button>
          </div>
        </SpaceBetweenDiv>
      </Box>
    </>
  );
}
