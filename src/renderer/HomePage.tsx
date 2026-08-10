import { Box, Chip, Grid, Typography } from '@mui/material';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import { ThankYouCardPatreon } from './ThankYouCard';
import { MappingLeaderboardComponent } from './components/MappingLeaderboardComponent';
import { useWebsocket } from './providers/WebsocketProvider';

function ConnectionChip() {
  const { status } = useWebsocket();
  const connected = status.mod;

  return (
    <Chip
      size="small"
      variant="outlined"
      label={connected ? 'Game connected' : 'Game not connected'}
      icon={
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            marginLeft: 1,
            backgroundColor: connected ? 'success.main' : 'text.disabled',
            boxShadow: connected ? (theme) => `0 0 6px ${theme.palette.success.main}` : 'none',
          }}
        />
      }
      sx={{
        color: connected ? 'success.light' : 'text.secondary',
        borderColor: connected ? (theme) => `${theme.palette.success.main}66` : 'divider',
      }}
    />
  );
}

function HomeHero() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        marginBottom: 1.5,
        paddingX: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            background: (theme) =>
              `linear-gradient(90deg, ${theme.palette.text.primary}, ${theme.palette.primary.light})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sentient Sims
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Your AI companion for The Sims 4
        </Typography>
      </Box>
      <ConnectionChip />
    </Box>
  );
}

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <Grid container spacing={2}>
        <Grid size={6}>
          <UpdateComponent />
          <DebugCard />
          <MappingLeaderboardComponent />
        </Grid>
        <Grid size={6}>
          <ThankYouCardPatreon />
        </Grid>
      </Grid>
    </div>
  );
}
