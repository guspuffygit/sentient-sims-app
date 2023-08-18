import { Grid } from '@mui/material';
import AppCard from './AppCard';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import ThankYouCard from './ThankYouCard';
import AIStatusComponent from './AIStatusComponent';

export default function HomePage() {
  return (
    <div>
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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <UpdateComponent />
          <AIStatusComponent />
        </Grid>
        <Grid item xs={6}>
          <DebugCard />
          <ThankYouCard />
        </Grid>
      </Grid>
    </div>
  );
}
