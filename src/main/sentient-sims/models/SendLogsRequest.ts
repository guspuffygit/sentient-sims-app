import { AmplifyUser } from '@aws-amplify/ui';

export type SendLogsRequest = {
  discordUsername: string;
  errorDescription: string;
  amplifyUser?: AmplifyUser;
};
