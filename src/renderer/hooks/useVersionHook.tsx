import { Version } from 'main/sentient-sims/services/VersionService';

export type UseVersionHook = {
  version: Version;
  refresh: () => void;
  loading: boolean;
};
