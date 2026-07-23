import { Box, Card, CardContent, Typography } from '@mui/material';
import { ReactNode, JSX } from 'react';

type AppCardProps = {
  children: ReactNode;
  cardActions?: JSX.Element;
  actionsOnTop?: boolean;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
};

function AppCardHeader({ title, subtitle, icon, headerAction }: Omit<AppCardProps, 'children'>) {
  if (!title && !icon && !headerAction) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {icon ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: (theme) => `${theme.palette.primary.main}1f`,
              color: 'primary.light',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
        <div>
          {title ? <Typography variant="h6">{title}</Typography> : null}
          {subtitle ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          ) : null}
        </div>
      </Box>
      {headerAction ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{headerAction}</Box> : null}
    </Box>
  );
}

export default function AppCard({
  cardActions,
  children,
  actionsOnTop,
  title,
  subtitle,
  icon,
  headerAction,
}: AppCardProps) {
  const content = (
    <CardContent>
      <AppCardHeader title={title} subtitle={subtitle} icon={icon} headerAction={headerAction} />
      {children}
    </CardContent>
  );

  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      {actionsOnTop ? (
        <>
          {cardActions ?? null}
          {content}
        </>
      ) : (
        <>
          {content}
          {cardActions ?? null}
        </>
      )}
    </Card>
  );
}
