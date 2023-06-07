/* eslint react/require-default-props: off */
import { Card, CardContent } from '@mui/material';
import { ReactNode, JSX } from 'react';

type AppCardProps = {
  children: ReactNode;
  cardActions?: JSX.Element;
};

export default function AppCard({ cardActions, children }: AppCardProps) {
  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      <CardContent>{children}</CardContent>
      {cardActions ?? null}
    </Card>
  );
}
