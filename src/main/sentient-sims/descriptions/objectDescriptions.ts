import { TraitDescription } from '../models/TraitDescription';

export type ObjectDescription = TraitDescription & {};

export const objectDescriptions: Record<string, ObjectDescription> = {
  object_sitLoveseatSC2x1_01: {
    name: 'object_sitLoveseatSC2x1_01',
    description: 'the love seat',
  },
  bathroomPublic_EP07BARisland: {
    name: 'bathroomPublic_EP07BARisland',
    description: 'the island public restoom on the beach',
  },
  object_tablePicnic: {
    name: 'object_tablePicnic',
    description: 'the picnic table',
  },
  object_sitLiving_LoungeChair_Inventory: {
    name: 'object_sitLiving_LoungeChair_Inventory',
    description: 'the lounge chair',
  },
};
