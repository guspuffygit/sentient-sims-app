import { Box, Button, Tooltip } from '@mui/material';
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
            <Tooltip title="Send your app, game, and mod logs to the developer">
              <Button variant="outlined" onClick={handleClick}>
                Send Logs
              </Button>
            </Tooltip>
          </div>
          <div>
            {debugMode.isEnabled ? (
              <Button color="secondary" variant="outlined" sx={{ marginRight: 1 }} onClick={() => navigate('/logs')}>
                Logs
              </Button>
            ) : null}
            <Tooltip title="View Sims 4 Last Exceptions if they exist">
              <Button color="secondary" variant="outlined" onClick={() => navigate('/last-exception')}>
                Last Exceptions
              </Button>
            </Tooltip>
          </div>
        </SpaceBetweenDiv>
      </Box>
    </>
  );
}
