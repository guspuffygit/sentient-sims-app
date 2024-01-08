/* eslint-disable promise/always-return */
import './App.css';
import { Container, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import MenuBar from './MenuBar';
import WidgetWithOverlay from './WidgetWithOverlay';
import PopupNotificationModal from './PopupNotification';

export default function App() {
  const [hideSideBar, setHideSideBar] = useState(false);

  const mainWindowWidth = hideSideBar ? 12 : 8.5;

  return (
    <Container maxWidth={false} className="root">
      <Grid container spacing={3}>
        <Grid item xs={mainWindowWidth}>
          <MenuBar hideSideBar={hideSideBar} setHideSideBar={setHideSideBar} />
          <Outlet />
        </Grid>
        {hideSideBar ? null : (
          <Grid item xs={3.5}>
            <WidgetWithOverlay />
          </Grid>
        )}
      </Grid>
      <PopupNotificationModal />
    </Container>
  );
}
