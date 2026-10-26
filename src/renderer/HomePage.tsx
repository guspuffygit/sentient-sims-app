import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import { ThankYouCardPatreon } from './ThankYouCard';
import { MappingLeaderboardComponent } from './components/MappingLeaderboardComponent';
import { QuickstartCard } from './components/QuickstartCard';
import { useSetupWizard } from './providers/SetupWizardProvider';

// O-6: dead-pipeline badge — appears after 3 consecutive provider failures, clears on the
// next success (main process decides; this only renders what it is told)
function ProviderHealthChip() {
  const [health, setHealth] = useState<{ down: boolean; failures: number; lastError?: string } | undefined>();
  useEffect(() => {
    const remove = window.electron.onProviderHealth(
      (_event: unknown, next: { down: boolean; failures: number; lastError?: string }) => {
        setHealth(next);
      },
    );
    return () => {
      remove();
    };
  }, []);
  if (!health?.down) {
    return null;
  }
  return (
    <Chip
      size="small"
      color="error"
      variant="outlined"
      title={health.lastError}
      label={`AI provider failing (${health.failures} in a row)`}
    />
  );
}

function HomeHero() {
  const setupWizard = useSetupWizard();

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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <ProviderHealthChip />
        <Button
          size="small"
          onClick={() => {
            setupWizard.setOpen(true);
          }}
        >
          Having trouble? Run the Setup Wizard
        </Button>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <Grid container spacing={2}>
        <Grid size={6}>
          <QuickstartCard />
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
