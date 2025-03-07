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
import LogoutButton from './components/LogoutButton';

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
    'https://github.com/guspuffygit/sentient-sims-app/wiki',
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
            <IconButton
              color="secondary"
              onClick={() => navigate('/')}
              id="homebutton"
            >
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
              <>
                <Button
                  color="secondary"
                  onClick={() => navigate('/chat')}
                  sx={{ marginLeft: '5px' }}
                  id="chat"
                >
                  Chat
                </Button>
                <Button
                  color="secondary"
                  onClick={() => navigate('/traits')}
                  sx={{ marginLeft: '5px' }}
                  id="traits"
                >
                  Traits
                </Button>
              </>
            ) : null}
            <Button
              color="secondary"
              onClick={() => navigate('/sims')}
              sx={{ marginLeft: '5px' }}
              id="sims"
            >
              Sims
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate('/locations')}
              sx={{ marginLeft: '5px' }}
              id="locations"
            >
              Locations
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate('/memories')}
              sx={{ marginLeft: '5px' }}
              id="memories"
            >
              Memories
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate('/settings')}
              sx={{ marginLeft: '5px' }}
              id="settings"
            >
              Settings
            </Button>
            {user ? (
              <LogoutButton signOut={signOut} />
            ) : (
              <Button
                color="warning"
                onClick={() => navigate('/login')}
                sx={{ marginLeft: '5px' }}
                id="login"
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
