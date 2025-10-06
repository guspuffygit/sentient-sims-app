/* eslint react/require-default-props: off */
import { Card, CardContent } from '@mui/material';
import { ReactNode, JSX } from 'react';

type AppCardProps = {
  children: ReactNode;
  cardActions?: JSX.Element;
  actionsOnTop?: boolean;
};

export default function AppCard({ cardActions, children, actionsOnTop }: AppCardProps) {
  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      {actionsOnTop ? (
        <>
          {cardActions ?? null}
          <CardContent>{children}</CardContent>
        </>
      ) : (
        <>
          <CardContent>{children}</CardContent>
          {cardActions ?? null}
        </>
      )}
    </Card>
  );
}
