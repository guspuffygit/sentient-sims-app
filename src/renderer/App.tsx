/* eslint-disable promise/always-return */
import './App.css';
import { Container, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuBar from './MenuBar';
import WidgetWithOverlay from './WidgetWithOverlay';
import PopupNotificationModal from './PopupNotification';

export default function App() {
  return (
    <Container maxWidth={false} className="root">
      <Grid container spacing={3}>
        <Grid item xs={8.5}>
          <MenuBar />
          <Outlet />
        </Grid>
        <Grid item xs={3.5}>
          <WidgetWithOverlay />
        </Grid>
      </Grid>
      <PopupNotificationModal />
    </Container>
  );
}
