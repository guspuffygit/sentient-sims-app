import { DatabaseSession } from './DatabaseSession';

export type CaughtError = {
  message: string;
  statusCode: number;
  databaseSession?: DatabaseSession | null;
  body: unknown;
  url: string;
  method: string;
};
