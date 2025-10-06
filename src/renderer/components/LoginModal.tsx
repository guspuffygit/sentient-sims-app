import { Box, Modal } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import log from 'electron-log';
import { LoginComponent } from './LoginComponent';

export type LoginModalParameters = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export function LoginModal({ open, setOpen }: LoginModalParameters) {
  useEffect(() => {
    const removeListener = window.electron.onGoogleAuthComplete((_event: any, code: string, state: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set('code', code);
      params.set('state', state);

      const url = `${window.location.href}?${params.toString()}`;

      log.info(`Navigating: ${url}`);
      window.location.href = url;
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <LoginComponent />
      </Box>
    </Modal>
  );
}
