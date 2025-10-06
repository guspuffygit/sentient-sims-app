import { Modal, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import log from 'electron-log';

export function PatreonLinkingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const removeListener = window.electron.onLinkingPatreon((_event: any, isLinking: boolean) => {
      log.debug(`onLinkingPatreon running: ${isLinking}`);
      setOpen(isLinking);
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
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        Linking Patreon...
      </Box>
    </Modal>
  );
}
