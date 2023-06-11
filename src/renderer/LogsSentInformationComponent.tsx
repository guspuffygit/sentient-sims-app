import { Typography } from '@mui/material';

export type LogsSentInformationProps = {
  logId: string;
};

export default function LogsSentInformationComponent({
  logId,
}: LogsSentInformationProps) {
  return <Typography>Logs have been sent {logId}</Typography>;
}
