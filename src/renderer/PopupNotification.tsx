/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Modal, Typography } from '@mui/material';
import { IpcRendererEvent } from 'electron';
import { useState } from 'react';

export default function PopupNotificationModal() {
  const [state, setState] = useState({
    open: false,
    message: '',
  });

  window.electron.onPopupNotification(
    (_event: IpcRendererEvent, notificationMessage: string) => {
      setState({
        open: true,
        message: notificationMessage,
      });
    }
  );

  const onClose = () => {
    setState({
      open: false,
      message: '',
    });
  };

  return (
    <Modal open={state.open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography>{state.message}</Typography>
      </Box>
    </Modal>
  );
}
