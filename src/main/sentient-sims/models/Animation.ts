import { MappingSource } from 'main/sentient-sims/models/MappingSource';

export type Animation = {
  id?: string;
  name: string;
  author: string;
  act: string;
  sub?: string;
};

export type BrowsableAnimation = Animation & {
  source: MappingSource;
};
