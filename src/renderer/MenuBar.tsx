import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import HomeIcon from '@mui/icons-material/Home';
import useAuthCredentials from './hooks/useAuthCredentials';
import { useDebugMode } from './providers/DebugModeProvider';
import { useAuth } from './providers/AuthProvider';
import handleOpenExternalLink from './hooks/handleOpenExternalLink';
import LogoutButton from './components/LogoutButton';
import { LoginModal } from './components/LoginModal';
// import { GlowingGreenOrb } from './components/GlowingGreenOrb';

export type MenuBarProperties = {
  hideSideBar: boolean;
  setHideSideBar: Dispatch<SetStateAction<boolean>>;
};

function MenuBar({ hideSideBar, setHideSideBar }: MenuBarProperties) {
  const { authStatus, signOut } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const debugMode = useDebugMode();
  useAuthCredentials();

  const logOut = () => {
    signOut();
  };

  useEffect(() => {
    if (authStatus === 'authenticated' && loginModalOpen) {
      setLoginModalOpen(false);
    }
  }, [authStatus, loginModalOpen]);

  const handleOpenWiki = handleOpenExternalLink('https://github.com/guspuffygit/sentient-sims-app/wiki');

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar position="static" color="transparent" sx={{ backgroundColor: '#313339' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton color="secondary" onClick={() => navigate('/')} id="homebutton">
              <HomeIcon />
            </IconButton>
            <Button color="secondary" onClick={handleOpenWiki} sx={{ marginLeft: '5px', marginRight: '10px' }}>
              Wiki
            </Button>
            {/* <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#313339',
                  boxShadow: `
                    0 0 8px 4px #fff,
                    0 0 10px 5px #f0f,
                    0 0 12px 6px #0ff
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`${appApiUrl}/files/icon.png`}
                  alt="App Icon"
                  style={{
                    width: 30,
                    height: 30,
                  }}
                />
              </Box>
            </Box> */}
            {/* <GlowingGreenOrb /> */}
          </Box>
          <div>
            {debugMode.isEnabled ? (
              <>
                <Button
                  color="secondary"
                  onClick={() => navigate('/offlinememory')}
                  sx={{ marginLeft: '5px' }}
                  id="offlinememory"
                >
                  OfflineMemory
                </Button>
                <Button color="secondary" onClick={() => navigate('/chat')} sx={{ marginLeft: '5px' }} id="chat">
                  Chat
                </Button>
                <Button color="secondary" onClick={() => navigate('/traits')} sx={{ marginLeft: '5px' }} id="traits">
                  Traits
                </Button>
              </>
            ) : null}
            <Button color="secondary" onClick={() => navigate('/sims')} sx={{ marginLeft: '5px' }} id="sims">
              Sims
            </Button>
            <Button color="secondary" onClick={() => navigate('/locations')} sx={{ marginLeft: '5px' }} id="locations">
              Locations
            </Button>
            <Button color="secondary" onClick={() => navigate('/memories')} sx={{ marginLeft: '5px' }} id="memories">
              Memories
            </Button>
            <Button color="secondary" onClick={() => navigate('/settings')} sx={{ marginLeft: '5px' }} id="settings">
              Settings
            </Button>
            {authStatus === 'authenticated' ? (
              <LogoutButton signOut={() => logOut()} />
            ) : (
              <Button color="warning" onClick={() => setLoginModalOpen(true)} sx={{ marginLeft: '5px' }} id="login">
                Login
              </Button>
            )}
            <IconButton onClick={() => setHideSideBar(!hideSideBar)} sx={{ marginLeft: '5px' }}>
              {hideSideBar ? <ViewSidebarOutlinedIcon /> : <ChevronRightOutlinedIcon />}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
    </Box>
  );
}

export default MenuBar;
