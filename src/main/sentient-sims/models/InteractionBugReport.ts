import { MemoryEntity } from '../db/entities/MemoryEntity';
import { SSEvent } from './InteractionEvents';

export type InteractionBugReport = {
  username: string;
  bugDetails: string;
  event: SSEvent;
  memory: MemoryEntity;
};
