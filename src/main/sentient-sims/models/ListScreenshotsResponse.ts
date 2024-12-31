import { Stats } from 'fs';

export type Screenshot = {
  name: string;
  stats: Stats;
};

export type ListScreenshotsResponse = {
  data: Screenshot[];
};
