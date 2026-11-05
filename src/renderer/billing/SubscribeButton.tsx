import { Box, Button, FormHelperText, Typography } from '@mui/material';
import { useState } from 'react';
import { Tier } from 'main/sentient-sims/models/UserInfo';
import { useBillingActions } from './useBillingActions';

type Props = {
  tier: Tier;
  label: string;
  variant?: 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
};

export function SubscribeButton({ tier, label, variant = 'contained', size = 'large', fullWidth = false }: Props) {
  const { subscribe, busy, error } = useBillingActions();
  const [opened, setOpened] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.5, width: '100%' }}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={busy}
        onClick={() => {
          void subscribe(tier).then((ok) => {
            setOpened(ok === true);
            return ok;
          });
        }}
      >
        {label}
      </Button>
      {error ? <FormHelperText error>{error}</FormHelperText> : null}
      {opened && !error ? (
        <Typography variant="caption" align="center" sx={{ color: 'text.secondary' }}>
          Checkout opened in your browser. Finish there and this page updates by itself.
        </Typography>
      ) : null}
    </Box>
  );
}
