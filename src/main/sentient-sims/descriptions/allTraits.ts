import { TraitDescription } from '../models/TraitDescription';
import { attractionPreferenceDescriptions } from './attractionPreferenceDescriptions';
import { gameplayObjectPreferenceDescriptions } from './gameplayObjectPreferenceDescriptions';
import { preferenceDescriptions } from './preferenceDescriptions';
import { traitDescriptions } from './traitDescriptions';

export const allTraits: Record<string, TraitDescription> = {
  ...attractionPreferenceDescriptions,
  ...gameplayObjectPreferenceDescriptions,
  ...preferenceDescriptions,
  ...traitDescriptions,
};
