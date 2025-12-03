import './App.css';
import { Container, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import MenuBar from './MenuBar';
import WidgetWithOverlay from './WidgetWithOverlay';
import PopupNotificationModal from './PopupNotification';
import { AnimationMappingComponent } from './components/AnimationMappingComponent';
import { InteractionMappingComponent } from './components/InteractionMappingComponent';
import { CaughtErrorPopupNotificationModal } from './CaughtErrorPopupNotificationModal';
import { SetupWizardProvider } from './providers/SetupWizardProvider';
import { PatreonLinkingModal } from './components/PatreonLinkingModal';

export default function App() {
  const [hideSideBar, setHideSideBar] = useState(false);

  const mainWindowWidth = hideSideBar ? 12 : 8.5;

  return (
    <SetupWizardProvider>
      <Container maxWidth={false} className="root">
        <Grid container spacing={3}>
          <Grid size={mainWindowWidth}>
            <MenuBar hideSideBar={hideSideBar} setHideSideBar={setHideSideBar} />
            <Outlet />
          </Grid>
          {hideSideBar ? null : (
            <Grid size={3.5}>
              <WidgetWithOverlay />
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
  );
}
