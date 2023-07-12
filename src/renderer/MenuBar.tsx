import { AppBar, Box, Button, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useDebugModeHook from './UseDebugModeHook';

function MenuBar() {
  const navigate = useNavigate();
  const [debugModeEnabled] = useDebugModeHook();

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar
        position="static"
        color="transparent"
        sx={{ backgroundColor: '#313339' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div>
            <Button
              color="secondary"
              onClick={() => navigate('/')}
              sx={{ margin: '10px' }}
            >
              HOME
            </Button>
          </div>
          <div>
            {debugModeEnabled ? (
              <Button
                color="secondary"
                onClick={() => navigate('/chat')}
                sx={{ margin: '10px' }}
              >
                Chat
              </Button>
            ) : null}
            <Button
              color="secondary"
              onClick={() => navigate('/settings')}
              sx={{ margin: '10px' }}
            >
              Settings
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;
