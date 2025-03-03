import { Grid } from '@mui/material';
import { appApiUrl } from 'main/sentient-sims/constants';
import { useEffect, useRef } from 'react';
import log from 'electron-log';
import UpdateComponent from './UpdateComponent';
import DebugCard from './DebugCard';
import { ThankYouCardPatreon } from './ThankYouCard';
import { MappingLeaderboardComponent } from './components/MappingLeaderboardComponent';

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      // Load and optionally play the audio stream automatically.
      audioRef.current.load();
      audioRef.current.play().catch((err) => log.error('Playback error:', err));
    }
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <audio ref={audioRef} controls autoPlay>
            <source src={`${appApiUrl}/testingit`} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
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
