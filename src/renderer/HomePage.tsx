import { Grid } from '@mui/material';
import AppCard from './AppCard';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import { ThankYouCardPatreon } from './ThankYouCard';
import AIStatusComponent from './AIStatusComponent';
import PatreonComponent from './PatreonComponent';

export default function HomePage() {
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <UpdateComponent />
          <AIStatusComponent />
          <DebugCard />
          <PatreonComponent />
        </Grid>
        <Grid item xs={6}>
          <AppCard>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              Keep this app running while you are playing Sentient Sims!
            </div>
          </AppCard>
          <ThankYouCardPatreon />
        </Grid>
      </Grid>
    </div>
  );
}
