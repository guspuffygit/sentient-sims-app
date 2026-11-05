import { Button, Typography } from '@mui/material';
import { appApiUrl } from 'main/sentient-sims/constants';
import { Membership } from 'main/sentient-sims/wrappers/Membership';

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
  const orange = '#F28A2E';
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
          ? { 'backgroundColor': orange, 'color': '#ffffff', '&:hover': { backgroundColor: '#d9741c' } }
          : { 'borderColor': orange, 'color': orange, '&:hover': { borderColor: orange } }
      }
    >
      {label}
    </Button>
  );
}

// Patreon sign-in, kept for the patrons whose plan comes through Patreon
export function PatreonLinkSection({ membership }: { membership: Membership }) {
  if (membership.isPatreonLinked()) {
    return (
      <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
        Patreon account linked
      </Typography>
    );
  }
  return <PatreonButton url={getPatreonOauthUrl()} />;
}
