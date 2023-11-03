import { AppBar, Box, Button, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import useAuthCredentials from './hooks/useAuthCredentials';
import { useDebugMode } from './providers/DebugModeProvider';

function MenuBar() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const debugMode = useDebugMode();
  useAuthCredentials();

  const handleOpenWiki = (event: any) => {
    event.preventDefault();
    window.electron.openBrowserLink(
      'https://github.com/guspuffygit/sentient-sims-app/wiki'
    );
  };

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
            <Button
              color="secondary"
              onClick={handleOpenWiki}
              sx={{ margin: '10px' }}
            >
              Wiki
            </Button>
          </div>
          <div>
            {debugMode.isEnabled ? (
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
            {user ? (
              <Button color="warning" onClick={signOut} sx={{ margin: '10px' }}>
                Logout
              </Button>
            ) : (
              <Button
                color="warning"
                onClick={() => navigate('/login')}
                sx={{ margin: '10px' }}
              >
                Login
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;
