import { Box, Card, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingY: 8,
          paddingX: 4,
        }}
      >
        <Box
          sx={{
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'width': 56,
            'height': 56,
            'borderRadius': '16px',
            'backgroundColor': (theme) => `${theme.palette.primary.main}1f`,
            'color': 'primary.light',
            'marginBottom': 2,
            '& svg': { fontSize: 28 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5, maxWidth: 380 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
    </Card>
  );
}
