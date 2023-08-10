import { Avatar, Stack, Typography } from '@mui/material';
import AppCard from './AppCard';

type AvatarCardProps = {
  name: string;
  url: string;
};

function AvatarCard({ name, url }: AvatarCardProps) {
  return (
    <Stack alignItems="center" direction="row" spacing={2} sx={{ margin: 2 }}>
      <Avatar alt={name} src={url} />
      <Typography variant="body2">{name}</Typography>
    </Stack>
  );
}

export default function ThankYouCard() {
  return (
    <AppCard>
      <Typography align="center" sx={{ marginBottom: 1 }}>
        Special Thanks to Sentient Sims Devs!
      </Typography>
      <Stack textAlign="center" direction="row" spacing={2}>
        <AvatarCard
          name="@JazK"
          url="https://cdn.discordapp.com/avatars/231275797908815872/3264ac64218c189e283a5d4472f281e0.webp?size=128"
        />
        <AvatarCard
          name="@ScottA"
          url="https://cdn.discordapp.com/avatars/1072327430204837918/ad8bdc65b1813206a159e67cdc052768.webp?size=128"
        />
      </Stack>
    </AppCard>
  );
}
