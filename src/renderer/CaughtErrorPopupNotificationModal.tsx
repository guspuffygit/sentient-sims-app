/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { IpcRendererEvent } from 'electron';
import { CaughtError } from 'main/sentient-sims/models/CaughtError';
import { useMemo, useState } from 'react';
import { SendLogModal } from './components/SendLogModal';

type CaughtErrorState = {
  open: boolean;
  caughtError?: CaughtError;
};

export function CaughtErrorPopupNotificationModal() {
  const [state, setState] = useState<CaughtErrorState>({
    open: false,
  });
  const [sendLogModalOpen, setSendLogModalOpen] = useState(false);

  window.electron.onCaughtErrorPopupNotification(
    (_event: IpcRendererEvent, caughtError: CaughtError) => {
      setState({
        open: true,
        caughtError,
      });
    },
  );

  const onClose = () => {
    setState({
      open: false,
      caughtError: state.caughtError,
    });
  };

  const errorMessage = useMemo(() => {
    if (state.caughtError?.message) {
      return (
        <Typography>Error Message: {state.caughtError?.message}</Typography>
      );
    }

    return null;
  }, [state.caughtError]);

  return (
    <>
      <Dialog
        open={state.open}
        onClose={onClose}
        aria-labelledby="exception-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="exception-dialog-title">
          Exception Occurred
        </DialogTitle>
        <DialogContent dividers>{errorMessage}</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={() => {
              setSendLogModalOpen(true);
              onClose();
            }}
            variant="contained"
            color="primary"
          >
            Send Logs
          </Button>
        </DialogActions>
      </Dialog>
      <SendLogModal
        open={sendLogModalOpen}
        setOpen={setSendLogModalOpen}
        caughtError={state.caughtError}
      />
    </>
  );
}
