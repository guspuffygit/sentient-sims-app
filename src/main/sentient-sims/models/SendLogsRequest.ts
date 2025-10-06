import { AuthUser } from '@aws-amplify/auth';
import { AuthUserAttributes } from 'renderer/providers/AuthProvider';
import { CaughtError } from './CaughtError';

export type SendLogsRequest = {
  discordUsername: string;
  errorDescription: string;
  amplifyUser?: AuthUser;
  userAttributes?: AuthUserAttributes;
  caughtError?: CaughtError;
};
