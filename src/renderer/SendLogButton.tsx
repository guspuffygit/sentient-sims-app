import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SpaceBetweenDiv from './components/SpaceBetweenDiv';
import { useDebugMode } from './providers/DebugModeProvider';
import { SendLogModal } from './components/SendLogModal';

export function SendLogButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const debugMode = useDebugMode();

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <>
      <SendLogModal open={open} setOpen={setOpen} />
      <Box sx={{ marginTop: 3 }}>
        <SpaceBetweenDiv>
          <div>
            <Button variant="outlined" onClick={handleClick}>
              Send Logs
            </Button>
          </div>
          <div>
            {debugMode.isEnabled ? (
              <Button
                color="secondary"
                variant="outlined"
                sx={{ marginRight: 1 }}
                onClick={() => navigate('/logs')}
              >
                Logs
              </Button>
            ) : null}
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
