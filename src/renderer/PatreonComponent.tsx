import { useAuthenticator } from '@aws-amplify/ui-react';
import { Box, Button, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import AppCard from './AppCard';
import PatreonUser from './wrappers/PatreonUser';
import { useDebugMode } from './providers/DebugModeProvider';
import EditAvatarComponent from './components/EditAvatarComponent';

export const getPatreonOauthUrl = (): string => {
  const redirectUrl = 'http://localhost:25148/patreon-redirect';
  const CLIENT_ID =
    'V73t_b4e0wEzeJq7SaU4NTtLTNTheiw6oOU4-pXe2PyvfMAFu8AAGz3XcoQqAKVp';
  const scopes = [
    'identity',
    'identity.memberships',
    'campaigns',
    'campaigns.members',
  ];
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
}

function PatreonButton({ url }: PatreonButtonProps) {
  return (
    <Button href={url} target="_blank">
      <img
        src="http://localhost:25148/files/patreon-medium-button.png"
        width="215"
        alt="Patreon"
      />
    </Button>
  );
}

function CenteredBox({ children }: PropsWithChildren) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', margin: 2 }}>
      {children}
    </Box>
  );
}

interface SubscribedPatreonProps {
  patreonUser: PatreonUser;
}

function SubscribedPatreon({ patreonUser }: SubscribedPatreonProps) {
  let text = `Thank you for being a ${patreonUser.getSubscriptionLevel()} Patreon subscriber!`;
  if (patreonUser.isDev()) {
    text = `Thank you for being a Dev!`;
  }

  return (
    <div>
      <Typography variant="h5" align="center">
        {text}
      </Typography>
      <EditAvatarComponent />
    </div>
  );
}

export default function PatreonComponent() {
  const debugMode = useDebugMode();
  const { user } = useAuthenticator((context) => [context.user]);
  if (!user) {
    return null;
  }
  const patreonUser = new PatreonUser(user);
  let content = <PatreonButton url={getPatreonOauthUrl()} />;
  if (patreonUser.isPatreonLinked() || patreonUser.isDev()) {
    if (patreonUser.isDev() || patreonUser.getSubscriptionLevel() !== 'free') {
      content = <SubscribedPatreon patreonUser={patreonUser} />;
    } else {
      content = <PatreonButton url="https://www.patreon.com/SentientSims" />;
    }
  }

  return (
    <AppCard>
      <Box>
        {debugMode.isEnabled ? (
          <div>
            <Typography>User: {user?.attributes?.email}</Typography>
            <Typography>
              Patreon Linked? {`${patreonUser.isPatreonLinked()}`}
            </Typography>
            <Typography>Tier: {patreonUser.getSubscriptionLevel()}</Typography>
            <Typography>
              Founder Status: {patreonUser.getFounderStatus()}
            </Typography>
            <Typography>Patreon ID: {patreonUser.getPatreonId()}</Typography>
          </div>
        ) : null}
      </Box>
      <CenteredBox>{content}</CenteredBox>
    </AppCard>
  );
}
