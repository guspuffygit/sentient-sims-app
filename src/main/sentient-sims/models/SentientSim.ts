import { SentientSimProperties } from './SentientSimProperties';

export type SentientSim = SentientSimProperties & {
  spouse?: SentientSimProperties;
  fiance?: SentientSimProperties;
};
