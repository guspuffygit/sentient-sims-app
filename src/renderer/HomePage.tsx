import { Grid } from '@mui/material';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import { ThankYouCardPatreon } from './ThankYouCard';
import { MappingLeaderboardComponent } from './components/MappingLeaderboardComponent';

export default function HomePage() {
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <UpdateComponent />
          <DebugCard />
          <MappingLeaderboardComponent />
        </Grid>
        <Grid item xs={6}>
          <ThankYouCardPatreon />
        </Grid>
      </Grid>
    </div>
  );
}
