import { Avatar, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useMemo } from 'react';
import AppCard from './AppCard';
import { useThankYous } from './hooks/useThankYous';
import PatreonComponent from './PatreonComponent';

export enum AvatarType {
  DEV = '#206694',
  TIER_2 = '#f1c40f',
  TIER_1 = '#2ecc71',
}

type AvatarCardProps = {
  name: string;
  url: string;
  type: AvatarType;
};

type AvatarSize = {
  size: number;
  variant:
    | 'body2'
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'overline'
    | undefined;
};

function getAvatarSize(avatarType: AvatarType): AvatarSize {
  if (avatarType === AvatarType.TIER_2) {
    return { size: 30, variant: 'body1' };
  }

  if (avatarType === AvatarType.TIER_1) {
    return { size: 20, variant: 'body2' };
  }

  // Dev
  return { size: 40, variant: 'h6' };
}

function AvatarCard({ name, url, type }: AvatarCardProps) {
  const avatarSize = useMemo(() => {
    return getAvatarSize(type);
  }, [type]);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={name}
        src={url}
        sx={{
          height: avatarSize.size,
          width: avatarSize.size,
          backgroundColor: 'white',
        }}
      />
      <Typography variant={avatarSize.variant} sx={{ color: type }}>
        {name}
      </Typography>
    </Stack>
  );
}

export default function ThankYouCard() {
  return null;
}

export function ThankYouCardPatreon() {
  const thankYous = useThankYous();

  const tier2Exists = thankYous.tier2.length > 0;
  const tier1Exists = thankYous.tier1.length > 0;

  return (
    <AppCard
      title="Thank You"
      subtitle="To the Devs and Patrons who make Sentient Sims possible"
      icon={<FavoriteIcon fontSize="small" />}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1 }}
        useFlexGap
        sx={{
          flexWrap: 'wrap',
          marginTop: 1,
        }}
      >
        {thankYous.dev.map((thankYouUser) => {
          return (
            <AvatarCard
              name={`@${thankYouUser.name}`}
              url={`${thankYouUser.avatar}?size=128`}
              type={AvatarType.DEV}
              key={`@${thankYouUser.name}`}
            />
          );
        })}
      </Stack>
      {tier2Exists ? (
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1 }}
          useFlexGap
          sx={{
            flexWrap: 'wrap',
            marginTop: 1,
          }}
        >
          {thankYous.tier2.map((thankYouUser) => {
            return (
              <AvatarCard
                name={`@${thankYouUser.name}`}
                url={`${thankYouUser.avatar}?size=128`}
                type={AvatarType.TIER_2}
                key={`@${thankYouUser.name}`}
              />
            );
          })}
        </Stack>
      ) : null}
      {tier1Exists ? (
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1 }}
          useFlexGap
          sx={{
            flexWrap: 'wrap',
            marginTop: 1,
          }}
        >
          {thankYous.tier1.map((thankYouUser) => {
            return (
              <AvatarCard
                name={`@${thankYouUser.name}`}
                url={thankYouUser.avatar}
                type={AvatarType.TIER_1}
                key={`@${thankYouUser.name}`}
              />
            );
          })}
        </Stack>
      ) : null}
      <PatreonComponent />
    </AppCard>
  );
}
