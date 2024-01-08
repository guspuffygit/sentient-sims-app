import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Dispatch, SetStateAction } from 'react';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import useAuthCredentials from './hooks/useAuthCredentials';
import { useDebugMode } from './providers/DebugModeProvider';

export type MenuBarProperties = {
  hideSideBar: boolean;
  setHideSideBar: Dispatch<SetStateAction<boolean>>;
};

function MenuBar({ hideSideBar, setHideSideBar }: MenuBarProperties) {
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
              onClick={() => navigate('/memories')}
              sx={{ margin: '10px' }}
            >
              Memories
            </Button>
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
            <IconButton onClick={() => setHideSideBar(!hideSideBar)}>
              {hideSideBar ? (
                <ViewSidebarOutlinedIcon />
              ) : (
                <ChevronRightOutlinedIcon />
              )}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuBar;
