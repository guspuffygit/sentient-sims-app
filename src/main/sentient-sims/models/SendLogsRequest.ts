import { AmplifyUser } from '@aws-amplify/ui';
import { CaughtError } from './CaughtError';

export type SendLogsRequest = {
  discordUsername: string;
  errorDescription: string;
  amplifyUser?: AmplifyUser;
  caughtError?: CaughtError;
};
