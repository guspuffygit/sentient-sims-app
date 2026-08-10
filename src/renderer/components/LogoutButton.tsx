import { Button } from '@mui/material';

export type LogoutButtonProperties = {
  signOut: () => void;
};

export default function LogoutButton({ signOut }: LogoutButtonProperties) {
  return (
    <Button
      color="warning"
      onClick={signOut}
      sx={{
        'borderRadius': 99,
        'paddingX': 1.75,
        'marginLeft': 0.5,
        'color': 'text.secondary',
        '&:hover': { color: 'warning.main' },
      }}
      id="logout"
    >
      Logout
    </Button>
  );
}
