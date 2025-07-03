import { TraitDescription } from '../models/TraitDescription';
import { traitDescriptions } from './traitDescriptions';

export const allTraits: Record<string, TraitDescription> = {
  ...traitDescriptions,
};
