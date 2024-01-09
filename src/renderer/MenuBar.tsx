import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Dispatch, SetStateAction } from 'react';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import HomeIcon from '@mui/icons-material/Home';
import useAuthCredentials from './hooks/useAuthCredentials';
import { useDebugMode } from './providers/DebugModeProvider';
import handleOpenExternalLink from './hooks/handleOpenExternalLink';

export type MenuBarProperties = {
  hideSideBar: boolean;
  setHideSideBar: Dispatch<SetStateAction<boolean>>;
};

function MenuBar({ hideSideBar, setHideSideBar }: MenuBarProperties) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const debugMode = useDebugMode();
  useAuthCredentials();

  const handleOpenWiki = handleOpenExternalLink(
    'https://github.com/guspuffygit/sentient-sims-app/wiki'
  );

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar
        position="static"
        color="transparent"
        sx={{ backgroundColor: '#313339' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <div>
            <IconButton color="secondary" onClick={() => navigate('/')}>
              <HomeIcon />
            </IconButton>
            <Button
              color="secondary"
              onClick={handleOpenWiki}
              sx={{ marginLeft: '5px' }}
            >
              Wiki
            </Button>
          </div>
          <div>
            {debugMode.isEnabled ? (
              <Button
                color="secondary"
                onClick={() => navigate('/chat')}
                sx={{ marginLeft: '5px' }}
              >
                Chat
              </Button>
            ) : null}
            <Button
              color="secondary"
              onClick={() => navigate('/memories')}
              sx={{ marginLeft: '5px' }}
            >
              Memories
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate('/settings')}
              sx={{ marginLeft: '5px' }}
            >
              Settings
            </Button>
            {user ? (
              <Button
                color="warning"
                onClick={signOut}
                sx={{ marginLeft: '5px' }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="warning"
                onClick={() => navigate('/login')}
                sx={{ marginLeft: '5px' }}
              >
                Login
              </Button>
            )}
            <IconButton
              onClick={() => setHideSideBar(!hideSideBar)}
              sx={{ marginLeft: '5px' }}
            >
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
