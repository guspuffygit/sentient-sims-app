import './App.css';
import { Box, Container, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import MenuBar from './MenuBar';
import PopupNotificationModal from './PopupNotification';
import { AnimationMappingComponent } from './components/AnimationMappingComponent';
import { InteractionMappingComponent } from './components/InteractionMappingComponent';
import { CaughtErrorPopupNotificationModal } from './CaughtErrorPopupNotificationModal';
import { SetupWizardProvider } from './providers/SetupWizardProvider';
import { PatreonLinkingModal } from './components/PatreonLinkingModal';
import { Announcements } from './components/Announcements';
import { LoginModalProvider } from './providers/LoginModalProvider';

export default function App() {
  const [hideSideBar, setHideSideBar] = useState(false);

  const mainWindowWidth = hideSideBar ? 12 : 8.5;

  return (
    <LoginModalProvider>
      <SetupWizardProvider>
        <Container maxWidth={false} className="root">
          <Grid container spacing={3}>
            <Grid size={mainWindowWidth}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', minHeight: 280 }}>
                <MenuBar hideSideBar={hideSideBar} setHideSideBar={setHideSideBar} />
                <Box id="page-scroll" sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable' }}>
                  <Outlet />
                </Box>
              </Box>
            </Grid>
            {hideSideBar ? null : (
              <Grid size={3.5}>
                <Announcements />
              </Grid>
            )}
          </Grid>
          <PopupNotificationModal />
          <CaughtErrorPopupNotificationModal />
          <AnimationMappingComponent />
          <InteractionMappingComponent />
          <PatreonLinkingModal />
        </Container>
      </SetupWizardProvider>
    </LoginModalProvider>
  );
}
