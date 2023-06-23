import { Typography } from '@mui/material';
import AppCard from './AppCard';
import UpdateComponent from './UpdateComponent';
import SendLogButton from './SendLogButton';
import OpenAIComponent from './OpenAIComponent';

export default function HomePage() {
  return (
    <div>
      <AppCard>
        <p>
          Keep this app running while you are playing the Sentient Sims Mod!
        </p>
      </AppCard>
      <UpdateComponent />
      <OpenAIComponent />
      <AppCard>
        <Typography sx={{ marginBottom: 3 }}>Debug</Typography>
        <SendLogButton />
      </AppCard>
    </div>
  );
}
