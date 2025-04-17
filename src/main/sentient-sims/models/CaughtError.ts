import { DatabaseSession } from './DatabaseSession';

export type CaughtError = {
  message: any;
  statusCode: number;
  databaseSession?: DatabaseSession | null;
  body: any;
  url: string;
  method: string;
};
