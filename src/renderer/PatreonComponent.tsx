import { Box, Button, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { useAuth } from './providers/AuthProvider';
import { useDebugMode } from './providers/DebugModeProvider';

export const getPatreonOauthUrl = (): string => {
  const redirectUrl = `${appApiUrl}/patreon-redirect`;
  const CLIENT_ID = 'V73t_b4e0wEzeJq7SaU4NTtLTNTheiw6oOU4-pXe2PyvfMAFu8AAGz3XcoQqAKVp';
  const scopes = ['identity', 'identity.memberships', 'campaigns', 'campaigns.members'];
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUrl,
    scope: scopes.join(' '),
  });

  return `https://www.patreon.com/oauth2/authorize?${params.toString()}`;
};

interface PatreonButtonProps {
  url: string;

  onClick?: () => any;
}

export function PatreonButton({ url, onClick }: PatreonButtonProps) {
  return (
    <Button href={url} target="_blank" onClick={onClick}>
      <img src={`${appApiUrl}/files/patreon-medium-button.png`} width="215" alt="Patreon" />
    </Button>
  );
}

interface PatreonActionButtonProps extends PatreonButtonProps {
  label: string;
  variant?: 'contained' | 'outlined';
}

// A Patreon button that says what it does, for pages with more than one
export function PatreonActionButton({ url, onClick, label, variant = 'contained' }: PatreonActionButtonProps) {
  const patreonCoral = '#FF424D';
  return (
    <Button
      href={url}
      target="_blank"
      onClick={onClick}
      variant={variant}
      size="large"
      startIcon={
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <circle cx="15" cy="9.5" r="7.5" />
          <rect x="2" y="2" width="4" height="20" />
        </svg>
      }
      sx={
        variant === 'contained'
          ? { 'backgroundColor': patreonCoral, 'color': '#ffffff', '&:hover': { backgroundColor: '#e63a44' } }
          : { 'borderColor': patreonCoral, 'color': patreonCoral, '&:hover': { borderColor: patreonCoral } }
      }
    >
      {label}
    </Button>
  );
}

function CenteredBox({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        margin: 2,
        marginTop: 4,
      }}
    >
      {children}
    </Box>
  );
}

interface SubscribedPatreonProps {
  patreonUser: PatreonUser;
}

function SubscribedPatreon({ patreonUser }: SubscribedPatreonProps) {
  const { enableDebugMode } = useDebugMode();
  let text = `Thank you for being a ${patreonUser.getSubscriptionLevel()} Patreon subscriber!`;
  if (patreonUser.isDev()) {
    text = `Thank you for being a Dev!`;
  }

  return (
    <div>
      {text === 'Thank you for being a Dev!' ? (
        <Button
          onClick={() => {
            enableDebugMode();
          }}
        >
          {text}
        </Button>
      ) : (
        <Typography variant="h5" align="center">
          {text}
        </Typography>
      )}
    </div>
  );
}

export default function PatreonComponent() {
  const { userAttributes } = useAuth();
  if (!userAttributes) {
    return null;
  }
  const patreonUser = new PatreonUser(userAttributes);
  let content = <PatreonButton url={getPatreonOauthUrl()} />;
  if (patreonUser.isPatreonLinked() || patreonUser.isDev()) {
    if (patreonUser.isDev() || patreonUser.getSubscriptionLevel() !== 'free') {
      content = <SubscribedPatreon patreonUser={patreonUser} />;
    } else {
      content = <PatreonButton url="https://www.patreon.com/SentientSims" />;
    }
  }

  return <CenteredBox>{content}</CenteredBox>;
}
