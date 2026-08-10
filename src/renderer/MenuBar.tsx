import { AppBar, Box, Button, IconButton, Toolbar, Tooltip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction, useState } from 'react';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import useAuthCredentials from './hooks/useAuthCredentials';
import { useDebugMode } from './providers/DebugModeProvider';
import { useAuth } from './providers/AuthProvider';
import handleOpenExternalLink from './hooks/handleOpenExternalLink';
import LogoutButton from './components/LogoutButton';
import { LoginModal } from './components/LoginModal';

export type MenuBarProperties = {
  hideSideBar: boolean;
  setHideSideBar: Dispatch<SetStateAction<boolean>>;
};

type NavButtonProps = {
  id: string;
  label: string;
  path: string;
};

function NavButton({ id, label, path }: NavButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <Button
      id={id}
      onClick={() => {
        void navigate(path);
      }}
      sx={{
        'borderRadius': 99,
        'paddingX': 1.5,
        'whiteSpace': 'nowrap',
        'color': active ? 'primary.light' : 'text.secondary',
        'backgroundColor': active ? (theme) => `${theme.palette.primary.main}24` : 'transparent',
        '&:hover': {
          color: 'text.primary',
          backgroundColor: active ? (theme) => `${theme.palette.primary.main}33` : 'rgba(255, 255, 255, 0.06)',
        },
      }}
    >
      {label}
    </Button>
  );
}

const DEBUG_NAV_ITEMS: NavButtonProps[] = [
  { id: 'offlinememory', label: 'OfflineMemory', path: '/offlinememory' },
  { id: 'chat', label: 'Chat', path: '/chat' },
  { id: 'traits', label: 'Traits', path: '/traits' },
  { id: 'mapping-browser', label: 'Mapping Browser', path: '/mapping-browser' },
];

const NAV_ITEMS: NavButtonProps[] = [
  { id: 'sims', label: 'Sims', path: '/sims' },
  { id: 'locations', label: 'Locations', path: '/locations' },
  { id: 'memories', label: 'Memories', path: '/memories' },
  { id: 'settings', label: 'Settings', path: '/settings' },
];

function MenuBar({ hideSideBar, setHideSideBar }: MenuBarProperties) {
  const { authStatus, signOut } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const onHomePage = location.pathname === '/';
  const debugMode = useDebugMode();
  useAuthCredentials();

  const logOut = () => {
    signOut();
  };

  if (authStatus === 'authenticated' && loginModalOpen) {
    setLoginModalOpen(false);
  }

  const handleOpenWiki = handleOpenExternalLink('https://github.com/guspuffygit/sentient-sims-app/wiki');

  return (
    <Box sx={{ flexShrink: 0, marginBottom: 2 }}>
      <AppBar
        position="static"
        color="transparent"
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            justifyContent: 'space-between',
            minHeight: 56,
            paddingX: 1.5,
            paddingY: 0.5,
            flexWrap: 'wrap',
            rowGap: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Tooltip title="Home">
              <IconButton
                id="homebutton"
                aria-label="Home"
                onClick={() => {
                  void navigate('/');
                }}
                sx={{
                  'color': onHomePage ? 'primary.light' : 'text.secondary',
                  'backgroundColor': onHomePage ? (theme) => `${theme.palette.primary.main}24` : 'transparent',
                  '&:hover': {
                    color: onHomePage ? 'primary.light' : 'text.primary',
                    backgroundColor: onHomePage
                      ? (theme) => `${theme.palette.primary.main}33`
                      : 'rgba(255, 255, 255, 0.06)',
                  },
                }}
              >
                <HomeOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open the wiki in your browser">
              <Button
                onClick={handleOpenWiki}
                startIcon={<MenuBookOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  'borderRadius': 99,
                  'paddingX': 1.5,
                  'color': 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                Wiki
              </Button>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
            {debugMode.isEnabled ? DEBUG_NAV_ITEMS.map((item) => <NavButton key={item.id} {...item} />) : null}
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.id} {...item} />
            ))}
            {authStatus === 'authenticated' ? (
              <LogoutButton
                signOut={() => {
                  logOut();
                }}
              />
            ) : (
              <Button
                color="warning"
                variant="outlined"
                onClick={() => {
                  setLoginModalOpen(true);
                }}
                sx={{ borderRadius: 99, paddingX: 1.75, marginLeft: 0.5 }}
                id="login"
              >
                Login
              </Button>
            )}
            <Tooltip title={hideSideBar ? 'Show announcements' : 'Hide announcements'}>
              <IconButton
                size="small"
                onClick={() => {
                  setHideSideBar(!hideSideBar);
                }}
                sx={{ marginLeft: 0.5 }}
              >
                {hideSideBar ? (
                  <ViewSidebarOutlinedIcon fontSize="small" />
                ) : (
                  <ChevronRightOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
    </Box>
  );
}

export default MenuBar;
