import { UpdateInfo } from 'electron-updater';
import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import log from 'electron-log';

export default function AppUpdateComponent() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>();
  const [open, setOpen] = useState(false);

  window.electron.onAppUpdateAvailable(
    (_event: any, updateAvailableInfo: UpdateInfo) => {
      setUpdateInfo(updateAvailableInfo);
      setOpen(true);
    }
  );

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
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
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
}
