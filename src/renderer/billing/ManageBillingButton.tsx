import { Box, Button, FormHelperText } from '@mui/material';
import { useBillingActions } from './useBillingActions';

type Props = {
  label?: string;
  variant?: 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
};

// Opens Stripe's customer portal, where the member changes the card, cancels or resumes
export function ManageBillingButton({ label = 'Manage billing', variant = 'outlined', size = 'medium' }: Props) {
  const { manage, busy, error } = useBillingActions();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Button
        variant={variant}
        size={size}
        disabled={busy}
        onClick={() => {
          void manage();
        }}
      >
        {label}
      </Button>
      {error ? <FormHelperText error>{error}</FormHelperText> : null}
    </Box>
  );
}
