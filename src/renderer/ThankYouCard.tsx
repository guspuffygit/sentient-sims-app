import { Avatar, Stack, Typography, TypographyProps } from '@mui/material';
import { ThankYouUser, useThankYous } from './hooks/useThankYous';

type AvatarStyle = {
  color: string;
  size: number;
  variant: TypographyProps['variant'];
  sizedAvatar: boolean;
};

const DEV: AvatarStyle = { color: '#206694', size: 40, variant: 'h6', sizedAvatar: true };
const TIER_4: AvatarStyle = { color: '#e91e63', size: 36, variant: 'subtitle1', sizedAvatar: true };
const TIER_3: AvatarStyle = { color: '#e67e22', size: 33, variant: 'body1', sizedAvatar: true };
const TIER_2: AvatarStyle = { color: '#f1c40f', size: 30, variant: 'body1', sizedAvatar: true };
const TIER_1: AvatarStyle = { color: '#2ecc71', size: 20, variant: 'body2', sizedAvatar: false };

function AvatarCard({ user, style }: { user: ThankYouUser; style: AvatarStyle }) {
  const name = `@${user.name}`;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Avatar
        alt={name}
        src={style.sizedAvatar ? `${user.avatar}?size=128` : user.avatar}
        sx={{ height: style.size, width: style.size, backgroundColor: 'white' }}
      />
      <Typography variant={style.variant} sx={{ color: style.color }}>
        {name}
      </Typography>
    </Stack>
  );
}

function AvatarRow({ users, style }: { users?: ThankYouUser[]; style: AvatarStyle }) {
  if (!users?.length) {
    return null;
  }
  return (
    <Stack direction="row" spacing={{ xs: 1, sm: 1 }} useFlexGap sx={{ flexWrap: 'wrap', marginTop: 1 }}>
      {users.map((user) => (
        <AvatarCard user={user} style={style} key={`@${user.name}`} />
      ))}
    </Stack>
  );
}

export function ThankYouList() {
  const thankYous = useThankYous();

  return (
    <>
      <AvatarRow users={thankYous.dev} style={DEV} />
      <AvatarRow users={thankYous.tier4} style={TIER_4} />
      <AvatarRow users={thankYous.tier3} style={TIER_3} />
      <AvatarRow users={thankYous.tier2} style={TIER_2} />
      <AvatarRow users={thankYous.tier1} style={TIER_1} />
    </>
  );
}
