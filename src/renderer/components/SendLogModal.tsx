import { LoadingButton } from '@mui/lab';
import { useState, Dispatch, SetStateAction } from 'react';
import { SendLogsRequest } from 'main/sentient-sims/models/SendLogsRequest';
import { Modal, Box, Divider, Grid, TextField } from '@mui/material';
import LogSendInformationComponent from 'renderer/LogSendInformationComponent';
import { CaughtError } from 'main/sentient-sims/models/CaughtError';
import log from 'electron-log';
import { useAuth } from 'renderer/providers/AuthProvider';
import SpaceBetweenDiv from './SpaceBetweenDiv';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

export type SendLogModalParameters = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;

  caughtError?: CaughtError;
};

const client = new SentientSimsAppClient();

export function SendLogModal({ open, setOpen, caughtError }: SendLogModalParameters) {
  const { user, userAttributes } = useAuth();
  const [loading, setLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [errorDescription, setErrorDescription] = useState('');

  const handleSendLogs = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sendLogsRequest: SendLogsRequest = {
        discordUsername,
        errorDescription,
        caughtError,
        amplifyUser: user,
        userAttributes,
      };

      log.debug(`caughtError: ${caughtError}`);

      const response = await client.debug.sendDebugLogs(sendLogsRequest);
      if (response.errors.length > 0) {
        return alert(
          [
            `Attempted to send logs and encountered errors.`,
            `Logs may not have been sent.`,
            `To get support, copy paste this id into the #support channel in Discord.`,
            response.logId,
          ].join('\n\n'),
        );
      }
      return alert(`To get support, copy paste this id into the #support channel in Discord!\n\n${response.logId}`);
    } catch (err) {
      alert(`Error sending logs:\n${JSON.stringify(err, null, 2)}`);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
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
            <Grid size={12}>
              <TextField
                fullWidth
                label="Discord Username"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid size={12}>
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
            <Grid size={12}>
              <SpaceBetweenDiv>
                <div>
                  <LoadingButton type="submit" loading={loading} color="secondary" variant="contained">
                    Send Logs
                  </LoadingButton>
                </div>
                <div>
                  <LoadingButton loading={loading} onClick={() => setOpen(false)} variant="contained">
                    Cancel
                  </LoadingButton>
                </div>
              </SpaceBetweenDiv>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
}
