import { TraitDescription } from '../models/TraitDescription';

export type TraitMapping = TraitDescription & {
  class?: string;
  xml?: string;
  trait_type?: string;
};

export const traitDescriptions: Record<string, TraitDescription> = {
  ageTraits_Fox_Adult: {
    name: 'ageTraits_Fox_Adult',
    description: 'is an adult',
  },
  ageTraits_Fox_Elder: {
    name: 'ageTraits_Fox_Elder',
    description: 'is an elder',
  },
  archaeologySkill_GiveAuthenticationMail_Prohibit: {
    name: 'archaeologySkill_GiveAuthenticationMail_Prohibit',
    ignored: true,
  },
  challenge_Kindness_Ambassador: {
    name: 'challenge_Kindness_Ambassador',
    description: 'has stronger friendships and fewer negative emotions',
  },
  fameTrait_Level1: {
    name: 'fameTrait_Level1',
    ignored: true,
  },
  fameTrait_Level2: {
    name: 'fameTrait_Level2',
    ignored: true,
  },
  fameTrait_Level3: {
    name: 'fameTrait_Level3',
    ignored: true,
  },
  fameTrait_Level4: {
    name: 'fameTrait_Level4',
    ignored: true,
  },
  fameTrait_Level5: {
    name: 'fameTrait_Level5',
    ignored: true,
  },
  fameTraits_CelebrityWalk_On: {
    name: 'fameTraits_CelebrityWalk_On',
    ignored: true,
  },
  fameTraits_Shine_Off: {
    name: 'fameTraits_Shine_Off',
    ignored: true,
  },
  fameTraits_Shine_On_Rank4: {
    name: 'fameTraits_Shine_On_Rank4',
    ignored: true,
  },
  fameTraits_Shine_On_Rank5: {
    name: 'fameTraits_Shine_On_Rank5',
    ignored: true,
  },
  love_Explorer: {
    name: 'love_Explorer',
    description: 'is quick at growing romantic relationships',
  },
  love_Poly: {
    name: 'love_Poly',
    description: 'is good at keeping multiple romantic relationships',
  },
  trait_active: {
    name: 'trait_active',
    ignored: false,
    description: 'is active',
  },
  trait_ActorCareer_Hidden_Checkpoints_NewToActorCareer: {
    name: 'trait_ActorCareer_Hidden_Checkpoints_NewToActorCareer',
    ignored: true,
  },
  trait_adult: {
    name: 'trait_adult',
    ignored: true,
  },
  trait_Adventurous: {
    name: 'trait_Adventurous',
    ignored: false,
    description: 'is adventurous',
  },
  trait_Alluring: {
    name: 'trait_Alluring',
    ignored: false,
    description: 'is alluring',
  },
  trait_AlwaysWelcome: {
    name: 'trait_AlwaysWelcome',
    ignored: false,
    description: "is always welcome in other people's homes",
  },
  trait_Ambitious: {
    name: 'trait_Ambitious',
    ignored: false,
    description: 'is ambitious',
  },
  trait_AnglersTranquility: {
    name: 'trait_AnglersTranquility',
    ignored: false,
    description: 'is calmed when fishing',
  },
  trait_Animal_Attraction: {
    name: 'trait_Animal_Attraction',
    ignored: false,
    description: 'is affectionate to animals',
  },
  trait_Animal_Whisperer: {
    name: 'trait_Animal_Whisperer',
    ignored: false,
    description:
      'is good at training pets and has good relationships with pets',
  },
  Trait_AnimalEnthusiast: {
    name: 'Trait_AnimalEnthusiast',
    ignored: false,
    description: 'is obsessed with animals',
  },
  trait_Antiseptic: {
    name: 'trait_Antiseptic',
    ignored: false,
    description: 'is naturally hygienic without effort',
  },
  trait_Appraiser: {
    name: 'trait_Appraiser',
    ignored: false,
    description: 'is an appraiser of metals, crystals and fossils',
  },
  trait_ArchaeologyScholar_MuseumPatron: {
    name: 'trait_ArchaeologyScholar_MuseumPatron',
    ignored: false,
    description: 'is an Archaeology Scholar and Museum Patron',
  },
  trait_ArtLover: {
    name: 'trait_ArtLover',
    ignored: false,
    description: 'is an Art Lover',
  },
  trait_AtDaycare: {
    name: 'trait_AtDaycare',
    ignored: true,
  },
  trait_Attraction_ChangeAttractionSettings_TurnOff: {
    name: 'trait_Attraction_ChangeAttractionSettings_TurnOff',
    ignored: true,
  },
  trait_Attuned: {
    name: 'trait_Attuned',
    description: 'has insights into the mysteries of crystals',
  },
  trait_baby: {
    name: 'trait_baby',
    ignored: true,
  },
  trait_BabyDiaper_Preference_Cloth: {
    name: 'trait_BabyDiaper_Preference_Cloth',
    description: 'likes cloth diapers',
  },
  trait_BabyFeed_Preference_Body: {
    name: 'trait_BabyFeed_Preference_Body',
    description: 'likes breast feeding',
  },
  trait_BabyFeed_Preference_Bottle: {
    name: 'trait_BabyFeed_Preference_Bottle',
    description: 'likes bottle feedings',
  },
  trait_Bane: {
    name: 'trait_Bane',
    description: 'is a bane',
  },
  trait_BatchCook: {
    name: 'trait_BatchCook',
    ignored: true,
  },
  trait_Batuu_Alien_Abednedo: {
    name: 'trait_Batuu_Alien_Abednedo',
    description: 'is an Abednedo alien',
  },
  trait_Batuu_Alien_Bith: {
    name: 'trait_Batuu_Alien_Bith',
    description: 'is a Bith alien',
  },
  trait_Batuu_Alien_Identifier: {
    name: 'trait_Batuu_Alien_Identifier',
    ignored: true,
  },
  trait_Batuu_Alien_Mirialan: {
    name: 'trait_Batuu_Alien_Mirialan',
    description: 'is an Mirialan alien',
  },
  trait_Batuu_Alien_Twilek: {
    name: 'trait_Batuu_Alien_Twilek',
    description: "is a Twi'lek alien",
  },
  trait_Batuu_Alien_Weequay: {
    name: 'trait_Batuu_Alien_Weequay',
    description: 'is a Weequay alien',
  },
  trait_Batuu_Alien_Zabrak: {
    name: 'trait_Batuu_Alien_Zabrak',
    description: 'is a Zabrak alien',
  },
  trait_Batuu_FirstOrder_Identifier: {
    name: 'trait_Batuu_FirstOrder_Identifier',
    description: 'is in the First Order',
  },
  trait_Batuu_FirstOrder_Identifier_Officer: {
    name: 'trait_Batuu_FirstOrder_Identifier_Officer',
    description: 'is a First Order Officer',
  },
  trait_Batuu_FirstOrder_Identifier_Officer_ResistanceSpy: {
    name: 'trait_Batuu_FirstOrder_Identifier_Officer_ResistanceSpy',
    description: 'is a First Order Officer Resistance Spy',
  },
  trait_Batuu_FirstOrder_Identifier_Stormtrooper: {
    name: 'trait_Batuu_FirstOrder_Identifier_Stormtrooper',
    description: 'is a First Order Stormtrooper',
  },
  trait_Batuu_FirstOrder_SNPC_Agnon_Identifier: {
    name: 'trait_Batuu_FirstOrder_SNPC_Agnon_Identifier',
    ignored: true,
  },
  trait_Batuu_FirstOrder_SNPC_Kylo_Identifier: {
    name: 'trait_Batuu_FirstOrder_SNPC_Kylo_Identifier',
    ignored: true,
  },
  trait_Batuu_Known: {
    name: 'trait_Batuu_Known',
    ignored: true,
  },
  trait_Batuu_Lightsaber_Blue_Identifier: {
    name: 'trait_Batuu_Lightsaber_Blue_Identifier',
    ignored: true,
  },
  trait_Batuu_Lightsaber_Green_Identifier: {
    name: 'trait_Batuu_Lightsaber_Green_Identifier',
    ignored: true,
  },
  trait_Batuu_Lightsaber_Identifier: {
    name: 'trait_Batuu_Lightsaber_Identifier',
    ignored: true,
  },
  trait_Batuu_Lightsaber_Red_Identifier: {
    name: 'trait_Batuu_Lightsaber_Red_Identifier',
    ignored: true,
  },
  trait_Batuu_Mission_Ask_About_Resistance: {
    name: 'trait_Batuu_Mission_Ask_About_Resistance',
    ignored: true,
  },
  trait_Batuu_Mission_Sabacc_Tournament_1st_Opponent_Trait: {
    name: 'trait_Batuu_Mission_Sabacc_Tournament_1st_Opponent_Trait',
    ignored: true,
  },
  trait_Batuu_Mission_Sabacc_Tournament_2nd_Opponent_Trait: {
    name: 'trait_Batuu_Mission_Sabacc_Tournament_2nd_Opponent_Trait',
    ignored: true,
  },
  trait_Batuu_Mission_Sabacc_Tournament_Final_Opponent_Trait: {
    name: 'trait_Batuu_Mission_Sabacc_Tournament_Final_Opponent_Trait',
    ignored: true,
  },
  trait_Batuu_Mission_Sabacc_Tournament_Played_All_Opponents: {
    name: 'trait_Batuu_Mission_Sabacc_Tournament_Played_All_Opponents',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Credits: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Credits',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Droid_Parts: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Droid_Parts',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Food: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Food',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Has_Been_Bribed: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Has_Been_Bribed',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Kyber: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Kyber',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Bribe_Porg: {
    name: 'trait_Batuu_Mission_Traits_Bribe_Porg',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Can_Retrieve_Data_RR15: {
    name: 'trait_Batuu_Mission_Traits_Can_Retrieve_Data_RR15',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Convinced_Scientist_Join_FO: {
    name: 'trait_Batuu_Mission_Traits_Convinced_Scientist_Join_FO',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Defector: {
    name: 'trait_Batuu_Mission_Traits_Defector',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_DestroyJammingEquipment_RS9: {
    name: 'trait_Batuu_Mission_Traits_DestroyJammingEquipment_RS9',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FO_FR1: {
    name: 'trait_Batuu_Mission_Traits_FO_FR1',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FO_FR13: {
    name: 'trait_Batuu_Mission_Traits_FO_FR13',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FO_FR2: {
    name: 'trait_Batuu_Mission_Traits_FO_FR2',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FO_FR3: {
    name: 'trait_Batuu_Mission_Traits_FO_FR3',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FO_FS4: {
    name: 'trait_Batuu_Mission_Traits_FO_FS4',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FreeDrinks_At_OgasCantina: {
    name: 'trait_Batuu_Mission_Traits_FreeDrinks_At_OgasCantina',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FS4_Criminal: {
    name: 'trait_Batuu_Mission_Traits_FS4_Criminal',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_FS4_Criminal_Helper: {
    name: 'trait_Batuu_Mission_Traits_FS4_Criminal_Helper',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Given_Info: {
    name: 'trait_Batuu_Mission_Traits_Given_Info',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Is_Informant: {
    name: 'trait_Batuu_Mission_Traits_Is_Informant',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Is_Resistance_Sympathizer: {
    name: 'trait_Batuu_Mission_Traits_Is_Resistance_Sympathizer',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Obtained_Criminal_Info: {
    name: 'trait_Batuu_Mission_Traits_Obtained_Criminal_Info',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Obtained_First_Order_Access_Code: {
    name: 'trait_Batuu_Mission_Traits_Obtained_First_Order_Access_Code',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Recruited_Heist_SS7: {
    name: 'trait_Batuu_Mission_Traits_Recruited_Heist_SS7',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Resistance_RR1_Part1: {
    name: 'trait_Batuu_Mission_Traits_Resistance_RR1_Part1',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Resistance_RR1_Part2: {
    name: 'trait_Batuu_Mission_Traits_Resistance_RR1_Part2',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Resistance_RR2: {
    name: 'trait_Batuu_Mission_Traits_Resistance_RR2',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Scientist_DoWork: {
    name: 'trait_Batuu_Mission_Traits_Scientist_DoWork',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Scientist_Joined_FO_FS6: {
    name: 'trait_Batuu_Mission_Traits_Scientist_Joined_FO_FS6',
    ignored: true,
  },
  trait_Batuu_Mission_Traits_Stormtrooper_CheckID: {
    name: 'trait_Batuu_Mission_Traits_Stormtrooper_CheckID',
    ignored: true,
  },
  trait_Batuu_Missions_Ask_About_First_Order: {
    name: 'trait_Batuu_Missions_Ask_About_First_Order',
    ignored: true,
  },
  trait_Batuu_Missions_Resistance_Contact: {
    name: 'trait_Batuu_Missions_Resistance_Contact',
    ignored: true,
  },
  trait_Batuu_Missions_Resistance_RS3_Repaired: {
    name: 'trait_Batuu_Missions_Resistance_RS3_Repaired',
    ignored: true,
  },
  trait_Batuu_Missions_Resistance_RS3_Scrambled: {
    name: 'trait_Batuu_Missions_Resistance_RS3_Scrambled',
    ignored: true,
  },
  trait_Batuu_Missions_Scoundrel_Contact: {
    name: 'trait_Batuu_Missions_Scoundrel_Contact',
    ignored: true,
  },
  trait_Batuu_Missions_Shared_Fake_Info_All_FS_7: {
    name: 'trait_Batuu_Missions_Shared_Fake_Info_All_FS_7',
    ignored: true,
  },
  trait_Batuu_NPC_Citizen_Identifier: {
    name: 'trait_Batuu_NPC_Citizen_Identifier',
    description: 'is a Batuu citizen',
  },
  trait_Batuu_NPC_Identifier: {
    name: 'trait_Batuu_NPC_Identifier',
    description: 'is from Batuu',
  },
  trait_Batuu_Reputation_NegativeFOModifier_Level1: {
    name: 'trait_Batuu_Reputation_NegativeFOModifier_Level1',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeFOModifier_Level2: {
    name: 'trait_Batuu_Reputation_NegativeFOModifier_Level2',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeFOModifier_Level3: {
    name: 'trait_Batuu_Reputation_NegativeFOModifier_Level3',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeFOModifier_Level4: {
    name: 'trait_Batuu_Reputation_NegativeFOModifier_Level4',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeFOModifier_Level5: {
    name: 'trait_Batuu_Reputation_NegativeFOModifier_Level5',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeRESModifier_Level1: {
    name: 'trait_Batuu_Reputation_NegativeRESModifier_Level1',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeRESModifier_Level2: {
    name: 'trait_Batuu_Reputation_NegativeRESModifier_Level2',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeRESModifier_Level3: {
    name: 'trait_Batuu_Reputation_NegativeRESModifier_Level3',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeRESModifier_Level4: {
    name: 'trait_Batuu_Reputation_NegativeRESModifier_Level4',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeRESModifier_Level5: {
    name: 'trait_Batuu_Reputation_NegativeRESModifier_Level5',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeSMGModifier_Level1: {
    name: 'trait_Batuu_Reputation_NegativeSMGModifier_Level1',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeSMGModifier_Level2: {
    name: 'trait_Batuu_Reputation_NegativeSMGModifier_Level2',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeSMGModifier_Level3: {
    name: 'trait_Batuu_Reputation_NegativeSMGModifier_Level3',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeSMGModifier_Level4: {
    name: 'trait_Batuu_Reputation_NegativeSMGModifier_Level4',
    ignored: true,
  },
  trait_Batuu_Reputation_NegativeSMGModifier_Level5: {
    name: 'trait_Batuu_Reputation_NegativeSMGModifier_Level5',
    ignored: true,
  },
  trait_Batuu_Resistance_Identifier: {
    name: 'trait_Batuu_Resistance_Identifier',
    description: 'is part of the Batuu Resistance',
  },
  trait_Batuu_Resistance_SNPC_Rey_Identifier: {
    name: 'trait_Batuu_Resistance_SNPC_Rey_Identifier',
    ignored: true,
  },
  trait_Batuu_Resistance_SNPC_Vi_Identifier: {
    name: 'trait_Batuu_Resistance_SNPC_Vi_Identifier',
    ignored: true,
  },
  trait_Batuu_Rich_Scoundrel: {
    name: 'trait_Batuu_Rich_Scoundrel',
    description: 'is a Batuu Rich Scoundrel',
  },
  trait_Batuu_Scoundrel_Identifier: {
    name: 'trait_Batuu_Scoundrel_Identifier',
    description: 'is a Batuu scoundrel',
  },
  trait_Batuu_Scoundrel_SNPC_Hondo_Identifier: {
    name: 'trait_Batuu_Scoundrel_SNPC_Hondo_Identifier',
    ignored: true,
  },
  trait_BeachBum_LaidBack: {
    name: 'trait_BeachBum_LaidBack',
    ignored: false,
    description: 'is laid back and never becomes tense',
  },
  trait_Beguiling: {
    name: 'trait_Beguiling',
    ignored: false,
    description: 'is beguiling',
  },
  trait_Bonehilda: {
    name: 'trait_Bonehilda',
    ignored: true,
  },
  trait_Bookworm: {
    name: 'trait_Bookworm',
    ignored: false,
    description: 'is a bookworm',
  },
  trait_BoothBoss: {
    name: 'trait_BoothBoss',
    description: 'is good at selling from food stands and sales tables',
  },
  trait_Brave: {
    name: 'trait_Brave',
    ignored: false,
    description: 'is brave',
  },
  trait_Breasts_ForceOff: {
    name: 'trait_Breasts_ForceOff',
    ignored: true,
  },
  trait_Breasts_ForceOn: {
    name: 'trait_Breasts_ForceOn',
    ignored: true,
  },
  trait_Bro: {
    name: 'trait_Bro',
    ignored: false,
    description: 'is a bro',
  },
  trait_Business_Savvy: {
    name: 'trait_Business_Savvy',
    ignored: false,
    description: 'is business savvy',
  },
  trait_CareerScientist_Event_Inventing: {
    name: 'trait_CareerScientist_Event_Inventing',
    ignored: true,
  },
  trait_Carefree: {
    name: 'trait_Carefree',
    ignored: false,
    description: 'is carefree',
  },
  trait_CarryableInfant_PreferredCarrier_BlackYellow: {
    name: 'trait_CarryableInfant_PreferredCarrier_BlackYellow',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Grey: {
    name: 'trait_CarryableInfant_PreferredCarrier_Grey',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Pink: {
    name: 'trait_CarryableInfant_PreferredCarrier_Pink',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Sturdy_Blue: {
    name: 'trait_CarryableInfant_PreferredCarrier_Sturdy_Blue',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Sturdy_Gray: {
    name: 'trait_CarryableInfant_PreferredCarrier_Sturdy_Gray',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Sturdy_Green: {
    name: 'trait_CarryableInfant_PreferredCarrier_Sturdy_Green',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Sturdy_Orange: {
    name: 'trait_CarryableInfant_PreferredCarrier_Sturdy_Orange',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_Sturdy_Red: {
    name: 'trait_CarryableInfant_PreferredCarrier_Sturdy_Red',
    ignored: true,
  },
  trait_CarryableInfant_PreferredCarrier_White: {
    name: 'trait_CarryableInfant_PreferredCarrier_White',
    ignored: true,
  },
  Trait_CAS_Story_Career_Activist: {
    name: 'Trait_CAS_Story_Career_Activist',
    ignored: true,
  },
  trait_CAS_Story_Career_Activist_Level_2: {
    name: 'trait_CAS_Story_Career_Activist_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Activist_Level_3: {
    name: 'trait_CAS_Story_Career_Activist_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Actor: {
    name: 'Trait_CAS_Story_Career_Actor',
    ignored: true,
  },
  trait_CAS_Story_Career_Actor_Level_2: {
    name: 'trait_CAS_Story_Career_Actor_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Actor_Level_3: {
    name: 'trait_CAS_Story_Career_Actor_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Astronaut: {
    name: 'trait_CAS_Story_Career_Astronaut',
    ignored: true,
  },
  trait_CAS_Story_Career_Astronaut_Level_2: {
    name: 'trait_CAS_Story_Career_Astronaut_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Astronaut_Level_3: {
    name: 'trait_CAS_Story_Career_Astronaut_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Athletic: {
    name: 'trait_CAS_Story_Career_Athletic',
    ignored: true,
  },
  trait_CAS_Story_Career_Athletic_2: {
    name: 'trait_CAS_Story_Career_Athletic_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Athletic_3: {
    name: 'trait_CAS_Story_Career_Athletic_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Business: {
    name: 'trait_CAS_Story_Career_Business',
    ignored: true,
  },
  trait_CAS_Story_Career_Business_Level_2: {
    name: 'trait_CAS_Story_Career_Business_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Business_Level_3: {
    name: 'trait_CAS_Story_Career_Business_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_CivilDesigner: {
    name: 'trait_CAS_Story_Career_CivilDesigner',
    ignored: true,
  },
  trait_CAS_Story_Career_CivilDesigner_Level_2: {
    name: 'trait_CAS_Story_Career_CivilDesigner_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_CivilDesigner_Level_3: {
    name: 'trait_CAS_Story_Career_CivilDesigner_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Conservationist: {
    name: 'Trait_CAS_Story_Career_Conservationist',
    ignored: true,
  },
  trait_CAS_Story_Career_Conservationist_Level_2: {
    name: 'trait_CAS_Story_Career_Conservationist_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Conservationist_Level_3: {
    name: 'trait_CAS_Story_Career_Conservationist_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Corporate_0: {
    name: 'trait_CAS_Story_Career_Corporate_0',
    ignored: true,
  },
  trait_CAS_Story_Career_Corporate_Level_2: {
    name: 'trait_CAS_Story_Career_Corporate_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Corporate_Level_3: {
    name: 'trait_CAS_Story_Career_Corporate_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Criminal: {
    name: 'trait_CAS_Story_Career_Criminal',
    ignored: true,
  },
  trait_CAS_Story_Career_Criminal_Level_2: {
    name: 'trait_CAS_Story_Career_Criminal_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Criminal_Level_3: {
    name: 'trait_CAS_Story_Career_Criminal_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Critic: {
    name: 'Trait_CAS_Story_Career_Critic',
    ignored: true,
  },
  trait_CAS_Story_Career_Critic_Level_2: {
    name: 'trait_CAS_Story_Career_Critic_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Critic_Level_3: {
    name: 'trait_CAS_Story_Career_Critic_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Culinary: {
    name: 'trait_CAS_Story_Career_Culinary',
    ignored: true,
  },
  trait_CAS_Story_Career_Culinary_Level_2: {
    name: 'trait_CAS_Story_Career_Culinary_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Culinary_Level_3: {
    name: 'trait_CAS_Story_Career_Culinary_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Detective: {
    name: 'Trait_CAS_Story_Career_Detective',
    ignored: true,
  },
  trait_CAS_Story_Career_Detective_Level_2: {
    name: 'trait_CAS_Story_Career_Detective_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Detective_Level_3: {
    name: 'trait_CAS_Story_Career_Detective_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Diver: {
    name: 'Trait_CAS_Story_Career_Diver',
    ignored: true,
  },
  trait_CAS_Story_Career_Diver_Level_2: {
    name: 'trait_CAS_Story_Career_Diver_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Diver_Level_3: {
    name: 'trait_CAS_Story_Career_Diver_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Doctor: {
    name: 'Trait_CAS_Story_Career_Doctor',
    ignored: true,
  },
  trait_CAS_Story_Career_Doctor_Level_2: {
    name: 'trait_CAS_Story_Career_Doctor_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Doctor_Level_3: {
    name: 'trait_CAS_Story_Career_Doctor_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Education: {
    name: 'trait_CAS_Story_Career_Education',
    ignored: true,
  },
  trait_CAS_Story_Career_Education_Level_2: {
    name: 'trait_CAS_Story_Career_Education_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Education_Level_3: {
    name: 'trait_CAS_Story_Career_Education_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Engineer: {
    name: 'trait_CAS_Story_Career_Engineer',
    ignored: true,
  },
  trait_CAS_Story_Career_Engineer_Level_2: {
    name: 'trait_CAS_Story_Career_Engineer_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Engineer_Level_3: {
    name: 'trait_CAS_Story_Career_Engineer_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Entertainer: {
    name: 'trait_CAS_Story_Career_Entertainer',
    ignored: true,
  },
  trait_CAS_Story_Career_Entertainer_Level_2: {
    name: 'trait_CAS_Story_Career_Entertainer_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Entertainer_Level_3: {
    name: 'trait_CAS_Story_Career_Entertainer_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Fisherman: {
    name: 'trait_CAS_Story_Career_Fisherman',
    ignored: true,
  },
  trait_CAS_Story_Career_Fisherman_Level_2: {
    name: 'trait_CAS_Story_Career_Fisherman_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Fisherman_Level_3: {
    name: 'trait_CAS_Story_Career_Fisherman_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Freelancer: {
    name: 'trait_CAS_Story_Career_Freelancer',
    ignored: true,
  },
  Trait_CAS_Story_Career_Gardener: {
    name: 'Trait_CAS_Story_Career_Gardener',
    ignored: true,
  },
  trait_CAS_Story_Career_Gardener_Level_2: {
    name: 'trait_CAS_Story_Career_Gardener_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Gardener_Level_3: {
    name: 'trait_CAS_Story_Career_Gardener_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Grim: {
    name: 'trait_CAS_Story_Career_Grim',
    ignored: true,
  },
  trait_CAS_Story_Career_Grim_Level_2: {
    name: 'trait_CAS_Story_Career_Grim_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Grim_Level_3: {
    name: 'trait_CAS_Story_Career_Grim_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Law: {
    name: 'trait_CAS_Story_Career_Law',
    ignored: true,
  },
  trait_CAS_Story_Career_Law_Level_2: {
    name: 'trait_CAS_Story_Career_Law_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Law_Level_3: {
    name: 'trait_CAS_Story_Career_Law_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Lifeguard: {
    name: 'trait_CAS_Story_Career_Lifeguard',
    ignored: true,
  },
  trait_CAS_Story_Career_Lifeguard_Level_2: {
    name: 'trait_CAS_Story_Career_Lifeguard_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Lifeguard_Level_3: {
    name: 'trait_CAS_Story_Career_Lifeguard_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Military: {
    name: 'Trait_CAS_Story_Career_Military',
    ignored: true,
  },
  trait_CAS_Story_Career_Military_level_2: {
    name: 'trait_CAS_Story_Career_Military_level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Military_Level_3: {
    name: 'trait_CAS_Story_Career_Military_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Mortician: {
    name: 'trait_CAS_Story_Career_Mortician',
    ignored: true,
  },
  trait_CAS_Story_Career_Mortician_Level_2: {
    name: 'trait_CAS_Story_Career_Mortician_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Mortician_Level_3: {
    name: 'trait_CAS_Story_Career_Mortician_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Painter: {
    name: 'trait_CAS_Story_Career_Painter',
    ignored: true,
  },
  trait_CAS_Story_Career_Painter_Level_2: {
    name: 'trait_CAS_Story_Career_Painter_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Painter_Level_3: {
    name: 'trait_CAS_Story_Career_Painter_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_RomanceConsultant_Level1: {
    name: 'trait_CAS_Story_Career_RomanceConsultant_Level1',
    ignored: true,
  },
  trait_CAS_Story_Career_RomanceConsultant_Level2: {
    name: 'trait_CAS_Story_Career_RomanceConsultant_Level2',
    ignored: true,
  },
  trait_CAS_Story_Career_RomanceConsultant_Level3: {
    name: 'trait_CAS_Story_Career_RomanceConsultant_Level3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Scientist: {
    name: 'Trait_CAS_Story_Career_Scientist',
    ignored: true,
  },
  trait_CAS_Story_Career_Scientist_Level_2: {
    name: 'trait_CAS_Story_Career_Scientist_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Scientist_Level_3: {
    name: 'trait_CAS_Story_Career_Scientist_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Secret_Agent: {
    name: 'trait_CAS_Story_Career_Secret_Agent',
    ignored: true,
  },
  trait_CAS_Story_Career_Secret_Agent_Level_2: {
    name: 'trait_CAS_Story_Career_Secret_Agent_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Secret_Agent_Level_3: {
    name: 'trait_CAS_Story_Career_Secret_Agent_Level_3',
    ignored: true,
  },
  Trait_CAS_Story_Career_Social_Media: {
    name: 'Trait_CAS_Story_Career_Social_Media',
    ignored: true,
  },
  trait_CAS_Story_Career_Social_Media_Level_2: {
    name: 'trait_CAS_Story_Career_Social_Media_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Social_Media_Level_3: {
    name: 'trait_CAS_Story_Career_Social_Media_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Style_Influencer: {
    name: 'trait_CAS_Story_Career_Style_Influencer',
    ignored: true,
  },
  trait_CAS_Story_Career_Style_Influencer_Level_2: {
    name: 'trait_CAS_Story_Career_Style_Influencer_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Style_Influencer_Level_3: {
    name: 'trait_CAS_Story_Career_Style_Influencer_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Tech_Guru: {
    name: 'trait_CAS_Story_Career_Tech_Guru',
    ignored: true,
  },
  trait_CAS_Story_Career_Tech_Guru_Level_2: {
    name: 'trait_CAS_Story_Career_Tech_Guru_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Tech_Guru_Level_3: {
    name: 'trait_CAS_Story_Career_Tech_Guru_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Career_Unemployed: {
    name: 'trait_CAS_Story_Career_Unemployed',
    ignored: false,
    description: 'is currently unemployed',
  },
  trait_CAS_Story_Career_Writer: {
    name: 'trait_CAS_Story_Career_Writer',
    ignored: true,
  },
  trait_CAS_Story_Career_Writer_Level_2: {
    name: 'trait_CAS_Story_Career_Writer_Level_2',
    ignored: true,
  },
  trait_CAS_Story_Career_Writer_Level_3: {
    name: 'trait_CAS_Story_Career_Writer_Level_3',
    ignored: true,
  },
  trait_CAS_Story_Household_Funds_High: {
    name: 'trait_CAS_Story_Household_Funds_High',
    ignored: true,
  },
  trait_CAS_Story_Household_Funds_Low: {
    name: 'trait_CAS_Story_Household_Funds_Low',
    ignored: true,
  },
  trait_CAS_Story_Household_Funds_Med: {
    name: 'trait_CAS_Story_Household_Funds_Med',
    ignored: true,
  },
  trait_CAS_Story_Occult_Ghost: {
    name: 'trait_CAS_Story_Occult_Ghost',
    ignored: true,
  },
  Trait_CAS_Story_Occult_Vampire: {
    name: 'Trait_CAS_Story_Occult_Vampire',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Acting: {
    name: 'Trait_CAS_Story_Skill_Acting',
    ignored: true,
  },
  trait_CAS_Story_Skill_Acting_3: {
    name: 'trait_CAS_Story_Skill_Acting_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Archaeology: {
    name: 'Trait_CAS_Story_Skill_Archaeology',
    ignored: true,
  },
  trait_CAS_Story_Skill_Archaeology_3: {
    name: 'trait_CAS_Story_Skill_Archaeology_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Baking: {
    name: 'Trait_CAS_Story_Skill_Baking',
    ignored: true,
  },
  trait_CAS_Story_Skill_Baking_3: {
    name: 'trait_CAS_Story_Skill_Baking_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Bowling: {
    name: 'Trait_CAS_Story_Skill_Bowling',
    ignored: true,
  },
  trait_CAS_Story_Skill_Bowling_3: {
    name: 'trait_CAS_Story_Skill_Bowling_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Charisma: {
    name: 'trait_CAS_Story_Skill_Charisma',
    ignored: true,
  },
  trait_CAS_Story_Skill_Charisma_3: {
    name: 'trait_CAS_Story_Skill_Charisma_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Comedy: {
    name: 'trait_CAS_Story_Skill_Comedy',
    ignored: true,
  },
  trait_CAS_Story_Skill_Comedy_3: {
    name: 'trait_CAS_Story_Skill_Comedy_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Cooking: {
    name: 'trait_CAS_Story_Skill_Cooking',
    ignored: true,
  },
  trait_CAS_Story_Skill_Cooking_3: {
    name: 'trait_CAS_Story_Skill_Cooking_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_CrossStitch: {
    name: 'trait_CAS_Story_Skill_CrossStitch',
    ignored: true,
  },
  trait_CAS_Story_Skill_CrossStitch_3: {
    name: 'trait_CAS_Story_Skill_CrossStitch_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Dancing: {
    name: 'trait_CAS_Story_Skill_Dancing',
    ignored: true,
  },
  trait_CAS_Story_Skill_Dancing_3: {
    name: 'trait_CAS_Story_Skill_Dancing_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_DJ_Mixing: {
    name: 'Trait_CAS_Story_Skill_DJ_Mixing',
    ignored: true,
  },
  trait_CAS_Story_Skill_DJ_Mixing_3: {
    name: 'trait_CAS_Story_Skill_DJ_Mixing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Entrepreneur: {
    name: 'trait_CAS_Story_Skill_Entrepreneur',
    ignored: true,
  },
  trait_CAS_Story_Skill_Entrepreneur_3: {
    name: 'trait_CAS_Story_Skill_Entrepreneur_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_EquestrianSkill: {
    name: 'trait_CAS_Story_Skill_EquestrianSkill',
    ignored: true,
  },
  trait_CAS_Story_Skill_EquestrianSkill_3: {
    name: 'trait_CAS_Story_Skill_EquestrianSkill_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fabrication: {
    name: 'trait_CAS_Story_Skill_Fabrication',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fabrication_3: {
    name: 'trait_CAS_Story_Skill_Fabrication_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fishing: {
    name: 'trait_CAS_Story_Skill_Fishing',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fishing_3: {
    name: 'trait_CAS_Story_Skill_Fishing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fitness: {
    name: 'trait_CAS_Story_Skill_Fitness',
    ignored: true,
  },
  trait_CAS_Story_Skill_Fitness_3: {
    name: 'trait_CAS_Story_Skill_Fitness_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Flower_Arranging: {
    name: 'Trait_CAS_Story_Skill_Flower_Arranging',
    ignored: true,
  },
  trait_CAS_Story_Skill_Flower_Arranging_3: {
    name: 'trait_CAS_Story_Skill_Flower_Arranging_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Gardening: {
    name: 'trait_CAS_Story_Skill_Gardening',
    ignored: true,
  },
  trait_CAS_Story_Skill_Gardening_3: {
    name: 'trait_CAS_Story_Skill_Gardening_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Gourmet_Cooking: {
    name: 'trait_CAS_Story_Skill_Gourmet_Cooking',
    ignored: true,
  },
  trait_CAS_Story_Skill_Gourmet_Cooking_3: {
    name: 'trait_CAS_Story_Skill_Gourmet_Cooking_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Guitar: {
    name: 'trait_CAS_Story_Skill_Guitar',
    ignored: true,
  },
  trait_CAS_Story_Skill_Guitar_3: {
    name: 'trait_CAS_Story_Skill_Guitar_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Handiness: {
    name: 'trait_CAS_Story_Skill_Handiness',
    ignored: true,
  },
  trait_CAS_Story_Skill_Handiness_3: {
    name: 'trait_CAS_Story_Skill_Handiness_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Herbalism: {
    name: 'Trait_CAS_Story_Skill_Herbalism',
    ignored: true,
  },
  trait_CAS_Story_Skill_Herbalism_3: {
    name: 'trait_CAS_Story_Skill_Herbalism_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_JuiceFizzing: {
    name: 'trait_CAS_Story_Skill_JuiceFizzing',
    ignored: true,
  },
  trait_CAS_Story_Skill_JuiceFizzing_3: {
    name: 'trait_CAS_Story_Skill_JuiceFizzing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Local_Culture: {
    name: 'trait_CAS_Story_Skill_Local_Culture',
    ignored: true,
  },
  trait_CAS_Story_Skill_Local_Culture_3: {
    name: 'trait_CAS_Story_Skill_Local_Culture_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Logic: {
    name: 'trait_CAS_Story_Skill_Logic',
    ignored: true,
  },
  trait_CAS_Story_Skill_Logic_3: {
    name: 'trait_CAS_Story_Skill_Logic_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Mischief: {
    name: 'trait_CAS_Story_Skill_Mischief',
    ignored: true,
  },
  trait_CAS_Story_Skill_Mischief_3: {
    name: 'trait_CAS_Story_Skill_Mischief_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Mixology: {
    name: 'trait_CAS_Story_Skill_Mixology',
    ignored: true,
  },
  trait_CAS_Story_Skill_Mixology_3: {
    name: 'trait_CAS_Story_Skill_Mixology_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Nectar: {
    name: 'trait_CAS_Story_Skill_Nectar',
    ignored: true,
  },
  trait_CAS_Story_Skill_Nectar_3: {
    name: 'trait_CAS_Story_Skill_Nectar_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Painting: {
    name: 'trait_CAS_Story_Skill_Painting',
    ignored: true,
  },
  trait_CAS_Story_Skill_Painting_3: {
    name: 'trait_CAS_Story_Skill_Painting_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Parenting: {
    name: 'Trait_CAS_Story_Skill_Parenting',
    ignored: true,
  },
  trait_CAS_Story_Skill_Parenting_3: {
    name: 'trait_CAS_Story_Skill_Parenting_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Pet_Training: {
    name: 'trait_CAS_Story_Skill_Pet_Training',
    ignored: true,
  },
  trait_CAS_Story_Skill_Pet_Training_3: {
    name: 'trait_CAS_Story_Skill_Pet_Training_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Photography: {
    name: 'trait_CAS_Story_Skill_Photography',
    ignored: true,
  },
  trait_CAS_Story_Skill_Photography_3: {
    name: 'trait_CAS_Story_Skill_Photography_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Piano: {
    name: 'trait_CAS_Story_Skill_Piano',
    ignored: true,
  },
  trait_CAS_Story_Skill_Piano_3: {
    name: 'trait_CAS_Story_Skill_Piano_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_PipeOrgan: {
    name: 'Trait_CAS_Story_Skill_PipeOrgan',
    ignored: true,
  },
  trait_CAS_Story_Skill_PipeOrgan_3: {
    name: 'trait_CAS_Story_Skill_PipeOrgan_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Programming: {
    name: 'trait_CAS_Story_Skill_Programming',
    ignored: true,
  },
  trait_CAS_Story_Skill_Programming_3: {
    name: 'trait_CAS_Story_Skill_Programming_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_ResearchDebate: {
    name: 'trait_CAS_Story_Skill_ResearchDebate',
    ignored: true,
  },
  trait_CAS_Story_Skill_ResearchDebate_3: {
    name: 'trait_CAS_Story_Skill_ResearchDebate_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Robotics: {
    name: 'trait_CAS_Story_Skill_Robotics',
    ignored: true,
  },
  trait_CAS_Story_Skill_Robotics_3: {
    name: 'trait_CAS_Story_Skill_Robotics_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_RockClimbing: {
    name: 'trait_CAS_Story_Skill_RockClimbing',
    ignored: true,
  },
  trait_CAS_Story_Skill_RockClimbing_3: {
    name: 'trait_CAS_Story_Skill_RockClimbing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Rocket_Science: {
    name: 'trait_CAS_Story_Skill_Rocket_Science',
    ignored: true,
  },
  trait_CAS_Story_Skill_Rocket_Science_3: {
    name: 'trait_CAS_Story_Skill_Rocket_Science_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Romance: {
    name: 'trait_CAS_Story_Skill_Romance',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Singing: {
    name: 'Trait_CAS_Story_Skill_Singing',
    ignored: true,
  },
  trait_CAS_Story_Skill_Singing_3: {
    name: 'trait_CAS_Story_Skill_Singing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Skiing: {
    name: 'trait_CAS_Story_Skill_Skiing',
    ignored: true,
  },
  trait_CAS_Story_Skill_Skiing_3: {
    name: 'trait_CAS_Story_Skill_Skiing_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Snowboarding: {
    name: 'trait_CAS_Story_Skill_Snowboarding',
    ignored: true,
  },
  trait_CAS_Story_Skill_Snowboarding_3: {
    name: 'trait_CAS_Story_Skill_Snowboarding_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Thanatology: {
    name: 'trait_CAS_Story_Skill_Thanatology',
    ignored: true,
  },
  trait_CAS_Story_Skill_Thanatology_3: {
    name: 'trait_CAS_Story_Skill_Thanatology_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Vampire_Lore: {
    name: 'trait_CAS_Story_Skill_Vampire_Lore',
    ignored: true,
  },
  trait_CAS_Story_Skill_Vampire_Lore_3: {
    name: 'trait_CAS_Story_Skill_Vampire_Lore_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Veterinarian: {
    name: 'Trait_CAS_Story_Skill_Veterinarian',
    ignored: true,
  },
  trait_CAS_Story_Skill_Veterinarian_3: {
    name: 'trait_CAS_Story_Skill_Veterinarian_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Video_Gaming: {
    name: 'trait_CAS_Story_Skill_Video_Gaming',
    ignored: true,
  },
  trait_CAS_Story_Skill_Video_Gaming_3: {
    name: 'trait_CAS_Story_Skill_Video_Gaming_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Violin: {
    name: 'trait_CAS_Story_Skill_Violin',
    ignored: true,
  },
  trait_CAS_Story_Skill_Violin_3: {
    name: 'trait_CAS_Story_Skill_Violin_3',
    ignored: true,
  },
  Trait_CAS_Story_Skill_Wellness: {
    name: 'Trait_CAS_Story_Skill_Wellness',
    ignored: true,
  },
  trait_CAS_Story_Skill_Wellness_3: {
    name: 'trait_CAS_Story_Skill_Wellness_3',
    ignored: true,
  },
  trait_CAS_Story_Skill_Writing: {
    name: 'trait_CAS_Story_Skill_Writing',
    ignored: true,
  },
  trait_CAS_Story_Skill_Writing_3: {
    name: 'trait_CAS_Story_Skill_Writing_3',
    ignored: true,
  },
  trait_CatLover: {
    name: 'trait_CatLover',
    description: 'loves cats',
  },
  trait_CatQuirk_SleepStyle_Back: {
    name: 'trait_CatQuirk_SleepStyle_Back',
    description: 'likes to sleep on back',
  },
  trait_CatQuirk_SleepStyle_Curl: {
    name: 'trait_CatQuirk_SleepStyle_Curl',
    description: 'likes to curl up to sleep',
  },
  trait_CatQuirk_StandWatch_False: {
    name: 'trait_CatQuirk_StandWatch_False',
    description: "doesn't like to stand watch",
  },
  trait_CatQuirk_StandWatch_True: {
    name: 'trait_CatQuirk_StandWatch_True',
    description: 'likes to stand watch',
  },
  trait_Cauldron_Potion_Immortality: {
    name: 'trait_Cauldron_Potion_Immortality',
    description: 'is immortal',
  },
  trait_Cauldron_Potion_Luck_Clumsy: {
    name: 'trait_Cauldron_Potion_Luck_Clumsy',
    description: 'is clumsy, laughs at failure instead of becoming upset',
  },
  trait_CelebrityFans_Nervous: {
    name: 'trait_CelebrityFans_Nervous',
    description: 'is nervous being around a celebrity',
  },
  trait_CelebrityFans_Social: {
    name: 'trait_CelebrityFans_Social',
    description: 'is very talkative with celebrities',
  },
  trait_CelebrityFans_Touchy: {
    name: 'trait_CelebrityFans_Touchy',
    description: 'is very touchy with celebrity',
  },
  trait_ChampionOfThePeople: {
    name: 'trait_ChampionOfThePeople',
    description: 'is a true Champion of the People',
  },
  trait_ChasedByDeath: {
    name: 'trait_ChasedByDeath',
    description: 'lives life to the fullest, loves near death experiences',
  },
  trait_Cheerful: {
    name: 'trait_Cheerful',
    ignored: false,
    description: 'is cheerful',
  },
  trait_child: {
    name: 'trait_child',
    ignored: true,
  },
  trait_ChildConfidence_High: {
    name: 'trait_ChildConfidence_High',
    description: 'has high confidence',
  },
  trait_ChildConfidence_Low: {
    name: 'trait_ChildConfidence_Low',
    ignored: false,
    description: 'has low confidence',
  },
  trait_ChildConfidence_Neutral: {
    name: 'trait_ChildConfidence_Neutral',
    ignored: true,
  },
  trait_ChildhoodPhase_Bear: {
    name: 'trait_ChildhoodPhase_Bear',
    description: 'loves to dress up as a bear',
  },
  trait_ChildhoodPhase_Clingy: {
    name: 'trait_ChildhoodPhase_Clingy',
    description: 'is clingy',
  },
  trait_ChildhoodPhase_Distant: {
    name: 'trait_ChildhoodPhase_Distant',
    description: 'is distant',
  },
  trait_ChildhoodPhase_Loud: {
    name: 'trait_ChildhoodPhase_Loud',
    description: 'is loud',
  },
  trait_ChildhoodPhase_MeanStreak: {
    name: 'trait_ChildhoodPhase_MeanStreak',
    description: 'is on a mean streak',
  },
  trait_ChildhoodPhase_PickyEater_A: {
    name: 'trait_ChildhoodPhase_PickyEater_A',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_PickyEater_B: {
    name: 'trait_ChildhoodPhase_PickyEater_B',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_PickyEater_C: {
    name: 'trait_ChildhoodPhase_PickyEater_C',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_PickyEater_D: {
    name: 'trait_ChildhoodPhase_PickyEater_D',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_PickyEater_DisgustedByFood: {
    name: 'trait_ChildhoodPhase_PickyEater_DisgustedByFood',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_PickyEater_E: {
    name: 'trait_ChildhoodPhase_PickyEater_E',
    description: 'is a picky eater',
  },
  trait_ChildhoodPhase_Rebellious: {
    name: 'trait_ChildhoodPhase_Rebellious',
    description: 'is rebellious',
  },
  trait_Childish: {
    name: 'trait_Childish',
    description: 'is childish',
  },
  trait_ChildoftheOcean: {
    name: 'trait_ChildoftheOcean',
    description: 'likes water based activities',
  },
  trait_ChildoftheSEA: {
    name: 'trait_ChildoftheSEA',
    ignored: true,
  },
  trait_ChildSkillReward_Headstrong: {
    name: 'trait_ChildSkillReward_Headstrong',
    description: 'is headstrong',
  },
  trait_ChildSkillReward_IdeaPerson: {
    name: 'trait_ChildSkillReward_IdeaPerson',
    description: 'is creative',
  },
  trait_ChildSkillReward_PackAnimal: {
    name: 'trait_ChildSkillReward_PackAnimal',
    description: 'like improving themselves',
  },
  trait_ChildSkillReward_PraticedHost: {
    name: 'trait_ChildSkillReward_PraticedHost',
    description: 'is good at hosting events',
  },
  trait_ChopstickSavvy: {
    name: 'trait_ChopstickSavvy',
    ignored: false,
    description: 'is chopstick savvy',
  },
  trait_Chronicler: {
    name: 'trait_Chronicler',
    ignored: false,
    description: 'is a chronicler',
  },
  trait_CivicPolicy_CommunalOwnership: {
    name: 'trait_CivicPolicy_CommunalOwnership',
    ignored: true,
  },
  trait_CivicPolicy_EcoFriendlyAppliances: {
    name: 'trait_CivicPolicy_EcoFriendlyAppliances',
    ignored: true,
  },
  trait_CivicPolicy_GreenGardening: {
    name: 'trait_CivicPolicy_GreenGardening',
    ignored: true,
  },
  trait_CivicPolicy_ModernPolicy: {
    name: 'trait_CivicPolicy_ModernPolicy',
    ignored: true,
  },
  trait_CivicPolicy_RepealStarted: {
    name: 'trait_CivicPolicy_RepealStarted',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_Aggression: {
    name: 'trait_CivicPolicy_SkillBased_Aggression',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_CreativeArts: {
    name: 'trait_CivicPolicy_SkillBased_CreativeArts',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_FreeLove: {
    name: 'trait_CivicPolicy_SkillBased_FreeLove',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_FunCommunity: {
    name: 'trait_CivicPolicy_SkillBased_FunCommunity',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_HomeCooking: {
    name: 'trait_CivicPolicy_SkillBased_HomeCooking',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_JuicedCommunity: {
    name: 'trait_CivicPolicy_SkillBased_JuicedCommunity',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_MusicArts: {
    name: 'trait_CivicPolicy_SkillBased_MusicArts',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_OldDays: {
    name: 'trait_CivicPolicy_SkillBased_OldDays',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_SelfCare: {
    name: 'trait_CivicPolicy_SkillBased_SelfCare',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_SelfSufficient: {
    name: 'trait_CivicPolicy_SkillBased_SelfSufficient',
    ignored: true,
  },
  trait_CivicPolicy_SkillBased_TechnologicalProgress: {
    name: 'trait_CivicPolicy_SkillBased_TechnologicalProgress',
    ignored: true,
  },
  trait_CivicPolicy_UpcyclingInitiative: {
    name: 'trait_CivicPolicy_UpcyclingInitiative',
    ignored: true,
  },
  trait_CivicPolicy_UtilityProduction: {
    name: 'trait_CivicPolicy_UtilityProduction',
    ignored: true,
  },
  trait_ClubPresident: {
    name: 'trait_ClubPresident',
    description:
      'is a natural leader and will overthrow other leaders with ease',
  },
  trait_Clumsy: {
    name: 'trait_Clumsy',
    ignored: false,
    description: 'is clumsy',
  },
  trait_ColdHearted: {
    name: 'trait_ColdHearted',
    ignored: false,
    description: 'is cold-hearted',
  },
  trait_Collector: {
    name: 'trait_Collector',
    ignored: false,
    description: 'is a Collector',
  },
  trait_CollegeOrganization_SecretSociety_Member: {
    name: 'trait_CollegeOrganization_SecretSociety_Member',
    description: 'is a secret society member',
  },
  trait_CommitmentIssues: {
    name: 'trait_CommitmentIssues',
    ignored: false,
    description: 'has commitment issues',
  },
  trait_CommunityBoard_AskedAboutCommunity: {
    name: 'trait_CommunityBoard_AskedAboutCommunity',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing: {
    name: 'trait_ComputerGlasses_Wearing',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Blue: {
    name: 'trait_ComputerGlasses_Wearing_Blue',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Green: {
    name: 'trait_ComputerGlasses_Wearing_Green',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Orange: {
    name: 'trait_ComputerGlasses_Wearing_Orange',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Pink: {
    name: 'trait_ComputerGlasses_Wearing_Pink',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Red: {
    name: 'trait_ComputerGlasses_Wearing_Red',
    ignored: true,
  },
  trait_ComputerGlasses_Wearing_Yellow: {
    name: 'trait_ComputerGlasses_Wearing_Yellow',
    ignored: true,
  },
  trait_Connections: {
    name: 'trait_Connections',
    description: 'has good career social connections',
  },
  trait_CorporateWorker_CharismaticCrooner: {
    name: 'trait_CorporateWorker_CharismaticCrooner',
    description: 'is a charismatic crooner',
  },
  trait_CorporateWorker_LegendaryStamina: {
    name: 'trait_CorporateWorker_LegendaryStamina',
    description: 'always has energy',
  },
  trait_Creative: {
    name: 'trait_Creative',
    ignored: false,
    description: 'is creative',
  },
  trait_CreativelyGifted: {
    name: 'trait_CreativelyGifted',
    ignored: false,
    description: 'is creatively gifted',
  },
  trait_CreativeVisionary: {
    name: 'trait_CreativeVisionary',
    ignored: false,
    description: 'is a creative visionary',
  },
  trait_Cringe: {
    name: 'trait_Cringe',
    description: 'is cringy',
  },
  trait_CrystalHelmet_Alabaster: {
    name: 'trait_CrystalHelmet_Alabaster',
    ignored: true,
  },
  trait_CrystalHelmet_Alexandrite_EP: {
    name: 'trait_CrystalHelmet_Alexandrite_EP',
    ignored: true,
  },
  trait_CrystalHelmet_Amazonite_EP: {
    name: 'trait_CrystalHelmet_Amazonite_EP',
    ignored: true,
  },
  trait_CrystalHelmet_Amethyst: {
    name: 'trait_CrystalHelmet_Amethyst',
    ignored: true,
  },
  trait_CrystalHelmet_Citrine: {
    name: 'trait_CrystalHelmet_Citrine',
    ignored: true,
  },
  trait_CrystalHelmet_Crandestine_EP: {
    name: 'trait_CrystalHelmet_Crandestine_EP',
    ignored: true,
  },
  trait_CrystalHelmet_Diamond: {
    name: 'trait_CrystalHelmet_Diamond',
    ignored: true,
  },
  trait_CrystalHelmet_Emerald: {
    name: 'trait_CrystalHelmet_Emerald',
    ignored: true,
  },
  trait_CrystalHelmet_FireOpal: {
    name: 'trait_CrystalHelmet_FireOpal',
    ignored: true,
  },
  trait_CrystalHelmet_Hematite: {
    name: 'trait_CrystalHelmet_Hematite',
    ignored: true,
  },
  trait_CrystalHelmet_Jet: {
    name: 'trait_CrystalHelmet_Jet',
    ignored: true,
  },
  trait_CrystalHelmet_Jonquilyst: {
    name: 'trait_CrystalHelmet_Jonquilyst',
    ignored: true,
  },
  trait_CrystalHelmet_Nitelite_EP: {
    name: 'trait_CrystalHelmet_Nitelite_EP',
    ignored: true,
  },
  trait_CrystalHelmet_OrangeTopaz: {
    name: 'trait_CrystalHelmet_OrangeTopaz',
    ignored: true,
  },
  trait_CrystalHelmet_Peach: {
    name: 'trait_CrystalHelmet_Peach',
    ignored: true,
  },
  trait_CrystalHelmet_Plumbite: {
    name: 'trait_CrystalHelmet_Plumbite',
    ignored: true,
  },
  trait_CrystalHelmet_Quartz: {
    name: 'trait_CrystalHelmet_Quartz',
    ignored: true,
  },
  trait_CrystalHelmet_Rainborz: {
    name: 'trait_CrystalHelmet_Rainborz',
    ignored: true,
  },
  trait_CrystalHelmet_Rose: {
    name: 'trait_CrystalHelmet_Rose',
    ignored: true,
  },
  trait_CrystalHelmet_Ruby: {
    name: 'trait_CrystalHelmet_Ruby',
    ignored: true,
  },
  trait_CrystalHelmet_Sapphire: {
    name: 'trait_CrystalHelmet_Sapphire',
    ignored: true,
  },
  trait_CrystalHelmet_Shinalite: {
    name: 'trait_CrystalHelmet_Shinalite',
    ignored: true,
  },
  trait_CrystalHelmet_Simanite: {
    name: 'trait_CrystalHelmet_Simanite',
    ignored: true,
  },
  trait_CrystalHelmet_Turquoise: {
    name: 'trait_CrystalHelmet_Turquoise',
    ignored: true,
  },
  trait_Curses_FountainOfMagic: {
    name: 'trait_Curses_FountainOfMagic',
    ignored: true,
  },
  trait_Curses_HexOfDuelist: {
    name: 'trait_Curses_HexOfDuelist',
    ignored: true,
  },
  trait_Curses_InfectiousLaughter: {
    name: 'trait_Curses_InfectiousLaughter',
    ignored: false,
    description: 'is cursed with infectious laughter',
  },
  trait_Curses_NightStalker: {
    name: 'trait_Curses_NightStalker',
    ignored: true,
  },
  trait_Curses_PunchableFace: {
    name: 'trait_Curses_PunchableFace',
    ignored: false,
    description: 'is cursed with a punchable face',
  },
  trait_Curses_Repulsiveness: {
    name: 'trait_Curses_Repulsiveness',
    ignored: false,
    description: 'is cursed with a repulsive face',
  },
  trait_Curses_SweatyStench: {
    name: 'trait_Curses_SweatyStench',
    ignored: false,
    description: 'is cursed to always have a sweaty stench',
  },
  trait_Curses_TouchyFeely: {
    name: 'trait_Curses_TouchyFeely',
    description: 'is cursed to be touchy-feely towards others',
  },
  trait_Curses_WildMagic: {
    name: 'trait_Curses_WildMagic',
    ignored: true,
  },
  trait_DanceMachine: {
    name: 'trait_DanceMachine',
    description: 'is a dance machine and loves to dance',
  },
  trait_Dastardly: {
    name: 'trait_Dastardly',
    ignored: false,
    description: 'is dastardly',
  },
  trait_Dauntless: {
    name: 'trait_Dauntless',
    ignored: false,
    description: 'is dauntless',
  },
  trait_DetectiveCareer_Criminal: {
    name: 'trait_DetectiveCareer_Criminal',
    ignored: true,
  },
  trait_DetectiveCareer_PoliceStationCriminalNPC: {
    name: 'trait_DetectiveCareer_PoliceStationCriminalNPC',
    ignored: true,
  },
  trait_Discipline_Pet_PottyTraining: {
    name: 'trait_Discipline_Pet_PottyTraining',
    ignored: true,
  },
  trait_DisciplinedOut_Cat_JumpOnCounters: {
    name: 'trait_DisciplinedOut_Cat_JumpOnCounters',
    ignored: true,
  },
  trait_DisciplinedOut_Cat_Scratching: {
    name: 'trait_DisciplinedOut_Cat_Scratching',
    ignored: true,
  },
  trait_DisciplinedOut_Dog_Bark: {
    name: 'trait_DisciplinedOut_Dog_Bark',
    ignored: true,
  },
  trait_DisciplinedOut_Dog_EatPoop: {
    name: 'trait_DisciplinedOut_Dog_EatPoop',
    ignored: true,
  },
  trait_DisciplinedOut_Dog_JumpOnCounters: {
    name: 'trait_DisciplinedOut_Dog_JumpOnCounters',
    ignored: true,
  },
  trait_DisciplinedOut_Dog_PuddlesPlay: {
    name: 'trait_DisciplinedOut_Dog_PuddlesPlay',
    ignored: true,
  },
  trait_DisciplinedOut_Dog_Toilet: {
    name: 'trait_DisciplinedOut_Dog_Toilet',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_Attack: {
    name: 'trait_DisciplinedOut_Pet_Attack',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_BegEating: {
    name: 'trait_DisciplinedOut_Pet_BegEating',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_EatPeopleFood: {
    name: 'trait_DisciplinedOut_Pet_EatPeopleFood',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_PottyTraining: {
    name: 'trait_DisciplinedOut_Pet_PottyTraining',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_PuddlesDrink: {
    name: 'trait_DisciplinedOut_Pet_PuddlesDrink',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_TrashEat: {
    name: 'trait_DisciplinedOut_Pet_TrashEat',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_TrashPlay: {
    name: 'trait_DisciplinedOut_Pet_TrashPlay',
    ignored: true,
  },
  trait_DisciplinedOut_Pet_WakeUpSims: {
    name: 'trait_DisciplinedOut_Pet_WakeUpSims',
    ignored: true,
  },
  trait_DisgustedByFood: {
    name: 'trait_DisgustedByFood',
    description: 'is disgusted by food',
  },
  trait_Doctor_SicknessResistant: {
    name: 'trait_Doctor_SicknessResistant',
    description: 'is immune to sickness',
  },
  trait_DogLover: {
    name: 'trait_DogLover',
    ignored: false,
    description: 'is a dog lover',
  },
  trait_DogQuirk_BarkerLoud: {
    name: 'trait_DogQuirk_BarkerLoud',
    description: 'is a loud barker',
  },
  trait_DogQuirk_BarkerNeutral: {
    name: 'trait_DogQuirk_BarkerNeutral',
    ignored: true,
  },
  trait_DogQuirk_BarkerQuiet: {
    name: 'trait_DogQuirk_BarkerQuiet',
    description: 'has a quiet bark',
  },
  trait_eco_master: {
    name: 'trait_eco_master',
    ignored: false,
    description: 'is an eco master and loves being eco-concious',
  },
  trait_EcoEngineer: {
    name: 'trait_EcoEngineer',
    ignored: false,
    description: 'is an Eco-Engineer',
  },
  trait_elder: {
    name: 'trait_elder',
    ignored: true,
  },
  trait_entrepreneur: {
    name: 'trait_entrepreneur',
    ignored: false,
    description: 'is an entrepreneur',
  },
  trait_Entrepreneur_TheKnowledge: {
    name: 'trait_Entrepreneur_TheKnowledge',
    ignored: false,
    description: 'is an Entrepreneur',
  },
  trait_Entrepreneurial: {
    name: 'trait_Entrepreneurial',
    ignored: false,
    description: 'is entrepreneurial',
  },
  trait_EP12Death_Ghost_UrbanMyth_Fear: {
    name: 'trait_EP12Death_Ghost_UrbanMyth_Fear',
    ignored: true,
  },
  trait_EP17Festival_TreeSpree_TemporaryGhost_FeelingLucky: {
    name: 'trait_EP17Festival_TreeSpree_TemporaryGhost_FeelingLucky',
    ignored: true,
  },
  trait_EP17World_AliceTree_QuestComplete: {
    name: 'trait_EP17World_AliceTree_QuestComplete',
    ignored: true,
  },
  trait_EP17World_AliceTree_QuestComplete_AliceOnly: {
    name: 'trait_EP17World_AliceTree_QuestComplete_AliceOnly',
    ignored: true,
  },
  trait_EP17World_RiverStyx_TemporaryGhost: {
    name: 'trait_EP17World_RiverStyx_TemporaryGhost',
    ignored: true,
  },
  trait_EP17World_WellOfSouls_Courage: {
    name: 'trait_EP17World_WellOfSouls_Courage',
    ignored: true,
  },
  trait_EpicPoet: {
    name: 'trait_EpicPoet',
    ignored: false,
    description: 'is an Epic Poet',
  },
  trait_EssenceOfFlavor: {
    name: 'trait_EssenceOfFlavor',
    description: 'is good at cooking and making drinks',
  },
  trait_EternalBond: {
    name: 'trait_EternalBond',
    ignored: false,
    description: 'has an Eternal Bond with their spouse',
  },
  trait_Evil: {
    name: 'trait_Evil',
    ignored: false,
    description: 'is Evil',
  },
  trait_Evil_BegoniaScent: {
    name: 'trait_Evil_BegoniaScent',
    description: 'is happy when others are in dismay',
  },
  trait_Excursion_Mountaineer_Rank1: {
    name: 'trait_Excursion_Mountaineer_Rank1',
    ignored: false,
    description: 'is a mountaineer',
  },
  trait_Excursion_Mountaineer_Rank2: {
    name: 'trait_Excursion_Mountaineer_Rank2',
    ignored: false,
    description: 'is a mountaineer',
  },
  trait_Excursion_Mountaineer_Rank3: {
    name: 'trait_Excursion_Mountaineer_Rank3',
    ignored: false,
    description: 'is a mountaineer',
  },
  trait_Expressionistic: {
    name: 'trait_Expressionistic',
    ignored: false,
    description: 'is expressionistic',
  },
  trait_FakeGenius: {
    name: 'trait_FakeGenius',
    description: 'has drank a potion to become temporarily a genius',
  },
  trait_FamilyOriented: {
    name: 'trait_FamilyOriented',
    description: 'is family-oriented',
  },
  trait_FamilySim: {
    name: 'trait_FamilySim',
    ignored: false,
    description: 'is family-oriented',
  },
  trait_FastFastidious: {
    name: 'trait_FastFastidious',
    ignored: false,
    description: 'is fastidious',
  },
  trait_Fear_BeingAlone: {
    name: 'trait_Fear_BeingAlone',
    description: 'fears being alone without a relationship',
  },
  trait_Fear_BeingCheatedOn: {
    name: 'trait_Fear_BeingCheatedOn',
    ignored: false,
    description: 'fears being cheated on',
  },
  trait_Fear_BeingJudged: {
    name: 'trait_Fear_BeingJudged',
    ignored: false,
    description: 'fears being judged',
  },
  trait_Fear_Cowplant: {
    name: 'trait_Fear_Cowplant',
    ignored: false,
    description: 'is fearful of Cowplants',
  },
  trait_Fear_CrowdedPlaces: {
    name: 'trait_Fear_CrowdedPlaces',
    ignored: false,
    description: 'is fearful of crowded places',
  },
  trait_Fear_Dark: {
    name: 'trait_Fear_Dark',
    ignored: false,
    description: 'is afraid of the dark',
  },
  trait_Fear_DeadEndJob: {
    name: 'trait_Fear_DeadEndJob',
    ignored: false,
    description: 'is fearful about their dead-end job',
  },
  trait_Fear_Death: {
    name: 'trait_Fear_Death',
    ignored: false,
    description: 'is fearful of death',
  },
  Trait_Fear_DisappointingParents: {
    name: 'Trait_Fear_DisappointingParents',
    ignored: false,
    description: 'is afraid of disappointing their parents',
  },
  trait_Fear_DisappointingParents_ParentDeceasedFlag: {
    name: 'trait_Fear_DisappointingParents_ParentDeceasedFlag',
    ignored: true,
  },
  trait_Fear_Eviction: {
    name: 'trait_Fear_Eviction',
    description:
      'is terrified that they are about to get evicted from their home',
  },
  Trait_Fear_Failing_AfterSchoolActivities: {
    name: 'Trait_Fear_Failing_AfterSchoolActivities',
    ignored: false,
    description:
      'occasionally relives a moment of failure and has great fear from it',
  },
  Trait_Fear_Failing_Class: {
    name: 'Trait_Fear_Failing_Class',
    ignored: false,
    description: 'is feeling pressure of passing their classes',
  },
  Trait_Fear_Failing_Tests: {
    name: 'Trait_Fear_Failing_Tests',
    ignored: false,
    description: 'is fearful of failing tests',
  },
  trait_Fear_Failure: {
    name: 'trait_Fear_Failure',
    ignored: false,
    description: 'has a fear of failure',
  },
  trait_Fear_Fire: {
    name: 'trait_Fear_Fire',
    ignored: false,
    description: 'is scared of fire',
  },
  trait_Fear_Ghosts: {
    name: 'trait_Fear_Ghosts',
    ignored: false,
    description: 'is scared of ghosts',
  },
  Trait_Fear_Homework: {
    name: 'Trait_Fear_Homework',
    description: 'has anxiety when doing homework',
  },
  trait_Fear_Horses: {
    name: 'trait_Fear_Horses',
    description: 'is afraid of horses',
  },
  trait_Fear_Horses_Progress: {
    name: 'trait_Fear_Horses_Progress',
    description: 'has a fear of horses',
  },
  trait_Fear_Inferior: {
    name: 'trait_Fear_Inferior',
    ignored: false,
    description: 'struggles with confidence',
  },
  trait_Fear_Intimacy: {
    name: 'trait_Fear_Intimacy',
    description: 'is afraid of physical and emotional connections',
  },
  trait_Fear_Swimming: {
    name: 'trait_Fear_Swimming',
    ignored: false,
    description: 'is fearful of swimming',
  },
  trait_Fear_Unfulfilled: {
    name: 'trait_Fear_Unfulfilled',
    ignored: false,
    description: 'is fearful that they are living an unfulfilling life',
  },
  trait_Fertile: {
    name: 'trait_Fertile',
    ignored: false,
    description: 'is very fertile',
  },
  trait_FilthDweller: {
    name: 'trait_FilthDweller',
    ignored: false,
    description: 'loathes cleaning and loves living in filth',
  },
  trait_Fizzyhead: {
    name: 'trait_Fizzyhead',
    ignored: false,
    description: 'likes kombucha and juice fizzy drinks',
  },
  trait_FlowerBunny: {
    name: 'trait_FlowerBunny',
    ignored: true,
  },
  trait_Foodie: {
    name: 'trait_Foodie',
    ignored: false,
    description: 'is a foodie',
  },
  trait_ForestGhost: {
    name: 'trait_ForestGhost',
    ignored: true,
  },
  trait_ForestGhost_Gloomy: {
    name: 'trait_ForestGhost_Gloomy',
    ignored: true,
  },
  trait_ForestGhost_Goofy: {
    name: 'trait_ForestGhost_Goofy',
    ignored: true,
  },
  trait_ForestGhost_Mean: {
    name: 'trait_ForestGhost_Mean',
    ignored: true,
  },
  trait_ForeverFresh: {
    name: 'trait_ForeverFresh',
    ignored: false,
    description: 'never needs to shower or bathe to stay fresh',
  },
  trait_ForeverFull: {
    name: 'trait_ForeverFull',
    ignored: false,
    description: "is Forever Full and doesn't require food to live",
  },
  trait_Fox_AnimalClothing_Grandma1: {
    name: 'trait_Fox_AnimalClothing_Grandma1',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Grandma2: {
    name: 'trait_Fox_AnimalClothing_Grandma2',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Grandma3: {
    name: 'trait_Fox_AnimalClothing_Grandma3',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Grandma4: {
    name: 'trait_Fox_AnimalClothing_Grandma4',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Grandma5: {
    name: 'trait_Fox_AnimalClothing_Grandma5',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Grandma6: {
    name: 'trait_Fox_AnimalClothing_Grandma6',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber1: {
    name: 'trait_Fox_AnimalClothing_Robber1',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber2: {
    name: 'trait_Fox_AnimalClothing_Robber2',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber3: {
    name: 'trait_Fox_AnimalClothing_Robber3',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber4: {
    name: 'trait_Fox_AnimalClothing_Robber4',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber5: {
    name: 'trait_Fox_AnimalClothing_Robber5',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber6: {
    name: 'trait_Fox_AnimalClothing_Robber6',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robber7: {
    name: 'trait_Fox_AnimalClothing_Robber7',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood1: {
    name: 'trait_Fox_AnimalClothing_Robinhood1',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood2: {
    name: 'trait_Fox_AnimalClothing_Robinhood2',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood3: {
    name: 'trait_Fox_AnimalClothing_Robinhood3',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood4: {
    name: 'trait_Fox_AnimalClothing_Robinhood4',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood5: {
    name: 'trait_Fox_AnimalClothing_Robinhood5',
    ignored: true,
  },
  trait_Fox_AnimalClothing_Robinhood6: {
    name: 'trait_Fox_AnimalClothing_Robinhood6',
    ignored: true,
  },
  trait_Fox_Default: {
    name: 'trait_Fox_Default',
    ignored: true,
  },
  trait_Fox_Walkstyle: {
    name: 'trait_Fox_Walkstyle',
    ignored: true,
  },
  trait_Freegan: {
    name: 'trait_Freegan',
    ignored: false,
    description: 'is antiwork and anti consumerism',
  },
  trait_Freelancer_Career_Completed_Meet_With_Client: {
    name: 'trait_Freelancer_Career_Completed_Meet_With_Client',
    ignored: true,
  },
  trait_Freelancer_Career_Fashion_Photographer_Unlocked_MagazineCover_Submission:
    {
      name: 'trait_Freelancer_Career_Fashion_Photographer_Unlocked_MagazineCover_Submission',
      ignored: true,
    },
  trait_Freelancer_Career_Fashion_Photographer_Unlocked_PhotoEditor: {
    name: 'trait_Freelancer_Career_Fashion_Photographer_Unlocked_PhotoEditor',
    ignored: true,
  },
  trait_Freelancer_Career_Fashion_Photographer_Waiting_For_Magazine: {
    name: 'trait_Freelancer_Career_Fashion_Photographer_Waiting_For_Magazine',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_Fashion_Photographer: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_Fashion_Photographer',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_InteriorDecorator: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_InteriorDecorator',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_Maker: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_Maker',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_Painting: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_Painting',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_ParanormalInvestigator: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_ParanormalInvestigator',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_Programming: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_Programming',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Agencies_Writing: {
    name: 'trait_Freelancer_Career_Hidden_Agencies_Writing',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Bonus_Gig_Payout: {
    name: 'trait_Freelancer_Career_Hidden_Bonus_Gig_Payout',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Unlocked_Meet: {
    name: 'trait_Freelancer_Career_Hidden_Unlocked_Meet',
    ignored: true,
  },
  trait_Freelancer_Career_Hidden_Unlocked_Overclock: {
    name: 'trait_Freelancer_Career_Hidden_Unlocked_Overclock',
    ignored: true,
  },
  trait_Freelancer_Career_ParanormalInvestigator_License: {
    name: 'trait_Freelancer_Career_ParanormalInvestigator_License',
    ignored: true,
  },
  trait_FreeServices: {
    name: 'trait_FreeServices',
    ignored: true,
  },
  trait_FreshChef: {
    name: 'trait_FreshChef',
    ignored: false,
    description: 'is a high quality chef that can make food that never spoils',
  },
  trait_FriendOfTheSea: {
    name: 'trait_FriendOfTheSea',
    ignored: false,
    description: 'is friends with dolphins and mermaids',
  },
  trait_Frugal: {
    name: 'trait_Frugal',
    ignored: false,
    description: 'is frugal',
  },
  trait_FTUE_CareerMinded_initial: {
    name: 'trait_FTUE_CareerMinded_initial',
    ignored: false,
    description: 'is career-minded',
  },
  trait_Gameplay_Mounted_Buffs: {
    name: 'trait_Gameplay_Mounted_Buffs',
    ignored: true,
  },
  trait_Geek: {
    name: 'trait_Geek',
    ignored: false,
    description: 'is a geek',
  },
  trait_GenderFemale: {
    name: 'trait_GenderFemale',
    ignored: true,
  },
  trait_GenderMale: {
    name: 'trait_GenderMale',
    ignored: true,
  },
  trait_GenderOptions_AttractedTo_Female: {
    name: 'trait_GenderOptions_AttractedTo_Female',
    description: 'is attracted to girls',
  },
  trait_GenderOptions_AttractedTo_Male: {
    name: 'trait_GenderOptions_AttractedTo_Male',
    description: 'is attracted to boys',
  },
  trait_GenderOptions_AttractedTo_NotFemale: {
    name: 'trait_GenderOptions_AttractedTo_NotFemale',
    description: 'is not attracted to females',
  },
  trait_GenderOptions_AttractedTo_NotMale: {
    name: 'trait_GenderOptions_AttractedTo_NotMale',
    description: 'is not attracted to males',
  },
  trait_GenderOptions_Clothing_MensWear: {
    name: 'trait_GenderOptions_Clothing_MensWear',
    description: 'likes wearing mens clothing',
  },
  trait_GenderOptions_Clothing_WomensWear: {
    name: 'trait_GenderOptions_Clothing_WomensWear',
    description: 'likes wearing womens clothing',
  },
  trait_GenderOptions_Frame_Feminine: {
    name: 'trait_GenderOptions_Frame_Feminine',
    description: 'has a feminine body type',
  },
  trait_GenderOptions_Frame_Masculine: {
    name: 'trait_GenderOptions_Frame_Masculine',
    description: 'has a masculine body type',
  },
  trait_GenderOptions_Lactate_Can: {
    name: 'trait_GenderOptions_Lactate_Can',
    description: 'is able to lactate and produce milk',
  },
  trait_GenderOptions_Lactate_CanNot: {
    name: 'trait_GenderOptions_Lactate_CanNot',
    ignored: true,
  },
  trait_GenderOptions_Pregnancy_CanBeImpregnated: {
    name: 'trait_GenderOptions_Pregnancy_CanBeImpregnated',
    description:
      'is able to become pregnant with a child and become impregnated when having sex',
  },
  trait_GenderOptions_Pregnancy_CanImpregnate: {
    name: 'trait_GenderOptions_Pregnancy_CanImpregnate',
    ignored: true,
    description: 'is able to impregnate others with a child when having sex',
  },
  trait_GenderOptions_Pregnancy_CanNot_BeImpregnated: {
    name: 'trait_GenderOptions_Pregnancy_CanNot_BeImpregnated',
    ignored: true,
  },
  trait_GenderOptions_Pregnancy_CanNotImpregnate: {
    name: 'trait_GenderOptions_Pregnancy_CanNotImpregnate',
    ignored: true,
  },
  trait_GenderOptions_Sexuality_Exploring: {
    name: 'trait_GenderOptions_Sexuality_Exploring',
    description: 'is exploring their sexuality',
  },
  trait_GenderOptions_Sexuality_NotExploring: {
    name: 'trait_GenderOptions_Sexuality_NotExploring',
    description: 'is firm in their sexuality',
  },
  trait_GenderOptions_Toilet_Sitting: {
    name: 'trait_GenderOptions_Toilet_Sitting',
    description: 'sits down when using the toilet',
  },
  trait_GenderOptions_Toilet_Standing: {
    name: 'trait_GenderOptions_Toilet_Standing',
    description: 'stands up when using the toilet',
  },
  trait_Generous: {
    name: 'trait_Generous',
    description: 'is generous with money and empathy',
  },
  trait_Genius: {
    name: 'trait_Genius',
    ignored: false,
    description: 'is a genius',
  },
  trait_ghost_Anger: {
    name: 'trait_ghost_Anger',
    ignored: false,
    description: 'is a ghost who died by being too angry',
  },
  trait_Ghost_AnimalObjects_KillerChicken: {
    name: 'trait_Ghost_AnimalObjects_KillerChicken',
    ignored: false,
    description:
      'is a ghost because they were mean to a chicken, and then the chicken killed them',
  },
  trait_Ghost_AnimalObjects_KillerRabbit: {
    name: 'trait_Ghost_AnimalObjects_KillerRabbit',
    ignored: false,
    description: 'is a ghost because they were killed by a killer rabbit',
  },
  trait_Ghost_Beetle: {
    name: 'trait_Ghost_Beetle',
    ignored: false,
    description:
      'is a ghost because they drank three beetlejuice drinks and then died',
  },
  trait_Ghost_BrokenHeart: {
    name: 'trait_Ghost_BrokenHeart',
    description: 'is a ghost because they died of a broken heart',
  },
  trait_Ghost_Cauldron_Potion_Immortality_Failure: {
    name: 'trait_Ghost_Cauldron_Potion_Immortality_Failure',
    ignored: false,
    description:
      'is a ghost temporarily because they tried to make an immortality potion and they are temporarily dead',
  },
  trait_Ghost_ClimbingRoute: {
    name: 'trait_Ghost_ClimbingRoute',
    ignored: false,
    description: 'is a ghost because they fell from great heights and died',
  },
  trait_ghost_Cowplant: {
    name: 'trait_ghost_Cowplant',
    ignored: false,
    description: 'is a ghost who died by being eaten by a carnivorous Cowplant',
  },
  trait_Ghost_Curses_NightStalker_Stalker: {
    name: 'trait_Ghost_Curses_NightStalker_Stalker',
    description:
      'is a night wraith ghost stalker who is translucent white and sad and scary',
  },
  trait_Ghost_DeathFlower: {
    name: 'trait_Ghost_DeathFlower',
    ignored: false,
    description: 'is a ghost who died by a Death Flower when they smelled it',
  },
  trait_ghost_Drown: {
    name: 'trait_ghost_Drown',
    ignored: false,
    description: 'is a ghost who died by drowning',
  },
  trait_ghost_ElderExhaustion: {
    name: 'trait_ghost_ElderExhaustion',
    ignored: false,
    description:
      'is a ghost who died from becoming exhausted and overdoing it as an old person',
  },
  trait_ghost_Electrocution: {
    name: 'trait_ghost_Electrocution',
    ignored: false,
    description: 'is a ghost who died by electrocution',
  },
  trait_ghost_Embarrassment: {
    name: 'trait_ghost_Embarrassment',
    ignored: false,
    description: 'is a ghost who died of embarassment',
  },
  trait_ghost_Fire: {
    name: 'trait_ghost_Fire',
    ignored: false,
    description: 'is a ghost who died in a fire',
  },
  trait_Ghost_Flies: {
    name: 'trait_Ghost_Flies',
    ignored: false,
    description: 'is a ghost who died by being swarmed by flies',
  },
  trait_ghost_Frozen: {
    name: 'trait_ghost_Frozen',
    ignored: false,
    description: 'is a ghost who froze to death',
  },
  trait_ghost_Hunger: {
    name: 'trait_ghost_Hunger',
    ignored: false,
    description: 'is a ghost who died from starvation',
  },
  trait_ghost_Laugher: {
    name: 'trait_ghost_Laugher',
    ignored: false,
    description: 'is a ghost who died from laughing too hard',
  },
  trait_Ghost_Lightning: {
    name: 'trait_Ghost_Lightning',
    ignored: false,
    description: 'is a ghost who was struck by lightning and died',
  },
  trait_Ghost_Meteorite: {
    name: 'trait_Ghost_Meteorite',
    ignored: false,
    description: 'is a ghost who died from being struck by a meteorite',
  },
  trait_Ghost_MoldSystem: {
    name: 'trait_Ghost_MoldSystem',
    description: 'is a ghost who died from mold sickness',
  },
  trait_Ghost_MotherPlant: {
    name: 'trait_Ghost_MotherPlant',
    ignored: false,
    description: 'is a ghost who died when a large "mother" plant ate them',
  },
  trait_Ghost_MurphyBed: {
    name: 'trait_Ghost_MurphyBed',
    ignored: false,
    description: 'is a ghost who died when a murphy bed closed and killed them',
  },
  trait_ghost_OldAge: {
    name: 'trait_ghost_OldAge',
    ignored: false,
    description: 'is a ghost who died of old age',
  },
  trait_ghost_Overheat: {
    name: 'trait_ghost_Overheat',
    ignored: false,
    description: 'is a ghost who died from overheating',
  },
  trait_Ghost_PetCrow: {
    name: 'trait_Ghost_PetCrow',
    description: 'is a ghost who died from being pecked to death by a crow',
  },
  trait_Ghost_Poison: {
    name: 'trait_Ghost_Poison',
    ignored: false,
    description: 'is a ghost who died by consuming poison',
  },
  trait_Ghost_Pufferfish: {
    name: 'trait_Ghost_Pufferfish',
    ignored: false,
    description: 'is a ghost who died by eating a Pufferfish',
  },
  trait_Ghost_R3Event: {
    name: 'trait_Ghost_R3Event',
    description: 'is temporarily in the form of a ghost',
  },
  trait_Ghost_Rodent_Disease: {
    name: 'trait_Ghost_Rodent_Disease',
    ignored: false,
    description: 'is a ghost who was killed by a rodent disease',
  },
  trait_Ghost_SeanceTable: {
    name: 'trait_Ghost_SeanceTable',
    ignored: false,
    description: 'is temporarily a ghost',
  },
  trait_ghost_Steam: {
    name: 'trait_ghost_Steam',
    ignored: false,
    description: 'is a ghost who died by being burned by steam',
  },
  trait_Ghost_StinkBomb: {
    name: 'trait_Ghost_StinkBomb',
    ignored: false,
    description: 'is a ghost because they died from an exploding stink bomb',
  },
  trait_Ghost_UrbanMyth: {
    name: 'trait_Ghost_UrbanMyth',
    description: 'is a ghost and died from summoning an urban myth in a mirror',
  },
  trait_Ghost_UrbanMyth_EP12Death: {
    name: 'trait_Ghost_UrbanMyth_EP12Death',
    description: 'is a ghost and died from summoning an urban myth in a mirror',
  },
  trait_ghost_Vampire_Sun: {
    name: 'trait_ghost_Vampire_Sun',
    ignored: false,
    description:
      'is a ghost who died because they were a vampire and died from sun exposure',
  },
  trait_Ghost_VendingMachine: {
    name: 'trait_Ghost_VendingMachine',
    ignored: false,
    description: 'is a ghost who died from a vending machine falling on them',
  },
  trait_Ghost_WitchOverload: {
    name: 'trait_Ghost_WitchOverload',
    ignored: false,
    description: 'is a Ghost who died from a witches spell cast upon them',
  },
  trait_GhostHasRebirthedIntoNewSim: {
    name: 'trait_GhostHasRebirthedIntoNewSim',
    ignored: true,
  },
  trait_GhostPowers_Manifested: {
    name: 'trait_GhostPowers_Manifested',
    ignored: true,
  },
  trait_GhostRisen: {
    name: 'trait_GhostRisen',
    ignored: true,
  },
  trait_GhostWhisperer: {
    name: 'trait_GhostWhisperer',
    description: 'is a ghost whisperer and friends with ghosts',
  },
  trait_GhostWoohoo_TempGhost: {
    name: 'trait_GhostWoohoo_TempGhost',
    description:
      'just had a transcendent sexual experience with a ghost and is temporarily a ghost',
  },
  trait_Gloomy: {
    name: 'trait_Gloomy',
    ignored: false,
    description: 'is gloomy',
  },
  trait_Glutton: {
    name: 'trait_Glutton',
    ignored: false,
    description: 'is a glutton',
  },
  trait_Good: {
    name: 'trait_Good',
    ignored: false,
    description: 'is good',
  },
  trait_Goofball: {
    name: 'trait_Goofball',
    ignored: false,
    description: 'is a goofball',
  },
  trait_GradeSchool_A: {
    name: 'trait_GradeSchool_A',
    ignored: true,
  },
  trait_GradeSchool_B: {
    name: 'trait_GradeSchool_B',
    ignored: true,
  },
  trait_GradeSchool_C: {
    name: 'trait_GradeSchool_C',
    ignored: true,
  },
  trait_GradeSchool_D: {
    name: 'trait_GradeSchool_D',
    ignored: true,
  },
  trait_GradeSchool_F: {
    name: 'trait_GradeSchool_F',
    ignored: true,
  },
  trait_GreatKisser: {
    name: 'trait_GreatKisser',
    ignored: false,
    description: 'is a great kisser',
  },
  trait_GreatStoryteller: {
    name: 'trait_GreatStoryteller',
    ignored: false,
    description: 'is a great storyteller',
  },
  trait_GreenFiend: {
    name: 'trait_GreenFiend',
    ignored: false,
    description: 'is eco concious',
  },
  trait_Gregarious: {
    name: 'trait_Gregarious',
    ignored: false,
    description: 'is gregarious',
  },
  trait_Grief_Anger: {
    name: 'trait_Grief_Anger',
    description: 'has anger and grief',
  },
  trait_Grief_Conquered: {
    name: 'trait_Grief_Conquered',
    ignored: true,
  },
  trait_Grief_Denial: {
    name: 'trait_Grief_Denial',
    description:
      'is in grief with denial and is struggling to process their emotions',
  },
  trait_Grief_Depression: {
    name: 'trait_Grief_Depression',
    description: 'is in grief with depression',
  },
  trait_Grief_HoldTogether: {
    name: 'trait_Grief_HoldTogether',
    description: 'is in grief but managing a positive outlook on life',
  },
  trait_GrimRework_GrimBorn: {
    name: 'trait_GrimRework_GrimBorn',
    description: 'is an offspring of the Grim Reaper',
  },
  trait_GrimRework_GrimDescendant: {
    name: 'trait_GrimRework_GrimDescendant',
    description: 'is a descendant of the Grim Reaper',
  },
  trait_Grouch: {
    name: 'trait_Grouch',
    description: 'is a grouch',
  },
  trait_Guidry: {
    name: 'trait_Guidry',
    ignored: true,
  },
  trait_GymRat: {
    name: 'trait_GymRat',
    ignored: false,
    description: 'is a Gym Rat',
  },
  trait_Handedness_Left: {
    name: 'trait_Handedness_Left',
    ignored: false,
    description: 'is left-handed',
  },
  trait_Handedness_Right: {
    name: 'trait_Handedness_Right',
    ignored: false,
    description: 'is right-handed',
  },
  trait_Handyperson_GoldenWrench: {
    name: 'trait_Handyperson_GoldenWrench',
    description: 'is good at repairing things',
  },
  trait_Happy_Toddler: {
    name: 'trait_Happy_Toddler',
    ignored: false,
    description: 'is a Happy Toddler',
  },
  trait_Happy_Toddler_Hidden: {
    name: 'trait_Happy_Toddler_Hidden',
    ignored: true,
  },
  trait_HardlyHungry: {
    name: 'trait_HardlyHungry',
    ignored: false,
    description: 'is rarely hungry',
  },
  trait_HasMetNanny: {
    name: 'trait_HasMetNanny',
    ignored: true,
  },
  trait_HasMetRanchHand: {
    name: 'trait_HasMetRanchHand',
    ignored: true,
  },
  trait_HasVisitedDeepWoods: {
    name: 'trait_HasVisitedDeepWoods',
    description: 'has visited the deep woods',
  },
  trait_HasVisitedForgottenGrotto: {
    name: 'trait_HasVisitedForgottenGrotto',
    description: 'has visited the forgotten grotto',
  },
  trait_HasVisitedSylvanGlade: {
    name: 'trait_HasVisitedSylvanGlade',
    description: 'has visited the sylvan glade',
  },
  trait_HatesChildren: {
    name: 'trait_HatesChildren',
    ignored: false,
    description: 'hates children',
  },
  trait_HauntedHouse_Temperance: {
    name: 'trait_HauntedHouse_Temperance',
    ignored: true,
  },
  trait_HeartToHeart: {
    name: 'trait_HeartToHeart',
    description: 'loves being around happy couples',
  },
  trait_HeroicPresence: {
    name: 'trait_HeroicPresence',
    ignored: false,
    description: 'is a heroic presence',
  },
  trait_HeroOfStrangerville: {
    name: 'trait_HeroOfStrangerville',
    ignored: false,
    description: 'is the Hero of StrangerVille',
  },
  trait_Hidden_AcceptedToUniversity: {
    name: 'trait_Hidden_AcceptedToUniversity',
    description: 'has been accepted to university',
  },
  trait_Hidden_ActorCareer_Agency_AIStaffing: {
    name: 'trait_Hidden_ActorCareer_Agency_AIStaffing',
    ignored: true,
  },
  trait_Hidden_ActorCareer_Agency_EverydayExtras: {
    name: 'trait_Hidden_ActorCareer_Agency_EverydayExtras',
    ignored: true,
  },
  trait_Hidden_ActorCareer_Agency_GRAN: {
    name: 'trait_Hidden_ActorCareer_Agency_GRAN',
    ignored: true,
  },
  trait_Hidden_ActorCareer_Agency_WellSuited: {
    name: 'trait_Hidden_ActorCareer_Agency_WellSuited',
    ignored: true,
  },
  trait_Hidden_AdoptTiger: {
    name: 'trait_Hidden_AdoptTiger',
    ignored: true,
  },
  trait_Hidden_AdoptTiger_Commodity: {
    name: 'trait_Hidden_AdoptTiger_Commodity',
    ignored: true,
  },
  trait_Hidden_Basketball_DreamBig: {
    name: 'trait_Hidden_Basketball_DreamBig',
    ignored: true,
  },
  trait_Hidden_Batuu_Missions_Scoundrel_Contraband_Location_BS: {
    name: 'trait_Hidden_Batuu_Missions_Scoundrel_Contraband_Location_BS',
    ignored: true,
  },
  trait_Hidden_Batuu_Missions_Scoundrel_Contraband_Location_FO: {
    name: 'trait_Hidden_Batuu_Missions_Scoundrel_Contraband_Location_FO',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_AdharaMichaelson: {
    name: 'trait_Hidden_BayArea_NPC_AdharaMichaelson',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_AurelioRobles: {
    name: 'trait_Hidden_BayArea_NPC_AurelioRobles',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_BerniceRobles: {
    name: 'trait_Hidden_BayArea_NPC_BerniceRobles',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_ChristopherMichaelson: {
    name: 'trait_Hidden_BayArea_NPC_ChristopherMichaelson',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_DoliRuano: {
    name: 'trait_Hidden_BayArea_NPC_DoliRuano',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_EleanorSullivan: {
    name: 'trait_Hidden_BayArea_NPC_EleanorSullivan',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_IanRobles: {
    name: 'trait_Hidden_BayArea_NPC_IanRobles',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_IgnacioRobles: {
    name: 'trait_Hidden_BayArea_NPC_IgnacioRobles',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_JayRobles: {
    name: 'trait_Hidden_BayArea_NPC_JayRobles',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_KarmineLuna: {
    name: 'trait_Hidden_BayArea_NPC_KarmineLuna',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_KyleKyleson: {
    name: 'trait_Hidden_BayArea_NPC_KyleKyleson',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_OrionMichaelson: {
    name: 'trait_Hidden_BayArea_NPC_OrionMichaelson',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_PenelopeMichaelson: {
    name: 'trait_Hidden_BayArea_NPC_PenelopeMichaelson',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_TalaRuano: {
    name: 'trait_Hidden_BayArea_NPC_TalaRuano',
    ignored: true,
  },
  trait_Hidden_BayArea_NPC_XochitilLuna: {
    name: 'trait_Hidden_BayArea_NPC_XochitilLuna',
    ignored: true,
  },
  trait_Hidden_BeenKissed: {
    name: 'trait_Hidden_BeenKissed',
    ignored: true,
  },
  trait_Hidden_Bowled_Perfect_Llama: {
    name: 'trait_Hidden_Bowled_Perfect_Llama',
    ignored: true,
  },
  trait_Hidden_Camping: {
    name: 'trait_Hidden_Camping',
    description: 'is camping',
  },
  trait_Hidden_Career_Activist_Cause_Economy: {
    name: 'trait_Hidden_Career_Activist_Cause_Economy',
    ignored: true,
  },
  trait_Hidden_Career_Activist_Cause_Environment: {
    name: 'trait_Hidden_Career_Activist_Cause_Environment',
    ignored: true,
  },
  trait_Hidden_Career_Activist_Cause_Justice: {
    name: 'trait_Hidden_Career_Activist_Cause_Justice',
    ignored: true,
  },
  trait_Hidden_Career_Activist_Cause_Peace: {
    name: 'trait_Hidden_Career_Activist_Cause_Peace',
    ignored: true,
  },
  trait_Hidden_Career_Activist_Cause_Tax: {
    name: 'trait_Hidden_Career_Activist_Cause_Tax',
    ignored: true,
  },
  trait_Hidden_Career_Activist_HasCause: {
    name: 'trait_Hidden_Career_Activist_HasCause',
    ignored: true,
  },
  trait_Hidden_Career_Activist_PoliticalPosition_Left: {
    name: 'trait_Hidden_Career_Activist_PoliticalPosition_Left',
    ignored: true,
  },
  trait_Hidden_Career_Activist_PoliticalPosition_Right: {
    name: 'trait_Hidden_Career_Activist_PoliticalPosition_Right',
    ignored: true,
  },
  Trait_Hidden_Career_Critic_Thrifty: {
    name: 'Trait_Hidden_Career_Critic_Thrifty',
    ignored: true,
  },
  trait_Hidden_Career_Custom: {
    name: 'trait_Hidden_Career_Custom',
    ignored: true,
  },
  trait_Hidden_Career_Lifeguard_Rewards_Level2: {
    name: 'trait_Hidden_Career_Lifeguard_Rewards_Level2',
    ignored: true,
  },
  trait_Hidden_Career_Lifeguard_Rewards_Level3: {
    name: 'trait_Hidden_Career_Lifeguard_Rewards_Level3',
    ignored: true,
  },
  trait_Hidden_Career_Mortician_Cert1: {
    name: 'trait_Hidden_Career_Mortician_Cert1',
    ignored: true,
  },
  trait_Hidden_Career_Mortician_FullCert: {
    name: 'trait_Hidden_Career_Mortician_FullCert',
    ignored: true,
  },
  trait_Hidden_Career_SimsfluencerSideHustle_CanReview: {
    name: 'trait_Hidden_Career_SimsfluencerSideHustle_CanReview',
    ignored: true,
  },
  trait_Hidden_Career_SimsfluencerSideHustle_GiftDelivery: {
    name: 'trait_Hidden_Career_SimsfluencerSideHustle_GiftDelivery',
    ignored: true,
  },
  trait_Hidden_careerIncomeBoost_A: {
    name: 'trait_Hidden_careerIncomeBoost_A',
    ignored: true,
  },
  trait_Hidden_careerIncomeBoost_B: {
    name: 'trait_Hidden_careerIncomeBoost_B',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_2x: {
    name: 'trait_Hidden_CareerPayBoosts_2x',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_1: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_1',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_10: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_10',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_2: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_2',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_3: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_3',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_4: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_4',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_5: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_5',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_6: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_6',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_7: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_7',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_8: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_8',
    ignored: true,
  },
  trait_Hidden_CareerPayBoosts_Law_Clients_9: {
    name: 'trait_Hidden_CareerPayBoosts_Law_Clients_9',
    ignored: true,
  },
  trait_Hidden_Challenge_Positivity_Collected_Reward_1: {
    name: 'trait_Hidden_Challenge_Positivity_Collected_Reward_1',
    ignored: true,
  },
  trait_Hidden_Challenge_Positivity_Collected_Reward_2: {
    name: 'trait_Hidden_Challenge_Positivity_Collected_Reward_2',
    ignored: true,
  },
  trait_Hidden_Challenge_Positivity_Collected_Reward_3: {
    name: 'trait_Hidden_Challenge_Positivity_Collected_Reward_3',
    ignored: true,
  },
  trait_Hidden_Challenge_Positivity_Collected_Reward_4: {
    name: 'trait_Hidden_Challenge_Positivity_Collected_Reward_4',
    ignored: true,
  },
  trait_Hidden_Child_RomanticSage: {
    name: 'trait_Hidden_Child_RomanticSage',
    ignored: true,
  },
  trait_Hidden_ChildCannotAgeUp_DoesNotPersist: {
    name: 'trait_Hidden_ChildCannotAgeUp_DoesNotPersist',
    ignored: true,
  },
  trait_Hidden_ChildoftheOcean_DisgustedByFish: {
    name: 'trait_Hidden_ChildoftheOcean_DisgustedByFish',
    description: 'is disgusted by fish',
  },
  trait_Hidden_ClimateChangeWoke: {
    name: 'trait_Hidden_ClimateChangeWoke',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_AgathaCrumplebottom: {
    name: 'trait_Hidden_CottageWorld_NPC_AgathaCrumplebottom',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_AgnesCrumplebottom: {
    name: 'trait_Hidden_CottageWorld_NPC_AgnesCrumplebottom',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_CritterTender: {
    name: 'trait_Hidden_CottageWorld_NPC_CritterTender',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_GroceryDelivery: {
    name: 'trait_Hidden_CottageWorld_NPC_GroceryDelivery',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_GroceryOwner: {
    name: 'trait_Hidden_CottageWorld_NPC_GroceryOwner',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_Mayor: {
    name: 'trait_Hidden_CottageWorld_NPC_Mayor',
    ignored: true,
  },
  trait_Hidden_CottageWorld_NPC_PubOwner: {
    name: 'trait_Hidden_CottageWorld_NPC_PubOwner',
    ignored: true,
  },
  trait_Hidden_DisgustedByFoodAnimation: {
    name: 'trait_Hidden_DisgustedByFoodAnimation',
    description: 'is disgusted by food',
  },
  trait_Hidden_DramaClub: {
    name: 'trait_Hidden_DramaClub',
    ignored: true,
  },
  trait_Hidden_DramaClub_CryOnDemand: {
    name: 'trait_Hidden_DramaClub_CryOnDemand',
    ignored: true,
  },
  'trait_Hidden_E-Sports': {
    name: 'trait_Hidden_E-Sports',
    ignored: true,
  },
  'trait_Hidden_E-Sports_Offered': {
    name: 'trait_Hidden_E-Sports_Offered',
    ignored: true,
  },
  'trait_Hidden_E-Sports_OneMatchWon': {
    name: 'trait_Hidden_E-Sports_OneMatchWon',
    ignored: true,
  },
  'trait_Hidden_E-Sports_TwoMachWon': {
    name: 'trait_Hidden_E-Sports_TwoMachWon',
    ignored: true,
  },
  trait_Hidden_EarBuds_MusicLover_HasBeen_Given: {
    name: 'trait_Hidden_EarBuds_MusicLover_HasBeen_Given',
    ignored: true,
  },
  trait_Hidden_Education_Teach_10: {
    name: 'trait_Hidden_Education_Teach_10',
    ignored: true,
  },
  trait_Hidden_Education_Teach_7: {
    name: 'trait_Hidden_Education_Teach_7',
    ignored: true,
  },
  trait_Hidden_Education_Teach_8: {
    name: 'trait_Hidden_Education_Teach_8',
    ignored: true,
  },
  trait_Hidden_Education_Teach_9: {
    name: 'trait_Hidden_Education_Teach_9',
    ignored: true,
  },
  trait_Hidden_Employee_Quit: {
    name: 'trait_Hidden_Employee_Quit',
    ignored: true,
  },
  trait_Hidden_EP14_World_NPC_HorseTrainer_goodbye: {
    name: 'trait_Hidden_EP14_World_NPC_HorseTrainer_goodbye',
    ignored: true,
  },
  trait_Hidden_EP14_World_NPC_HorseTrainer_hello: {
    name: 'trait_Hidden_EP14_World_NPC_HorseTrainer_hello',
    ignored: true,
  },
  trait_Hidden_EP14World_HasWonHorseCompetition: {
    name: 'trait_Hidden_EP14World_HasWonHorseCompetition',
    ignored: true,
  },
  trait_Hidden_EP14World_NPC_HasAskedAbout_LifeNectar: {
    name: 'trait_Hidden_EP14World_NPC_HasAskedAbout_LifeNectar',
    ignored: true,
  },
  trait_Hidden_EP14World_NPC_HorseTrainer: {
    name: 'trait_Hidden_EP14World_NPC_HorseTrainer',
    description: 'is a horse trainer',
  },
  trait_Hidden_EP14World_NPC_MysteriousRancher: {
    name: 'trait_Hidden_EP14World_NPC_MysteriousRancher',
    description: 'is a mysterious rancher',
  },
  trait_Hidden_EP14WorldLocal: {
    name: 'trait_Hidden_EP14WorldLocal',
    ignored: true,
  },
  trait_Hidden_EP15_Local: {
    name: 'trait_Hidden_EP15_Local',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_AlonSadya: {
    name: 'trait_Hidden_EP15_NPC_AlonSadya',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_ArturoLinh: {
    name: 'trait_Hidden_EP15_NPC_ArturoLinh',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_BuaBunMa: {
    name: 'trait_Hidden_EP15_NPC_BuaBunMa',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_ChanhLinh: {
    name: 'trait_Hidden_EP15_NPC_ChanhLinh',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_KasemBunMa: {
    name: 'trait_Hidden_EP15_NPC_KasemBunMa',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_LienSadya: {
    name: 'trait_Hidden_EP15_NPC_LienSadya',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_NinBunMa: {
    name: 'trait_Hidden_EP15_NPC_NinBunMa',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_ThiLinh: {
    name: 'trait_Hidden_EP15_NPC_ThiLinh',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_VaneshaCahyaputri: {
    name: 'trait_Hidden_EP15_NPC_VaneshaCahyaputri',
    ignored: true,
  },
  trait_Hidden_EP15_NPC_ZhafiraCahyaputri: {
    name: 'trait_Hidden_EP15_NPC_ZhafiraCahyaputri',
    ignored: true,
  },
  trait_Hidden_EP16World_WallOfLove_WroteOnWall: {
    name: 'trait_Hidden_EP16World_WallOfLove_WroteOnWall',
    ignored: true,
  },
  trait_Hidden_EP17World_02_Freddy_ObjectiveTracker: {
    name: 'trait_Hidden_EP17World_02_Freddy_ObjectiveTracker',
    ignored: true,
  },
  trait_Hidden_EP17World_04_Edith_ObjectiveTracker: {
    name: 'trait_Hidden_EP17World_04_Edith_ObjectiveTracker',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_AliceBasu: {
    name: 'trait_Hidden_EP17World_NPC_AliceBasu',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_EdithBasu: {
    name: 'trait_Hidden_EP17World_NPC_EdithBasu',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_EkadeAether: {
    name: 'trait_Hidden_EP17World_NPC_EkadeAether',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_EstherGomes: {
    name: 'trait_Hidden_EP17World_NPC_EstherGomes',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_isEP17NPC: {
    name: 'trait_Hidden_EP17World_NPC_isEP17NPC',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_KaiAether: {
    name: 'trait_Hidden_EP17World_NPC_KaiAether',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneCoffin: {
    name: 'trait_Hidden_EP17World_NPC_LayneCoffin',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneTraits_KnowsAboutOlive: {
    name: 'trait_Hidden_EP17World_NPC_LayneTraits_KnowsAboutOlive',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneTraits_LayneCall: {
    name: 'trait_Hidden_EP17World_NPC_LayneTraits_LayneCall',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneTraits_LayneEvil: {
    name: 'trait_Hidden_EP17World_NPC_LayneTraits_LayneEvil',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneTraits_LayneReady: {
    name: 'trait_Hidden_EP17World_NPC_LayneTraits_LayneReady',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_LayneTraits_NoOlive: {
    name: 'trait_Hidden_EP17World_NPC_LayneTraits_NoOlive',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_NyonSpecter: {
    name: 'trait_Hidden_EP17World_NPC_NyonSpecter',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_OliveSpecter: {
    name: 'trait_Hidden_EP17World_NPC_OliveSpecter',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_RadwanGomes: {
    name: 'trait_Hidden_EP17World_NPC_RadwanGomes',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_RavendancerGoth: {
    name: 'trait_Hidden_EP17World_NPC_RavendancerGoth',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_TakamaAether: {
    name: 'trait_Hidden_EP17World_NPC_TakamaAether',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_TziporahGomes: {
    name: 'trait_Hidden_EP17World_NPC_TziporahGomes',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_WaylonWarez: {
    name: 'trait_Hidden_EP17World_NPC_WaylonWarez',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_WelcomeWagon_WelcomingNeighbor: {
    name: 'trait_Hidden_EP17World_NPC_WelcomeWagon_WelcomingNeighbor',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_ZelmiraGomes: {
    name: 'trait_Hidden_EP17World_NPC_ZelmiraGomes',
    ignored: true,
  },
  trait_Hidden_EP17World_NPC_ZuleikaIzadi: {
    name: 'trait_Hidden_EP17World_NPC_ZuleikaIzadi',
    ignored: true,
  },
  trait_Hidden_Event_FallChallenge_DoTD_RecievedSkullDisplay: {
    name: 'trait_Hidden_Event_FallChallenge_DoTD_RecievedSkullDisplay',
    ignored: true,
  },
  trait_Hidden_EvictionSystem_UsedFreeChance: {
    name: 'trait_Hidden_EvictionSystem_UsedFreeChance',
    ignored: true,
  },
  trait_Hidden_Fame_CelebrityTileAchieved: {
    name: 'trait_Hidden_Fame_CelebrityTileAchieved',
    ignored: true,
  },
  trait_Hidden_Fame_Quirk_StarTreatment: {
    name: 'trait_Hidden_Fame_Quirk_StarTreatment',
    ignored: true,
  },
  trait_Hidden_FashionMarketplace_SoldHypeOutfit: {
    name: 'trait_Hidden_FashionMarketplace_SoldHypeOutfit',
    ignored: true,
  },
  trait_Hidden_FashionMarketplace_WearingOutfit: {
    name: 'trait_Hidden_FashionMarketplace_WearingOutfit',
    ignored: true,
  },
  trait_Hidden_FavoriteMovie_Action: {
    name: 'trait_Hidden_FavoriteMovie_Action',
    description: 'favorite movie genre is action',
  },
  trait_Hidden_FavoriteMovie_Comedy: {
    name: 'trait_Hidden_FavoriteMovie_Comedy',
    description: 'favorite movie genre is comedy',
  },
  trait_Hidden_FavoriteMovie_Family: {
    name: 'trait_Hidden_FavoriteMovie_Family',
    description: 'favorite movie genre is family',
  },
  trait_Hidden_FavoriteMovie_Horror: {
    name: 'trait_Hidden_FavoriteMovie_Horror',
    description: 'favorite movie genre is horror',
  },
  trait_Hidden_FavoriteMovie_Romance: {
    name: 'trait_Hidden_FavoriteMovie_Romance',
    description: 'favorite movie genre is romance',
  },
  trait_Hidden_FirstSnow: {
    name: 'trait_Hidden_FirstSnow',
    description: 'this is the first time they have experienced snow',
  },
  trait_Hidden_FoodFestival_CurryContest_Winner: {
    name: 'trait_Hidden_FoodFestival_CurryContest_Winner',
    ignored: true,
  },
  trait_Hidden_FriendshipBracelet_1: {
    name: 'trait_Hidden_FriendshipBracelet_1',
    description: 'is wearing a friendship bracelet',
  },
  trait_Hidden_FriendshipBracelet_2: {
    name: 'trait_Hidden_FriendshipBracelet_2',
    description: 'is wearing a friendship bracelet',
  },
  trait_Hidden_FriendshipBracelet_3: {
    name: 'trait_Hidden_FriendshipBracelet_3',
    description: 'is wearing a friendship bracelet',
  },
  trait_Hidden_FriendshipBracelet_4: {
    name: 'trait_Hidden_FriendshipBracelet_4',
    description: 'is wearing a friendship bracelet',
  },
  trait_Hidden_FriendshipBracelet_5: {
    name: 'trait_Hidden_FriendshipBracelet_5',
    description: 'is wearing a friendship bracelet',
  },
  trait_Hidden_FriendshipBracelet_NeedsCleanup: {
    name: 'trait_Hidden_FriendshipBracelet_NeedsCleanup',
    ignored: true,
  },
  trait_Hidden_GhostPower_CAS_EvilTattoo: {
    name: 'trait_Hidden_GhostPower_CAS_EvilTattoo',
    ignored: true,
    description: 'has a mark of evil tattoo',
  },
  trait_Hidden_GhostPower_CAS_GoodTattoo: {
    name: 'trait_Hidden_GhostPower_CAS_GoodTattoo',
    description: 'has a mark of good tattoo',
  },
  trait_Hidden_GhostPowers_BurntOut: {
    name: 'trait_Hidden_GhostPowers_BurntOut',
    ignored: true,
  },
  trait_Hidden_GhostPowers_GhostNap: {
    name: 'trait_Hidden_GhostPowers_GhostNap',
    ignored: true,
  },
  trait_Hidden_GhostPowers_MermaidAndSuppressNeeds2: {
    name: 'trait_Hidden_GhostPowers_MermaidAndSuppressNeeds2',
    ignored: true,
  },
  trait_Hidden_GhostPowers_ObjectManipulation_SinisterPossess: {
    name: 'trait_Hidden_GhostPowers_ObjectManipulation_SinisterPossess',
    ignored: true,
  },
  trait_Hidden_GhostPowers_SuppressNeeds_lvl1: {
    name: 'trait_Hidden_GhostPowers_SuppressNeeds_lvl1',
    ignored: true,
  },
  trait_Hidden_GhostPowers_SuppressNeeds_lvl2: {
    name: 'trait_Hidden_GhostPowers_SuppressNeeds_lvl2',
    ignored: true,
  },
  trait_Hidden_GhostUpdates_PositiveReflection: {
    name: 'trait_Hidden_GhostUpdates_PositiveReflection',
    ignored: true,
  },
  trait_Hidden_HadFight: {
    name: 'trait_Hidden_HadFight',
    ignored: true,
    description: 'just had a fight',
  },
  trait_Hidden_HadWooHoo: {
    name: 'trait_Hidden_HadWooHoo',
    description: 'just had sex',
  },
  trait_Hidden_Has_Researched_Rodent_Disease: {
    name: 'trait_Hidden_Has_Researched_Rodent_Disease',
    ignored: true,
  },
  trait_Hidden_HasBeenScientist: {
    name: 'trait_Hidden_HasBeenScientist',
    description: 'has been a scientist',
  },
  trait_Hidden_HasMonsterFriend: {
    name: 'trait_Hidden_HasMonsterFriend',
    description: 'has a monster friend',
  },
  trait_Hidden_HasTastedExperimentalFood: {
    name: 'trait_Hidden_HasTastedExperimentalFood',
    ignored: true,
  },
  trait_Hidden_HasUltimateSnowpal: {
    name: 'trait_Hidden_HasUltimateSnowpal',
    ignored: true,
  },
  trait_Hidden_Hates_Fruitcake: {
    name: 'trait_Hidden_Hates_Fruitcake',
    description: 'hates fruitcake',
  },
  trait_Hidden_Hates_FruitCake_Controller: {
    name: 'trait_Hidden_Hates_FruitCake_Controller',
    ignored: true,
  },
  trait_Hidden_Hates_Mayo: {
    name: 'trait_Hidden_Hates_Mayo',
    description: 'hates mayo',
  },
  trait_Hidden_HighSchool_NPC_AshHarjo: {
    name: 'trait_Hidden_HighSchool_NPC_AshHarjo',
    ignored: true,
  },
  trait_Hidden_HighSchool_NPC_CafWorker: {
    name: 'trait_Hidden_HighSchool_NPC_CafWorker',
    ignored: true,
  },
  trait_Hidden_HighSchool_NPC_Janitor: {
    name: 'trait_Hidden_HighSchool_NPC_Janitor',
    description: 'is a janitor',
  },
  trait_Hidden_HighSchool_NPC_Principle: {
    name: 'trait_Hidden_HighSchool_NPC_Principle',
    description: 'is the principle',
  },
  trait_Hidden_HighSchool_NPC_Teacher1: {
    name: 'trait_Hidden_HighSchool_NPC_Teacher1',
    description: 'is a teacher',
  },
  trait_Hidden_HighSchool_NPC_Teacher2: {
    name: 'trait_Hidden_HighSchool_NPC_Teacher2',
    description: 'is a teacher',
  },
  trait_Hidden_HighSchool_NPC_ThriftStoreOwner: {
    name: 'trait_Hidden_HighSchool_NPC_ThriftStoreOwner',
    description: 'is a thrift store owner',
  },
  trait_Hidden_HorseCompetition_BarrelRacing_Beginner_Complete: {
    name: 'trait_Hidden_HorseCompetition_BarrelRacing_Beginner_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_BarrelRacing_Expert_Complete: {
    name: 'trait_Hidden_HorseCompetition_BarrelRacing_Expert_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_BarrelRacing_Intermediate_Complete: {
    name: 'trait_Hidden_HorseCompetition_BarrelRacing_Intermediate_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_BarrelRacing_Master_Complete: {
    name: 'trait_Hidden_HorseCompetition_BarrelRacing_Master_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_EnduraceRacing_Beginner_Complete: {
    name: 'trait_Hidden_HorseCompetition_EnduraceRacing_Beginner_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_EnduraceRacing_Expert_Complete: {
    name: 'trait_Hidden_HorseCompetition_EnduraceRacing_Expert_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_EnduraceRacing_Intermediate_Complete: {
    name: 'trait_Hidden_HorseCompetition_EnduraceRacing_Intermediate_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_EnduraceRacing_Master_Complete: {
    name: 'trait_Hidden_HorseCompetition_EnduraceRacing_Master_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_ShowJumping_Beginner_Complete: {
    name: 'trait_Hidden_HorseCompetition_ShowJumping_Beginner_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_ShowJumping_Expert_Complete: {
    name: 'trait_Hidden_HorseCompetition_ShowJumping_Expert_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_ShowJumping_Intermediate_Complete: {
    name: 'trait_Hidden_HorseCompetition_ShowJumping_Intermediate_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_ShowJumping_Master_Complete: {
    name: 'trait_Hidden_HorseCompetition_ShowJumping_Master_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_WesternPleasure_Beginner_Complete: {
    name: 'trait_Hidden_HorseCompetition_WesternPleasure_Beginner_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_WesternPleasure_Expert_Complete: {
    name: 'trait_Hidden_HorseCompetition_WesternPleasure_Expert_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_WesternPleasure_Intermediate_Complete: {
    name: 'trait_Hidden_HorseCompetition_WesternPleasure_Intermediate_Complete',
    ignored: true,
  },
  trait_Hidden_HorseCompetition_WesternPleasure_Master_Complete: {
    name: 'trait_Hidden_HorseCompetition_WesternPleasure_Master_Complete',
    ignored: true,
  },
  trait_Hidden_Infant_Element_FrequentlyHiccups: {
    name: 'trait_Hidden_Infant_Element_FrequentlyHiccups',
    ignored: true,
  },
  trait_Hidden_Infant_Element_FrequentlySneezes: {
    name: 'trait_Hidden_Infant_Element_FrequentlySneezes',
    ignored: true,
  },
  trait_Hidden_Infant_Element_Gassy: {
    name: 'trait_Hidden_Infant_Element_Gassy',
    ignored: true,
  },
  trait_Hidden_Infant_Element_GoodAppetite: {
    name: 'trait_Hidden_Infant_Element_GoodAppetite',
    ignored: true,
  },
  trait_Hidden_Infant_Element_HappySpitter: {
    name: 'trait_Hidden_Infant_Element_HappySpitter',
    ignored: true,
  },
  trait_Hidden_Infant_Element_HatesBeingHeld: {
    name: 'trait_Hidden_Infant_Element_HatesBeingHeld',
    ignored: true,
  },
  trait_Hidden_Infant_Element_HatesWakingUp: {
    name: 'trait_Hidden_Infant_Element_HatesWakingUp',
    ignored: true,
  },
  trait_Hidden_Infant_Element_LovesBeingHeld: {
    name: 'trait_Hidden_Infant_Element_LovesBeingHeld',
    ignored: true,
  },
  trait_Hidden_Infant_Element_LovesWakingUp: {
    name: 'trait_Hidden_Infant_Element_LovesWakingUp',
    ignored: true,
  },
  trait_Hidden_Infant_Element_MessyEater: {
    name: 'trait_Hidden_Infant_Element_MessyEater',
    ignored: true,
  },
  trait_Hidden_Infant_Element_ObsessedWithSound: {
    name: 'trait_Hidden_Infant_Element_ObsessedWithSound',
    ignored: true,
  },
  trait_Hidden_Infant_Element_OnlySleepsWhenHeld: {
    name: 'trait_Hidden_Infant_Element_OnlySleepsWhenHeld',
    ignored: true,
  },
  trait_Hidden_Infant_Element_PeesDuringChanges: {
    name: 'trait_Hidden_Infant_Element_PeesDuringChanges',
    ignored: true,
  },
  trait_Hidden_Infant_Element_PeesDuringFeeding: {
    name: 'trait_Hidden_Infant_Element_PeesDuringFeeding',
    ignored: true,
  },
  trait_Hidden_Infant_Element_PickyEater: {
    name: 'trait_Hidden_Infant_Element_PickyEater',
    ignored: true,
  },
  trait_Hidden_Infant_Element_RisesWithTheSun: {
    name: 'trait_Hidden_Infant_Element_RisesWithTheSun',
    ignored: true,
  },
  trait_Hidden_Infant_Element_SelfSoother: {
    name: 'trait_Hidden_Infant_Element_SelfSoother',
    ignored: true,
  },
  trait_Hidden_Infant_Element_Talker: {
    name: 'trait_Hidden_Infant_Element_Talker',
    ignored: true,
  },
  trait_Hidden_InfantMilestone_CanCrawl: {
    name: 'trait_Hidden_InfantMilestone_CanCrawl',
    ignored: true,
  },
  trait_Hidden_InfantMilestone_SitUp: {
    name: 'trait_Hidden_InfantMilestone_SitUp',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_Core: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_Core',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstBath: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstBath',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstBlowout: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstBlowout',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstBubbleBath: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstBubbleBath',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstFood: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstFood',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstTripToPark: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstTripToPark',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstVacation: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstVacation',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstVisitors: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstVisitors',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_FirstVisitToFamily: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_FirstVisitToFamily',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_BGUnlock_PeesOnParent: {
    name: 'trait_Hidden_InfantMilestones_BGUnlock_PeesOnParent',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_Clap: {
    name: 'trait_Hidden_InfantMilestones_Clap',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_Coo: {
    name: 'trait_Hidden_InfantMilestones_Coo',
    ignored: true,
  },
  Trait_Hidden_InfantMilestones_Immobile: {
    name: 'Trait_Hidden_InfantMilestones_Immobile',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_Laugh: {
    name: 'trait_Hidden_InfantMilestones_Laugh',
    ignored: true,
  },
  trait_Hidden_InfantMilestones_SleptThroughNight: {
    name: 'trait_Hidden_InfantMilestones_SleptThroughNight',
    ignored: true,
  },
  trait_Hidden_isAdoptionOfficer: {
    name: 'trait_Hidden_isAdoptionOfficer',
    ignored: true,
  },
  trait_Hidden_isDisguised: {
    name: 'trait_Hidden_isDisguised',
    description:
      "is wearing a disguise so that people don't notice they are a celebrity",
  },
  trait_Hidden_IsEventNPC_Challenge: {
    name: 'trait_Hidden_IsEventNPC_Challenge',
    ignored: true,
  },
  trait_Hidden_IsEventNPC_Challenge_MBB: {
    name: 'trait_Hidden_IsEventNPC_Challenge_MBB',
    ignored: true,
  },
  trait_Hidden_isFirefighter: {
    name: 'trait_Hidden_isFirefighter',
    description: 'is a firefighter',
  },
  trait_Hidden_IslandAncestor_Elemental: {
    name: 'trait_Hidden_IslandAncestor_Elemental',
    ignored: false,
    description: 'is imbued with elemental energy due to their heritage',
  },
  trait_Hidden_IsNative: {
    name: 'trait_Hidden_IsNative',
    ignored: true,
    description: 'is native',
  },
  trait_Hidden_isNativeStray: {
    name: 'trait_Hidden_isNativeStray',
    description: 'is a native stray',
  },
  trait_Hidden_isNotDisguised: {
    name: 'trait_Hidden_isNotDisguised',
    ignored: true,
  },
  Trait_Hidden_JoinedFiftyMileHighClub: {
    name: 'Trait_Hidden_JoinedFiftyMileHighClub',
    description: 'has joined the 50 mile high club',
  },
  Trait_Hidden_JoinedFiftyMileHighClub_Teen: {
    name: 'Trait_Hidden_JoinedFiftyMileHighClub_Teen',
    description: 'has joined the 50 mile high club',
  },
  trait_Hidden_Jungle_WelcomePackage_Received: {
    name: 'trait_Hidden_Jungle_WelcomePackage_Received',
    ignored: true,
  },
  trait_Hidden_KeepsakeBox_Designated: {
    name: 'trait_Hidden_KeepsakeBox_Designated',
    ignored: true,
  },
  trait_Hidden_KidsBike_CanRide: {
    name: 'trait_Hidden_KidsBike_CanRide',
    description: 'can ride a bike',
  },
  trait_Hidden_KidsBike_CantRide: {
    name: 'trait_Hidden_KidsBike_CantRide',
    description: "can't ride a bike",
  },
  trait_Hidden_Knitting_GiftedGrim: {
    name: 'trait_Hidden_Knitting_GiftedGrim',
    ignored: true,
  },
  trait_Hidden_Landlord: {
    name: 'trait_Hidden_Landlord',
    description: 'is a landlord',
  },
  trait_Hidden_LighthouseConception: {
    name: 'trait_Hidden_LighthouseConception',
    ignored: true,
  },
  trait_Hidden_Likes_Fruitcake: {
    name: 'trait_Hidden_Likes_Fruitcake',
    description: 'likes fruitcake',
  },
  trait_Hidden_Likes_Mayo: {
    name: 'trait_Hidden_Likes_Mayo',
    description: 'likes mayo',
  },
  trait_Hidden_LotTrait_SimpleLiving_Cookbook: {
    name: 'trait_Hidden_LotTrait_SimpleLiving_Cookbook',
    ignored: true,
  },
  trait_Hidden_MakePregnant: {
    name: 'trait_Hidden_MakePregnant',
    ignored: true,
  },
  trait_Hidden_Matchmaking_Disabled: {
    name: 'trait_Hidden_Matchmaking_Disabled',
    ignored: true,
  },
  trait_Hidden_MediumSwimming: {
    name: 'trait_Hidden_MediumSwimming',
    ignored: true,
  },
  trait_Hidden_MidlifeCrisis_HadACrisis: {
    name: 'trait_Hidden_MidlifeCrisis_HadACrisis',
    ignored: true,
  },
  trait_Hidden_Mortician_Ghouls: {
    name: 'trait_Hidden_Mortician_Ghouls',
    ignored: true,
  },
  trait_Hidden_Mortician_Grave: {
    name: 'trait_Hidden_Mortician_Grave',
    ignored: true,
  },
  trait_Hidden_Mortician_Grave2: {
    name: 'trait_Hidden_Mortician_Grave2',
    ignored: true,
  },
  trait_Hidden_muEvent_TenantRevolt_GenericCause: {
    name: 'trait_Hidden_muEvent_TenantRevolt_GenericCause',
    ignored: true,
  },
  trait_Hidden_NPC_isDJ: {
    name: 'trait_Hidden_NPC_isDJ',
    description: 'is a DJ',
  },
  trait_Hidden_NPC_TenantApplicant: {
    name: 'trait_Hidden_NPC_TenantApplicant',
    ignored: true,
  },
  trait_Hidden_OnTrashUpdateLot: {
    name: 'trait_Hidden_OnTrashUpdateLot',
    ignored: true,
  },
  trait_Hidden_PaintingMaster: {
    name: 'trait_Hidden_PaintingMaster',
    ignored: true,
  },
  trait_Hidden_ParanormalInvestigator_AskedGrim: {
    name: 'trait_Hidden_ParanormalInvestigator_AskedGrim',
    ignored: true,
  },
  trait_Hidden_ParanormalInvestigator_Medium: {
    name: 'trait_Hidden_ParanormalInvestigator_Medium',
    ignored: true,
  },
  trait_Hidden_Pet_Minor_Cage_RodentDisease_Immune: {
    name: 'trait_Hidden_Pet_Minor_Cage_RodentDisease_Immune',
    ignored: true,
  },
  trait_Hidden_Pet_Minor_Cage_RodentDisease_Removed_Costume: {
    name: 'trait_Hidden_Pet_Minor_Cage_RodentDisease_Removed_Costume',
    ignored: true,
  },
  Trait_Hidden_ProfessorNPC_Course_Arts_A: {
    name: 'Trait_Hidden_ProfessorNPC_Course_Arts_A',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Arts_B: {
    name: 'trait_Hidden_ProfessorNPC_Course_Arts_B',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Arts_C: {
    name: 'trait_Hidden_ProfessorNPC_Course_Arts_C',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Arts_D: {
    name: 'trait_Hidden_ProfessorNPC_Course_Arts_D',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Science_A: {
    name: 'trait_Hidden_ProfessorNPC_Course_Science_A',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Science_B: {
    name: 'trait_Hidden_ProfessorNPC_Course_Science_B',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Science_C: {
    name: 'trait_Hidden_ProfessorNPC_Course_Science_C',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_Course_Science_D: {
    name: 'trait_Hidden_ProfessorNPC_Course_Science_D',
    ignored: true,
  },
  trait_Hidden_ProfessorNPC_isArtsProfessorNPC: {
    name: 'trait_Hidden_ProfessorNPC_isArtsProfessorNPC',
    description: 'is arts professor',
  },
  trait_Hidden_ProfessorNPC_isScienceProfessorNPC: {
    name: 'trait_Hidden_ProfessorNPC_isScienceProfessorNPC',
    description: 'is science professor',
  },
  trait_Hidden_PubertyChanges_ExperiencedFirstTime: {
    name: 'trait_Hidden_PubertyChanges_ExperiencedFirstTime',
    ignored: true,
  },
  trait_Hidden_R3Event_ThrillSeeker: {
    name: 'trait_Hidden_R3Event_ThrillSeeker',
    ignored: true,
  },
  trait_Hidden_ReaperCareer_DeadSim: {
    name: 'trait_Hidden_ReaperCareer_DeadSim',
    ignored: true,
  },
  trait_Hidden_ReaperCareer_DeadSim_Find: {
    name: 'trait_Hidden_ReaperCareer_DeadSim_Find',
    ignored: true,
  },
  trait_Hidden_ReceivedExperimentalFoodTNS: {
    name: 'trait_Hidden_ReceivedExperimentalFoodTNS',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Acting: {
    name: 'trait_Hidden_ResearchMachine_Acting',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Charisma: {
    name: 'trait_Hidden_ResearchMachine_Charisma',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Comedy: {
    name: 'trait_Hidden_ResearchMachine_Comedy',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Cooking: {
    name: 'trait_Hidden_ResearchMachine_Cooking',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Fitness: {
    name: 'trait_Hidden_ResearchMachine_Fitness',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Gardening: {
    name: 'trait_Hidden_ResearchMachine_Gardening',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Handiness: {
    name: 'trait_Hidden_ResearchMachine_Handiness',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Logic: {
    name: 'trait_Hidden_ResearchMachine_Logic',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Painting: {
    name: 'trait_Hidden_ResearchMachine_Painting',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Photography: {
    name: 'trait_Hidden_ResearchMachine_Photography',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Programming: {
    name: 'trait_Hidden_ResearchMachine_Programming',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Research: {
    name: 'trait_Hidden_ResearchMachine_Research',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Robotics: {
    name: 'trait_Hidden_ResearchMachine_Robotics',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_RocketScience: {
    name: 'trait_Hidden_ResearchMachine_RocketScience',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Thanatology: {
    name: 'trait_Hidden_ResearchMachine_Thanatology',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_VideoGaming: {
    name: 'trait_Hidden_ResearchMachine_VideoGaming',
    ignored: true,
  },
  trait_Hidden_ResearchMachine_Writing: {
    name: 'trait_Hidden_ResearchMachine_Writing',
    ignored: true,
  },
  trait_Hidden_RestaurantAtWork: {
    name: 'trait_Hidden_RestaurantAtWork',
    ignored: true,
  },
  trait_Hidden_RockClimbingGear_HasGear: {
    name: 'trait_Hidden_RockClimbingGear_HasGear',
    ignored: true,
  },
  trait_Hidden_RockClimbingGear_WearingGear: {
    name: 'trait_Hidden_RockClimbingGear_WearingGear',
    ignored: true,
  },
  trait_Hidden_Rocketship_HasWatchedAlien: {
    name: 'trait_Hidden_Rocketship_HasWatchedAlien',
    ignored: true,
  },
  trait_Hidden_RoleState_VetEmployee_Clean: {
    name: 'trait_Hidden_RoleState_VetEmployee_Clean',
    ignored: true,
  },
  trait_Hidden_RoleState_VetEmployee_DontClean: {
    name: 'trait_Hidden_RoleState_VetEmployee_DontClean',
    ignored: true,
  },
  trait_Hidden_RoleState_VetEmployee_DontTreat: {
    name: 'trait_Hidden_RoleState_VetEmployee_DontTreat',
    ignored: true,
  },
  trait_Hidden_RoleState_VetEmployee_Treat: {
    name: 'trait_Hidden_RoleState_VetEmployee_Treat',
    ignored: true,
  },
  trait_Hidden_Scenario_Premades_NotRival: {
    name: 'trait_Hidden_Scenario_Premades_NotRival',
    ignored: true,
  },
  trait_Hidden_Scenario_Premades_Rival: {
    name: 'trait_Hidden_Scenario_Premades_Rival',
    ignored: true,
  },
  trait_Hidden_SelfDiscoveryMax: {
    name: 'trait_Hidden_SelfDiscoveryMax',
    ignored: true,
  },
  trait_Hidden_SimPreference_ActiveDislike: {
    name: 'trait_Hidden_SimPreference_ActiveDislike',
    ignored: true,
  },
  trait_Hidden_Skeleton: {
    name: 'trait_Hidden_Skeleton',
    description: 'is a skeleton',
  },
  trait_Hidden_Skeleton_ServiceSkeleton: {
    name: 'trait_Hidden_Skeleton_ServiceSkeleton',
    ignored: true,
  },
  trait_Hidden_Skeleton_TempleSkeleton: {
    name: 'trait_Hidden_Skeleton_TempleSkeleton',
    ignored: true,
  },
  trait_Hidden_Snowboarding_Goofy: {
    name: 'trait_Hidden_Snowboarding_Goofy',
    ignored: true,
  },
  trait_Hidden_SoccerTeam_ProSports: {
    name: 'trait_Hidden_SoccerTeam_ProSports',
    ignored: true,
  },
  trait_Hidden_Social_Media_Application_Disable: {
    name: 'trait_Hidden_Social_Media_Application_Disable',
    ignored: true,
  },
  trait_Hidden_Social_Media_TNS_Disable: {
    name: 'trait_Hidden_Social_Media_TNS_Disable',
    ignored: true,
  },
  trait_Hidden_SpellcasterPremade: {
    name: 'trait_Hidden_SpellcasterPremade',
    ignored: true,
  },
  trait_Hidden_SpringChallenge_2016_Gave_Pristine_GrowFruit: {
    name: 'trait_Hidden_SpringChallenge_2016_Gave_Pristine_GrowFruit',
    ignored: true,
  },
  trait_Hidden_SpringChallenge_2016_Gave_X_GrowFruit_Completed: {
    name: 'trait_Hidden_SpringChallenge_2016_Gave_X_GrowFruit_Completed',
    ignored: true,
  },
  trait_Hidden_SpringChallenge2016_GotGrowfruitStarter: {
    name: 'trait_Hidden_SpringChallenge2016_GotGrowfruitStarter',
    ignored: true,
  },
  trait_hidden_staretNeeds_tracker: {
    name: 'trait_hidden_staretNeeds_tracker',
    ignored: true,
  },
  trait_Hidden_startingSimoleons: {
    name: 'trait_Hidden_startingSimoleons',
    ignored: true,
  },
  trait_Hidden_StickyFingers: {
    name: 'trait_Hidden_StickyFingers',
    description: 'is good at stealing',
  },
  trait_Hidden_Strangerville_HasOpenedDoor: {
    name: 'trait_Hidden_Strangerville_HasOpenedDoor',
    ignored: true,
  },
  trait_Hidden_Strangerville_VeteranHermit: {
    name: 'trait_Hidden_Strangerville_VeteranHermit',
    description: 'is a veteran hermit',
  },
  trait_Hidden_Strangetown_Agent: {
    name: 'trait_Hidden_Strangetown_Agent',
    description: 'is an agent',
  },
  trait_Hidden_Strangetown_Conspiracist: {
    name: 'trait_Hidden_Strangetown_Conspiracist',
    description: 'is a conspiracist',
  },
  trait_Hidden_Strangetown_CurioShop: {
    name: 'trait_Hidden_Strangetown_CurioShop',
    ignored: true,
  },
  trait_Hidden_Strangetown_Military: {
    name: 'trait_Hidden_Strangetown_Military',
    description: 'is military',
  },
  trait_Hidden_Strangetown_NPC_PremadeSim: {
    name: 'trait_Hidden_Strangetown_NPC_PremadeSim',
    ignored: true,
  },
  trait_Hidden_Strangetown_Scientist: {
    name: 'trait_Hidden_Strangetown_Scientist',
    description: 'is a scientist',
  },
  trait_Hidden_SummitLocal: {
    name: 'trait_Hidden_SummitLocal',
    description: 'is a summit local',
  },
  trait_Hidden_SuperFertizier_Unlock: {
    name: 'trait_Hidden_SuperFertizier_Unlock',
    ignored: true,
  },
  trait_Hidden_Tarot_Collector: {
    name: 'trait_Hidden_Tarot_Collector',
    ignored: true,
  },
  trait_Hidden_Tarot_DeckPurchase: {
    name: 'trait_Hidden_Tarot_DeckPurchase',
    ignored: true,
  },
  trait_Hidden_Tarot_Quest: {
    name: 'trait_Hidden_Tarot_Quest',
    ignored: true,
  },
  trait_Hidden_Tarot_Quest_PossiblyLost: {
    name: 'trait_Hidden_Tarot_Quest_PossiblyLost',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_LostCardsRetrieved: {
    name: 'trait_Hidden_TarotCollectible_LostCardsRetrieved',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Ekade01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Ekade01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Ekade02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Ekade02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Ekade04: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Ekade04',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Ekade05: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Ekade05',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EkadeDeadEnd01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EkadeDeadEnd01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EkadeDeadEnd02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EkadeDeadEnd02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Esther01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Esther01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Esther02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Esther02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EstherCake01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EstherCake01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EstherCake02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EstherCake02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EstherCake03: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EstherCake03',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EstherHaunt01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EstherHaunt01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_EstherHaunt02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_EstherHaunt02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Nyon01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Nyon01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Nyon02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Nyon02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Nyon03: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Nyon03',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Nyon04: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Nyon04',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_NyonGrim01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_NyonGrim01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_NyonGrim02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_NyonGrim02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Zelmira01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Zelmira01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_Zelmira02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_Zelmira02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar02',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar03: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_ZelmiraAltar03',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_ZelmiraLife01: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_ZelmiraLife01',
    ignored: true,
  },
  trait_Hidden_TarotCollectible_OnQuest_ZelmiraLife02: {
    name: 'trait_Hidden_TarotCollectible_OnQuest_ZelmiraLife02',
    ignored: true,
  },
  trait_Hidden_TarotNPC_EkadeQuests: {
    name: 'trait_Hidden_TarotNPC_EkadeQuests',
    ignored: true,
  },
  trait_Hidden_TarotNPC_EstherQuests: {
    name: 'trait_Hidden_TarotNPC_EstherQuests',
    ignored: true,
  },
  trait_Hidden_TarotNPC_NyonQuests: {
    name: 'trait_Hidden_TarotNPC_NyonQuests',
    ignored: true,
  },
  trait_Hidden_TarotNPC_ZelmiraQuests: {
    name: 'trait_Hidden_TarotNPC_ZelmiraQuests',
    ignored: true,
  },
  trait_Hidden_Temperature_Preference_Cool: {
    name: 'trait_Hidden_Temperature_Preference_Cool',
    description: 'likes cool climates and temperatures',
  },
  trait_Hidden_Temperature_Preference_Warm: {
    name: 'trait_Hidden_Temperature_Preference_Warm',
    description: 'likes warm climates and temperatures',
  },
  trait_Hidden_TemporaryStay_Guest: {
    name: 'trait_Hidden_TemporaryStay_Guest',
    description: 'is a guest',
  },
  trait_Hidden_TemporaryStay_HadInfantIntro: {
    name: 'trait_Hidden_TemporaryStay_HadInfantIntro',
    ignored: true,
  },
  trait_Hidden_TemporaryStay_RecentlyArrived: {
    name: 'trait_Hidden_TemporaryStay_RecentlyArrived',
    description: 'just arrived',
  },
  trait_Hidden_ToddlerPersonalityUpdate_Aggressive: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_Aggressive',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_AudioLover: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_AudioLover',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_BookLover: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_BookLover',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_Destructive: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_Destructive',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_EarlyRiser: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_EarlyRiser',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_GoodAppetite: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_GoodAppetite',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_HatesBedtime: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_HatesBedtime',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_HatesCarry: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_HatesCarry',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_HatesWakeup: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_HatesWakeup',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_HeavySleeper: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_HeavySleeper',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_LightSleeper: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_LightSleeper',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_LovesCarry: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_LovesCarry',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_LovesWakeup: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_LovesWakeup',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_MessyEater: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_MessyEater',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_PickyEater: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_PickyEater',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_RunsAway: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_RunsAway',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_Singer: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_Singer',
    ignored: true,
  },
  trait_Hidden_ToddlerPersonalityUpdate_WaterLover: {
    name: 'trait_Hidden_ToddlerPersonalityUpdate_WaterLover',
    ignored: true,
  },
  trait_Hidden_TopRider_HasWonUltimateChampionship: {
    name: 'trait_Hidden_TopRider_HasWonUltimateChampionship',
    ignored: true,
  },
  trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_1: {
    name: 'trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_1',
    ignored: true,
  },
  trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_2: {
    name: 'trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_2',
    ignored: true,
  },
  trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_3: {
    name: 'trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_3',
    ignored: true,
  },
  trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_4: {
    name: 'trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_4',
    ignored: true,
  },
  trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_5: {
    name: 'trait_Hidden_TreadMill_ClimbingWall_Challenge_Complete_5',
    ignored: true,
  },
  trait_Hidden_UniversityEnrollment_HasSeenEnrollmentInfo: {
    name: 'trait_Hidden_UniversityEnrollment_HasSeenEnrollmentInfo',
    ignored: true,
  },
  trait_Hidden_UniversityStudent: {
    name: 'trait_Hidden_UniversityStudent',
    description: 'is a university student',
  },
  trait_Hidden_UnlockCampingSculpture: {
    name: 'trait_Hidden_UnlockCampingSculpture',
    ignored: true,
  },
  trait_Hidden_Unlocked_PositivityChallenge_Aspiration: {
    name: 'trait_Hidden_Unlocked_PositivityChallenge_Aspiration',
    ignored: true,
  },
  trait_Hidden_UnlockedGrilledCheese_Aspiration: {
    name: 'trait_Hidden_UnlockedGrilledCheese_Aspiration',
    ignored: true,
  },
  trait_Hidden_Vampire_SpiritPowers_BatEnabled: {
    name: 'trait_Hidden_Vampire_SpiritPowers_BatEnabled',
    ignored: true,
  },
  trait_Hidden_Vampire_SpiritPowers_MistEnabled: {
    name: 'trait_Hidden_Vampire_SpiritPowers_MistEnabled',
    ignored: true,
  },
  trait_Hidden_Vampire_SpiritPowers_VampireRunEnabled: {
    name: 'trait_Hidden_Vampire_SpiritPowers_VampireRunEnabled',
    ignored: true,
  },
  trait_Hidden_VampirePowerSusceptibility: {
    name: 'trait_Hidden_VampirePowerSusceptibility',
    ignored: true,
  },
  trait_Hidden_VfxMask_Cursed: {
    name: 'trait_Hidden_VfxMask_Cursed',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_CritterTender_GotMashOnce: {
    name: 'trait_Hidden_VillagerHelp_CritterTender_GotMashOnce',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_AgathaCrumplebottom: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_AgathaCrumplebottom',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_AgathaCrumplebottom_2: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_AgathaCrumplebottom_2',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_AgnesCrumplebottom: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_AgnesCrumplebottom',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_AgnesCrumplebottom_2: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_AgnesCrumplebottom_2',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_CritterTender: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_CritterTender',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_FoodShort: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_FoodShort',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_GardenShort: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_GardenShort',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_GroceryDelivery: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_GroceryDelivery',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_GroceryOwner: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_GroceryOwner',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_LivestockLong: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_LivestockLong',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_LivestockShort: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_LivestockShort',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_Mayor: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_Mayor',
    description: 'is a mayor',
  },
  trait_Hidden_VillagerHelp_OnQuest_PubOwner: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_PubOwner',
    description: 'is a pub owner',
  },
  trait_Hidden_VillagerHelp_OnQuest_SocialMedium: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_SocialMedium',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_SocialShort: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_SocialShort',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_WildAnimalFoodLong: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_WildAnimalFoodLong',
    ignored: true,
  },
  trait_Hidden_VillagerHelp_OnQuest_WildAnimalShort: {
    name: 'trait_Hidden_VillagerHelp_OnQuest_WildAnimalShort',
    ignored: true,
  },
  trait_Hidden_Weather_Rain_Hate: {
    name: 'trait_Hidden_Weather_Rain_Hate',
    description: 'hates rainy weather',
  },
  trait_Hidden_Weather_Rain_Love: {
    name: 'trait_Hidden_Weather_Rain_Love',
    description: 'loves rainy weather',
  },
  trait_Hidden_Weather_Snow_Hate: {
    name: 'trait_Hidden_Weather_Snow_Hate',
    description: 'hates snow',
  },
  trait_Hidden_Weather_Snow_Love: {
    name: 'trait_Hidden_Weather_Snow_Love',
    description: 'loves snow',
  },
  trait_Hidden_Weather_Sun_Hate: {
    name: 'trait_Hidden_Weather_Sun_Hate',
    description: 'hates the sun',
  },
  trait_Hidden_Weather_Sun_Love: {
    name: 'trait_Hidden_Weather_Sun_Love',
    description: 'loves the sun',
  },
  trait_Hidden_Weather_Wind_Hate: {
    name: 'trait_Hidden_Weather_Wind_Hate',
    description: 'hates the wind',
  },
  trait_Hidden_Weather_Wind_Love: {
    name: 'trait_Hidden_Weather_Wind_Love',
    description: 'loves the wind',
  },
  trait_Hidden_WeddingWorld_NPC_ArnessaThebe: {
    name: 'trait_Hidden_WeddingWorld_NPC_ArnessaThebe',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_CamilleSoto: {
    name: 'trait_Hidden_WeddingWorld_NPC_CamilleSoto',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_DominiqueSoto: {
    name: 'trait_Hidden_WeddingWorld_NPC_DominiqueSoto',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_GretaLaurent: {
    name: 'trait_Hidden_WeddingWorld_NPC_GretaLaurent',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_HectorLaurent: {
    name: 'trait_Hidden_WeddingWorld_NPC_HectorLaurent',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_HilaryLaurent: {
    name: 'trait_Hidden_WeddingWorld_NPC_HilaryLaurent',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_JaceLaurent: {
    name: 'trait_Hidden_WeddingWorld_NPC_JaceLaurent',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_JaleelFaiz: {
    name: 'trait_Hidden_WeddingWorld_NPC_JaleelFaiz',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_LuciaMarkovic: {
    name: 'trait_Hidden_WeddingWorld_NPC_LuciaMarkovic',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_MateoMarkovic: {
    name: 'trait_Hidden_WeddingWorld_NPC_MateoMarkovic',
    ignored: true,
  },
  trait_Hidden_WeddingWorld_NPC_TomiMarkovic: {
    name: 'trait_Hidden_WeddingWorld_NPC_TomiMarkovic',
    ignored: true,
  },
  trait_Hidden_Witch_Teleport: {
    name: 'trait_Hidden_Witch_Teleport',
    ignored: true,
  },
  trait_Hidden_WolfTown_Adventure_KnowsSculptureSecret: {
    name: 'trait_Hidden_WolfTown_Adventure_KnowsSculptureSecret',
    ignored: true,
  },
  trait_Hidden_WolfTown_PortalUnlock_MinePorta: {
    name: 'trait_Hidden_WolfTown_PortalUnlock_MinePorta',
    ignored: true,
  },
  trait_Hidden_WolfTown_PortalUnlock_PortaSewer: {
    name: 'trait_Hidden_WolfTown_PortalUnlock_PortaSewer',
    ignored: true,
  },
  trait_Hidden_WolfTown_PortalUnlock_SewerMine: {
    name: 'trait_Hidden_WolfTown_PortalUnlock_SewerMine',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_CeleneLopez: {
    name: 'trait_Hidden_WolfTown_Premade_CeleneLopez',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_JacobVolkov: {
    name: 'trait_Hidden_WolfTown_Premade_JacobVolkov',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_KristopherVolkov: {
    name: 'trait_Hidden_WolfTown_Premade_KristopherVolkov',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_LilyZhu: {
    name: 'trait_Hidden_WolfTown_Premade_LilyZhu',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_LouHowell: {
    name: 'trait_Hidden_WolfTown_Premade_LouHowell',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_RoryOaklow: {
    name: 'trait_Hidden_WolfTown_Premade_RoryOaklow',
    ignored: true,
  },
  trait_Hidden_WolfTown_Premade_WolfgangWilder: {
    name: 'trait_Hidden_WolfTown_Premade_WolfgangWilder',
    ignored: true,
  },
  trait_High_Metabolism: {
    name: 'trait_High_Metabolism',
    description: 'has a high metabolism',
  },
  trait_Highflier: {
    name: 'trait_Highflier',
    description: 'is a highflier',
  },
  trait_HighFlyer: {
    name: 'trait_HighFlyer',
    ignored: false,
    description: 'is a highflier',
  },
  trait_HighMaintenance: {
    name: 'trait_HighMaintenance',
    description: 'is high maintenance',
  },
  trait_HighSchool_A: {
    name: 'trait_HighSchool_A',
    ignored: true,
  },
  trait_HighSchool_Active_Class1Student: {
    name: 'trait_HighSchool_Active_Class1Student',
    ignored: true,
  },
  trait_HighSchool_Active_HadOrientation: {
    name: 'trait_HighSchool_Active_HadOrientation',
    ignored: true,
  },
  trait_HighSchool_Active_LearnedTPoseChallenge: {
    name: 'trait_HighSchool_Active_LearnedTPoseChallenge',
    ignored: true,
  },
  trait_HighSchool_B: {
    name: 'trait_HighSchool_B',
    ignored: true,
  },
  trait_HighSchool_C: {
    name: 'trait_HighSchool_C',
    ignored: true,
  },
  trait_HighSchool_D: {
    name: 'trait_HighSchool_D',
    ignored: true,
  },
  trait_HighSchool_F: {
    name: 'trait_HighSchool_F',
    ignored: true,
  },
  trait_Hilarious: {
    name: 'trait_Hilarious',
    ignored: false,
    description: 'is hilarious',
  },
  trait_HolidayTradition_FatherWinter: {
    name: 'trait_HolidayTradition_FatherWinter',
    ignored: true,
  },
  trait_HolidayTradition_FatherWinterBaby: {
    name: 'trait_HolidayTradition_FatherWinterBaby',
    ignored: true,
  },
  trait_HomeTurf: {
    name: 'trait_HomeTurf',
    ignored: false,
    description: 'feels connected and content when in their home neighborhood',
  },
  trait_Horse_Age_Adult: {
    name: 'trait_Horse_Age_Adult',
    description: 'is an adult horse',
  },
  trait_Horse_Age_Child: {
    name: 'trait_Horse_Age_Child',
    description: 'is a child horse',
  },
  trait_Horse_Age_Elder: {
    name: 'trait_Horse_Age_Elder',
    description: 'is an elder horse',
  },
  trait_Horse_Gameplay_Curious: {
    name: 'trait_Horse_Gameplay_Curious',
    ignored: false,
    description: 'is curious',
  },
  trait_Horse_Gameplay_EquestrianCenter_ChampionHorse: {
    name: 'trait_Horse_Gameplay_EquestrianCenter_ChampionHorse',
    description: 'is a champion horse',
  },
  trait_Horse_Gameplay_HorseBreeding_ChampionGenes: {
    name: 'trait_Horse_Gameplay_HorseBreeding_ChampionGenes',
    description: 'has champion horse genes',
  },
  trait_Horse_Gameplay_Mounted_Buffs_Reins_Modifier: {
    name: 'trait_Horse_Gameplay_Mounted_Buffs_Reins_Modifier',
    ignored: true,
  },
  trait_Horse_Gameplay_Playful: {
    name: 'trait_Horse_Gameplay_Playful',
    ignored: false,
    description: 'is playful',
  },
  trait_Horse_Gameplay_Resilient: {
    name: 'trait_Horse_Gameplay_Resilient',
    ignored: false,
    description: 'is resilient',
  },
  trait_Horse_Gameplay_RewardTrait_TopNotchFoal: {
    name: 'trait_Horse_Gameplay_RewardTrait_TopNotchFoal',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Beginner_1st: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Beginner_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Beginner_2nd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Beginner_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Beginner_3rd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Beginner_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Expert_1st: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Expert_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Expert_2nd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Expert_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Expert_3rd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Expert_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Intermediate_1st: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Intermediate_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Intermediate_2nd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Intermediate_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Intermediate_3rd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Intermediate_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Master_1st: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Master_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Master_2nd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Master_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_BarrelRacing_Master_3rd: {
    name: 'trait_Horse_HorseCompetition_BarrelRacing_Master_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Beginner_1st: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Beginner_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Beginner_2nd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Beginner_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Beginner_3rd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Beginner_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Expert_1st: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Expert_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Expert_2nd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Expert_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Expert_3rd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Expert_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_1st: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_2nd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_3rd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Intermediate_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Master_1st: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Master_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Master_2nd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Master_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_EnduranceRacing_Master_3rd: {
    name: 'trait_Horse_HorseCompetition_EnduranceRacing_Master_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_NoCompetitionsWon: {
    name: 'trait_Horse_HorseCompetition_NoCompetitionsWon',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Beginner_1st: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Beginner_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Beginner_2nd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Beginner_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Beginner_3rd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Beginner_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Expert_1st: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Expert_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Expert_2nd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Expert_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Expert_3rd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Expert_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Intermediate_1st: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Intermediate_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Intermediate_2nd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Intermediate_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Intermediate_3rd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Intermediate_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Master_1st: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Master_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Master_2nd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Master_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_ShowJumping_Master_3rd: {
    name: 'trait_Horse_HorseCompetition_ShowJumping_Master_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_UltimateChampionship_1st: {
    name: 'trait_Horse_HorseCompetition_UltimateChampionship_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_UltimateChampionship_2nd: {
    name: 'trait_Horse_HorseCompetition_UltimateChampionship_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_UltimateChampionship_3rd: {
    name: 'trait_Horse_HorseCompetition_UltimateChampionship_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Beginner_1st: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Beginner_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Beginner_2nd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Beginner_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Beginner_3rd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Beginner_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Expert_1st: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Expert_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Expert_2nd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Expert_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Expert_3rd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Expert_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Intermediate_1st: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Intermediate_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Intermediate_2nd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Intermediate_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Intermediate_3rd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Intermediate_3rd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Master_1st: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Master_1st',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Master_2nd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Master_2nd',
    ignored: true,
  },
  trait_Horse_HorseCompetition_WesternPleasure_Master_3rd: {
    name: 'trait_Horse_HorseCompetition_WesternPleasure_Master_3rd',
    ignored: true,
  },
  trait_Horse_HorseTransaction_Hidden_Rescue: {
    name: 'trait_Horse_HorseTransaction_Hidden_Rescue',
    ignored: true,
  },
  trait_Horse_Personality_Aggressive: {
    name: 'trait_Horse_Personality_Aggressive',
    ignored: false,
    description: 'is aggressive',
  },
  trait_Horse_Personality_Brave: {
    name: 'trait_Horse_Personality_Brave',
    ignored: false,
    description: 'is brave',
  },
  trait_Horse_Personality_Defiant: {
    name: 'trait_Horse_Personality_Defiant',
    ignored: false,
    description: 'is defiant',
  },
  trait_Horse_Personality_Energetic: {
    name: 'trait_Horse_Personality_Energetic',
    ignored: false,
    description: 'is energetic',
  },
  trait_Horse_Personality_Fearful: {
    name: 'trait_Horse_Personality_Fearful',
    ignored: false,
    description: 'is fearful',
  },
  trait_Horse_Personality_FreeSpirit: {
    name: 'trait_Horse_Personality_FreeSpirit',
    ignored: false,
    description: 'is a free spirit',
  },
  trait_Horse_Personality_Friendly: {
    name: 'trait_Horse_Personality_Friendly',
    ignored: false,
    description: 'is friendly',
  },
  trait_Horse_Personality_Independent: {
    name: 'trait_Horse_Personality_Independent',
    ignored: false,
    description: 'is independent',
  },
  trait_Horse_Personality_Intelligent: {
    name: 'trait_Horse_Personality_Intelligent',
    ignored: false,
    description: 'is intelligent',
  },
  trait_Horse_Personality_Mellow: {
    name: 'trait_Horse_Personality_Mellow',
    ignored: false,
    description: 'is mellow',
  },
  trait_Horse_Personality_Needy: {
    name: 'trait_Horse_Personality_Needy',
    ignored: false,
    description: 'is needy',
  },
  trait_HorseLover: {
    name: 'trait_HorseLover',
    ignored: false,
    description: 'is a Horse Lover',
  },
  trait_HotHeaded: {
    name: 'trait_HotHeaded',
    ignored: false,
    description: 'is hot-headed',
  },
  trait_HSExit_Dropout: {
    name: 'trait_HSExit_Dropout',
    ignored: false,
    description: 'is a high school dropout',
  },
  trait_HSExit_EarnedGED: {
    name: 'trait_HSExit_EarnedGED',
    ignored: false,
    description: 'is graduated with a GED',
  },
  trait_HSExit_Expelled: {
    name: 'trait_HSExit_Expelled',
    ignored: false,
    description: 'is expelled from High School',
  },
  trait_HSExit_Graduate_Early: {
    name: 'trait_HSExit_Graduate_Early',
    ignored: true,
  },
  trait_HSExit_Graduate_Honors: {
    name: 'trait_HSExit_Graduate_Honors',
    ignored: true,
  },
  trait_HSExit_Graduate_Valedictorian: {
    name: 'trait_HSExit_Graduate_Valedictorian',
    ignored: false,
    description: 'is a High School Valedictorian graduate',
  },
  trait_Human_Infant_Element_FrequentlyHiccups: {
    name: 'trait_Human_Infant_Element_FrequentlyHiccups',
    ignored: true,
  },
  trait_Human_Infant_Element_FrequentlySneezes: {
    name: 'trait_Human_Infant_Element_FrequentlySneezes',
    ignored: true,
  },
  trait_Human_Infant_Element_Gassy: {
    name: 'trait_Human_Infant_Element_Gassy',
    ignored: true,
  },
  trait_Human_Infant_Element_GoodAppetite: {
    name: 'trait_Human_Infant_Element_GoodAppetite',
    ignored: true,
  },
  trait_Human_Infant_Element_HappySpitter: {
    name: 'trait_Human_Infant_Element_HappySpitter',
    ignored: true,
  },
  trait_Human_Infant_Element_HatesBeingHeld: {
    name: 'trait_Human_Infant_Element_HatesBeingHeld',
    ignored: true,
  },
  trait_Human_Infant_Element_HatesWakingUp: {
    name: 'trait_Human_Infant_Element_HatesWakingUp',
    ignored: true,
  },
  trait_Human_Infant_Element_LovesBeingHeld: {
    name: 'trait_Human_Infant_Element_LovesBeingHeld',
    ignored: true,
  },
  trait_Human_Infant_Element_LovesWakingUp: {
    name: 'trait_Human_Infant_Element_LovesWakingUp',
    ignored: true,
  },
  trait_Human_Infant_Element_MessyEater: {
    name: 'trait_Human_Infant_Element_MessyEater',
    ignored: true,
  },
  trait_Human_Infant_Element_ObsessedWithSound: {
    name: 'trait_Human_Infant_Element_ObsessedWithSound',
    ignored: true,
  },
  trait_Human_Infant_Element_OnlySleepsWhenHeld: {
    name: 'trait_Human_Infant_Element_OnlySleepsWhenHeld',
    ignored: true,
  },
  trait_Human_Infant_Element_PeesDuringChanges: {
    name: 'trait_Human_Infant_Element_PeesDuringChanges',
    ignored: true,
  },
  trait_Human_Infant_Element_PeesDuringFeeding: {
    name: 'trait_Human_Infant_Element_PeesDuringFeeding',
    ignored: true,
  },
  trait_Human_Infant_Element_PickyEater: {
    name: 'trait_Human_Infant_Element_PickyEater',
    ignored: true,
  },
  trait_Human_Infant_Element_RisesWithTheSun: {
    name: 'trait_Human_Infant_Element_RisesWithTheSun',
    ignored: true,
  },
  trait_Human_Infant_Element_SelfSoother: {
    name: 'trait_Human_Infant_Element_SelfSoother',
    ignored: true,
  },
  trait_Human_Infant_Element_Talker: {
    name: 'trait_Human_Infant_Element_Talker',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_Aggressive: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_Aggressive',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_AudioLover: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_AudioLover',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_BookLover: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_BookLover',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_Destructive: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_Destructive',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_EarlyRiser: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_EarlyRiser',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_GoodAppetite: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_GoodAppetite',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_HatesBedtime: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_HatesBedtime',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_HatesCarry: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_HatesCarry',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_HatesWakeup: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_HatesWakeup',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_HeavySleeper: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_HeavySleeper',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_LightSleeper: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_LightSleeper',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_LovesCarry: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_LovesCarry',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_LovesWakeup: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_LovesWakeup',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_MessyEater: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_MessyEater',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_PickyEater: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_PickyEater',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_RunsAway: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_RunsAway',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_Singer: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_Singer',
    ignored: true,
  },
  trait_Human_ToddlerPersonalityUpdate_Visible_WaterLover: {
    name: 'trait_Human_ToddlerPersonalityUpdate_Visible_WaterLover',
    ignored: true,
  },
  Trait_Humanoid_Robot_Died: {
    name: 'Trait_Humanoid_Robot_Died',
    ignored: true,
  },
  trait_Humanoid_Robot_Hover: {
    name: 'trait_Humanoid_Robot_Hover',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_BeigeWhite: {
    name: 'trait_Humanoid_Robot_Outfit_BeigeWhite',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_BlackBlue: {
    name: 'trait_Humanoid_Robot_Outfit_BlackBlue',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_BlueRed: {
    name: 'trait_Humanoid_Robot_Outfit_BlueRed',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_GrayBrown: {
    name: 'trait_Humanoid_Robot_Outfit_GrayBrown',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_GreenBrown: {
    name: 'trait_Humanoid_Robot_Outfit_GreenBrown',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_RedGreen: {
    name: 'trait_Humanoid_Robot_Outfit_RedGreen',
    ignored: true,
  },
  trait_Humanoid_Robot_Outfit_WhiteCopper: {
    name: 'trait_Humanoid_Robot_Outfit_WhiteCopper',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Childcare_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Childcare_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_ChildCare_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_ChildCare_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Childcare_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Childcare_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_ChildCare_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_ChildCare_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Cleaning_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Cleaning_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Cleaning_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Cleaning_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Cleaning_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Cleaning_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Cleaning_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Cleaning_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Gardening_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Gardening_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Gardening_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Gardening_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Gardening_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Gardening_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Gardening_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Gardening_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Party_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Party_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Party_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Party_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Party_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Party_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Party_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Party_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Repair_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Repair_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Repair_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Repair_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Repair_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Repair_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Repair_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Repair_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Security_Active: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Security_Active',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Security_Learned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Security_Learned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Security_NotLearned: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Security_NotLearned',
    ignored: true,
  },
  trait_Humanoid_Robots_BehaviorModules_Security_TriggerUnlock: {
    name: 'trait_Humanoid_Robots_BehaviorModules_Security_TriggerUnlock',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_1: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_1',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_10: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_10',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_2: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_2',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_3: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_3',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_4: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_4',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_5: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_5',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_6: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_6',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_7: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_7',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_8: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_8',
    ignored: true,
  },
  trait_Humanoid_Robots_EnhancementLevel_9: {
    name: 'trait_Humanoid_Robots_EnhancementLevel_9',
    ignored: true,
  },
  trait_Humanoid_Robots_MainTrait: {
    name: 'trait_Humanoid_Robots_MainTrait',
    ignored: true,
  },
  trait_Iconic: {
    name: 'trait_Iconic',
    ignored: false,
    description: 'is iconic',
  },
  trait_Identified_Chamomile: {
    name: 'trait_Identified_Chamomile',
    ignored: true,
  },
  trait_Identified_Chamomile_Toxic: {
    name: 'trait_Identified_Chamomile_Toxic',
    ignored: true,
  },
  trait_Identified_Elderberry: {
    name: 'trait_Identified_Elderberry',
    ignored: true,
  },
  trait_Identified_Elderberry_Toxic: {
    name: 'trait_Identified_Elderberry_Toxic',
    ignored: true,
  },
  trait_Identified_Fireleaf: {
    name: 'trait_Identified_Fireleaf',
    ignored: true,
  },
  trait_Identified_Fireleaf_Toxic: {
    name: 'trait_Identified_Fireleaf_Toxic',
    ignored: true,
  },
  trait_Identified_Huckleberry: {
    name: 'trait_Identified_Huckleberry',
    ignored: true,
  },
  trait_Identified_Huckleberry_Toxic: {
    name: 'trait_Identified_Huckleberry_Toxic',
    ignored: true,
  },
  trait_Identified_Morel: {
    name: 'trait_Identified_Morel',
    ignored: true,
  },
  trait_Identified_Morel_Toxic: {
    name: 'trait_Identified_Morel_Toxic',
    ignored: true,
  },
  Trait_InCollegeOrganization: {
    name: 'Trait_InCollegeOrganization',
    ignored: true,
  },
  trait_IncrediblyFriendly: {
    name: 'trait_IncrediblyFriendly',
    ignored: false,
    description: 'is incredibly friendly',
  },
  trait_Independent: {
    name: 'trait_Independent',
    ignored: false,
    description: 'is independent',
  },
  trait_infant: {
    name: 'trait_infant',
    ignored: true,
  },
  trait_Infant_Calm: {
    name: 'trait_Infant_Calm',
    ignored: true,
  },
  trait_Infant_Cautious: {
    name: 'trait_Infant_Cautious',
    ignored: true,
  },
  trait_Infant_Intense: {
    name: 'trait_Infant_Intense',
    ignored: true,
  },
  trait_Infant_Sensitive: {
    name: 'trait_Infant_Sensitive',
    ignored: true,
  },
  trait_Infant_Sunny: {
    name: 'trait_Infant_Sunny',
    ignored: true,
  },
  trait_Infant_Wiggly: {
    name: 'trait_Infant_Wiggly',
    ignored: true,
  },
  trait_Insane: {
    name: 'trait_Insane',
    ignored: false,
    description: 'is insane',
  },
  trait_Insider: {
    name: 'trait_Insider',
    ignored: false,
    description: 'is an insider and loves being in clubs',
  },
  trait_InteriorDecorator_Client_Cooldown: {
    name: 'trait_InteriorDecorator_Client_Cooldown',
    ignored: true,
  },
  trait_InteriorDecorator_Client_Followup_Gig_Negative: {
    name: 'trait_InteriorDecorator_Client_Followup_Gig_Negative',
    ignored: true,
  },
  trait_InteriorDecorator_Client_Followup_Gig_Positive: {
    name: 'trait_InteriorDecorator_Client_Followup_Gig_Positive',
    ignored: true,
  },
  trait_InteriorDecorator_Client_Followup_Gig_Referred: {
    name: 'trait_InteriorDecorator_Client_Followup_Gig_Referred',
    ignored: true,
  },
  trait_InteriorDecorator_HideClients: {
    name: 'trait_InteriorDecorator_HideClients',
    ignored: true,
  },
  trait_InTheKnow: {
    name: 'trait_InTheKnow',
    ignored: true,
  },
  trait_IntroToVampire_Caller: {
    name: 'trait_IntroToVampire_Caller',
    ignored: true,
  },
  trait_Invested: {
    name: 'trait_Invested',
    ignored: true,
  },
  trait_isAlienPollinator: {
    name: 'trait_isAlienPollinator',
    description: 'is an alien pollinator',
  },
  trait_isBear: {
    name: 'trait_isBear',
    description: 'is a bear',
  },
  trait_isBornFromAlienAbduction: {
    name: 'trait_isBornFromAlienAbduction',
    description: 'was born from an alien abduction and impregnation',
  },
  trait_isButler: {
    name: 'trait_isButler',
    description: 'is a butler',
  },
  trait_isChaletGardensGhost: {
    name: 'trait_isChaletGardensGhost',
    description: 'is a ghost in the chalet gardens',
  },
  trait_isCityRepair: {
    name: 'trait_isCityRepair',
    description: 'is a city maintenance worker',
  },
  trait_isCustomGender: {
    name: 'trait_isCustomGender',
    ignored: true,
  },
  trait_isEmit: {
    name: 'trait_isEmit',
    ignored: true,
  },
  trait_isForestRanger: {
    name: 'trait_isForestRanger',
    description: 'is a forest ranger',
  },
  trait_isGardener: {
    name: 'trait_isGardener',
    description: 'is a gardener',
  },
  trait_isGardener_Service: {
    name: 'trait_isGardener_Service',
    ignored: true,
  },
  trait_IsGhost: {
    name: 'trait_IsGhost',
    description: 'is a ghost',
  },
  trait_isGrimReaper: {
    name: 'trait_isGrimReaper',
    description: 'is the grim reaper',
  },
  trait_IslandAncestors: {
    name: 'trait_IslandAncestors',
    ignored: false,
    description: 'has island ancestors',
  },
  trait_IslanderCulture_Islander: {
    name: 'trait_IslanderCulture_Islander',
    description: 'is an islander',
  },
  trait_isMaid: {
    name: 'trait_isMaid',
    description: 'is a maid',
  },
  trait_isMailman: {
    name: 'trait_isMailman',
    description: 'is the mailmain',
  },
  trait_isMassageTherapist: {
    name: 'trait_isMassageTherapist',
    description: 'is a massage therapist',
  },
  trait_isMasterFisherman: {
    name: 'trait_isMasterFisherman',
    description: 'is a master fisherman',
  },
  trait_isMasterGardener: {
    name: 'trait_isMasterGardener',
    description: 'is a master gardener',
  },
  trait_isMasterHerbalist: {
    name: 'trait_isMasterHerbalist',
    description: 'is a master herbalist',
  },
  trait_isNanny: {
    name: 'trait_isNanny',
    description: 'is a nanny',
  },
  trait_isPizzaDelivery: {
    name: 'trait_isPizzaDelivery',
    description: 'is the pizza delivery person',
  },
  trait_isPlantSimNPC: {
    name: 'trait_isPlantSimNPC',
    description: 'is a plant',
  },
  trait_isPregnant: {
    name: 'trait_isPregnant',
    description: 'is actively pregnant',
  },
  trait_isPregnant_Alien_Abduction: {
    name: 'trait_isPregnant_Alien_Abduction',
    description: 'is pregnant from an alien abduction',
  },
  trait_isPremadePO: {
    name: 'trait_isPremadePO',
    ignored: true,
  },
  trait_isRanchHand: {
    name: 'trait_isRanchHand',
    description: 'is a ranch hand',
  },
  trait_isRepair: {
    name: 'trait_isRepair',
    description: 'is repairman',
  },
  trait_isRestaurantCritic: {
    name: 'trait_isRestaurantCritic',
    description: 'is a restaurant critic',
  },
  trait_isSchoolGhost: {
    name: 'trait_isSchoolGhost',
    description: 'is a school ghost',
  },
  trait_isStatueBusker: {
    name: 'trait_isStatueBusker',
    description: 'is a statue busker',
  },
  trait_isTragicClown: {
    name: 'trait_isTragicClown',
    description: 'is the tragic clown',
  },
  trait_isWeirdo: {
    name: 'trait_isWeirdo',
    description: 'is a weirdo',
  },
  trait_Jealous: {
    name: 'trait_Jealous',
    ignored: false,
    description: 'is jealous',
  },
  trait_JobLoss_InLayoffPeriod: {
    name: 'trait_JobLoss_InLayoffPeriod',
    description: 'was laid off from their job',
  },
  trait_JungleExplorer_TreasureHunter: {
    name: 'trait_JungleExplorer_TreasureHunter',
    ignored: false,
    description: 'is a skilled treasure hunter',
  },
  trait_JungleExplorer_TreasureHunter_BG: {
    name: 'trait_JungleExplorer_TreasureHunter_BG',
    ignored: true,
  },
  trait_Kleptomaniac: {
    name: 'trait_Kleptomaniac',
    ignored: false,
    description: 'is a kleptomaniac',
  },
  trait_Kleptomaniac_Enhanced: {
    name: 'trait_Kleptomaniac_Enhanced',
    ignored: true,
  },
  trait_Knowledge_SlingerOfSpells: {
    name: 'trait_Knowledge_SlingerOfSpells',
    ignored: true,
  },
  trait_LactoseIntolerant: {
    name: 'trait_LactoseIntolerant',
    ignored: false,
    description: 'is lactose intolerant',
  },
  trait_Lazy: {
    name: 'trait_Lazy',
    ignored: false,
    description: 'is lazy',
  },
  trait_Legendary: {
    name: 'trait_Legendary',
    ignored: false,
    description: 'is legendary',
  },
  trait_LifeSkills_Argumentative: {
    name: 'trait_LifeSkills_Argumentative',
    ignored: false,
    description: 'is argumentative',
  },
  trait_LifeSkills_BadManners: {
    name: 'trait_LifeSkills_BadManners',
    ignored: false,
    description: 'has bad manners',
  },
  trait_LifeSkills_Compassionate: {
    name: 'trait_LifeSkills_Compassionate',
    ignored: false,
    description: 'is compassionate',
  },
  trait_LifeSkills_EmotionalControl: {
    name: 'trait_LifeSkills_EmotionalControl',
    ignored: false,
    description: 'has great emotional control',
  },
  trait_LifeSkills_GoodManners: {
    name: 'trait_LifeSkills_GoodManners',
    ignored: false,
    description: 'has good manners',
  },
  trait_LifeSkills_Irresponsible: {
    name: 'trait_LifeSkills_Irresponsible',
    ignored: false,
    description: 'is irresponsible',
  },
  trait_LifeSkills_Mediator: {
    name: 'trait_LifeSkills_Mediator',
    ignored: false,
    description: 'is a skilled mediator',
  },
  trait_LifeSkills_Responsible: {
    name: 'trait_LifeSkills_Responsible',
    ignored: false,
    description: 'is responsible',
  },
  trait_LifeSkills_UncontrolledEmotion: {
    name: 'trait_LifeSkills_UncontrolledEmotion',
    ignored: false,
    description: 'has uncontrolled emotions',
  },
  trait_LifeSkills_Unfeeling: {
    name: 'trait_LifeSkills_Unfeeling',
    ignored: false,
    description: 'is unfeeling and insensitive',
  },
  trait_Lifestyles_AdrenalineSeeker: {
    name: 'trait_Lifestyles_AdrenalineSeeker',
    ignored: false,
    description: 'is an adrenaline junkie',
  },
  trait_Lifestyles_CloseKnit: {
    name: 'trait_Lifestyles_CloseKnit',
    ignored: false,
    description:
      'is good at forming deep connections with a small circle of friends',
  },
  trait_Lifestyles_CoffeeFanatic: {
    name: 'trait_Lifestyles_CoffeeFanatic',
    ignored: false,
    description: 'is a Coffee Fanatic',
  },
  trait_Lifestyles_Energetic: {
    name: 'trait_Lifestyles_Energetic',
    ignored: false,
    description: 'has an energetic lifestyle',
  },
  trait_Lifestyles_FrequentTraveler: {
    name: 'trait_Lifestyles_FrequentTraveler',
    ignored: false,
    description: 'is a frequent traveler',
  },
  trait_Lifestyles_HealthFoodNut: {
    name: 'trait_Lifestyles_HealthFoodNut',
    ignored: false,
    description: 'follows a Health Food Nut Lifestyle',
  },
  trait_Lifestyles_HungryForLove: {
    name: 'trait_Lifestyles_HungryForLove',
    ignored: false,
    description:
      'strongly desires to be in a relationship and struggles without one',
  },
  trait_Lifestyles_Indoorsy: {
    name: 'trait_Lifestyles_Indoorsy',
    ignored: false,
    description: 'is a homebody',
  },
  trait_Lifestyles_JunkFoodDevourer: {
    name: 'trait_Lifestyles_JunkFoodDevourer',
    ignored: false,
    description: 'loves junk food',
  },
  trait_Lifestyles_Networker: {
    name: 'trait_Lifestyles_Networker',
    ignored: false,
    description: 'is good at social networking',
  },
  trait_Lifestyles_NoNeedForRomance: {
    name: 'trait_Lifestyles_NoNeedForRomance',
    ignored: false,
    description: 'doesnt need romance',
  },
  trait_Lifestyles_Outdoorsy: {
    name: 'trait_Lifestyles_Outdoorsy',
    ignored: false,
    description: 'is outdoorsy',
  },
  trait_Lifestyles_Sedentary: {
    name: 'trait_Lifestyles_Sedentary',
    ignored: false,
    description: 'is sedentary',
  },
  trait_Lifestyles_Techie: {
    name: 'trait_Lifestyles_Techie',
    ignored: false,
    description: 'is a Techie',
  },
  trait_Lifestyles_Technophobe: {
    name: 'trait_Lifestyles_Technophobe',
    ignored: false,
    description: 'is a technophobe',
  },
  trait_Lifestyles_Workaholic: {
    name: 'trait_Lifestyles_Workaholic',
    ignored: false,
    description: 'is the Workaholic',
  },
  trait_LivingVicariously: {
    name: 'trait_LivingVicariously',
    ignored: false,
    description: 'is living vicariously',
  },
  trait_Loner: {
    name: 'trait_Loner',
    ignored: false,
    description: 'is a loner',
  },
  trait_Longevity: {
    name: 'trait_Longevity',
    ignored: false,
    description: 'lives with longevity',
  },
  trait_LoveGuru: {
    name: 'trait_LoveGuru',
    ignored: true,
  },
  trait_LovesOutdoors: {
    name: 'trait_LovesOutdoors',
    ignored: false,
    description: 'loves the outdoors',
  },
  trait_LoveStruck: {
    name: 'trait_LoveStruck',
    description: 'falls in love easily',
  },
  trait_Loyal: {
    name: 'trait_Loyal',
    ignored: false,
    description: 'is loyal',
  },
  trait_Macabre: {
    name: 'trait_Macabre',
    description: 'is macabre',
  },
  trait_Magic_Fixups_DarrelCharm: {
    name: 'trait_Magic_Fixups_DarrelCharm',
    ignored: true,
  },
  trait_Magic_Fixups_EmiliaErnest: {
    name: 'trait_Magic_Fixups_EmiliaErnest',
    ignored: true,
  },
  trait_Magic_Fixups_GemmaCharm: {
    name: 'trait_Magic_Fixups_GemmaCharm',
    ignored: true,
  },
  trait_Magic_Fixups_GraceAnansi: {
    name: 'trait_Magic_Fixups_GraceAnansi',
    ignored: true,
  },
  trait_Magic_Fixups_MinervaCharm: {
    name: 'trait_Magic_Fixups_MinervaCharm',
    ignored: true,
  },
  trait_Magic_FIxups_Perks_MagicVenueNPC: {
    name: 'trait_Magic_FIxups_Perks_MagicVenueNPC',
    ignored: true,
  },
  trait_Magic_FIxups_Potions_Intermediate: {
    name: 'trait_Magic_FIxups_Potions_Intermediate',
    ignored: true,
  },
  trait_Magic_FIxups_Potions_Novice: {
    name: 'trait_Magic_FIxups_Potions_Novice',
    ignored: true,
  },
  trait_Magic_FIxups_Potions_Sage: {
    name: 'trait_Magic_FIxups_Potions_Sage',
    ignored: true,
  },
  trait_Magic_FIxups_Spells_MagicSage_Mischief: {
    name: 'trait_Magic_FIxups_Spells_MagicSage_Mischief',
    ignored: true,
  },
  trait_Magic_FIxups_Spells_MagicSage_Practical: {
    name: 'trait_Magic_FIxups_Spells_MagicSage_Practical',
    ignored: true,
  },
  trait_Magic_FIxups_Spells_MagicSage_Untamed: {
    name: 'trait_Magic_FIxups_Spells_MagicSage_Untamed',
    ignored: true,
  },
  trait_Magic_FIxups_Spells_MagicVenueNPC_Intermediate: {
    name: 'trait_Magic_FIxups_Spells_MagicVenueNPC_Intermediate',
    ignored: true,
  },
  trait_Magic_FIxups_Spells_MagicVenueNPC_Novice: {
    name: 'trait_Magic_FIxups_Spells_MagicVenueNPC_Novice',
    ignored: true,
  },
  trait_Magic_Fixups_TomaxCollette: {
    name: 'trait_Magic_Fixups_TomaxCollette',
    ignored: true,
  },
  trait_Magic_Marketstall_SpectralLook: {
    name: 'trait_Magic_Marketstall_SpectralLook',
    ignored: true,
  },
  trait_MagicSage_Mischief: {
    name: 'trait_MagicSage_Mischief',
    ignored: true,
  },
  trait_MagicSage_Practical: {
    name: 'trait_MagicSage_Practical',
    ignored: true,
  },
  trait_MagicSage_Untamed: {
    name: 'trait_MagicSage_Untamed',
    ignored: true,
  },
  trait_Maker: {
    name: 'trait_Maker',
    description: 'is a Maker',
  },
  trait_makerNPC: {
    name: 'trait_makerNPC',
    ignored: false,
    description: 'is a maker',
  },
  trait_Marketable: {
    name: 'trait_Marketable',
    ignored: false,
    description: 'is good at marketing',
  },
  trait_MasterMaker: {
    name: 'trait_MasterMaker',
    ignored: false,
    description: 'is a master maker',
  },
  trait_Mastermind: {
    name: 'trait_Mastermind',
    ignored: false,
    description: 'is a mastermind',
  },
  trait_MasterTrainer: {
    name: 'trait_MasterTrainer',
    ignored: false,
    description: 'is a master horse trainer',
  },
  trait_Materialistic: {
    name: 'trait_Materialistic',
    ignored: false,
    description: 'is materialistic',
  },
  trait_Mean: {
    name: 'trait_Mean',
    ignored: false,
    description: 'is mean',
  },
  trait_MechanicalSuit_HoverEngaged: {
    name: 'trait_MechanicalSuit_HoverEngaged',
    description: 'is hovering in a hover suit',
  },
  trait_MechanicalSuit_Wearing_Body_BeigeWhite: {
    name: 'trait_MechanicalSuit_Wearing_Body_BeigeWhite',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_BlackBlue: {
    name: 'trait_MechanicalSuit_Wearing_Body_BlackBlue',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_BlueRed: {
    name: 'trait_MechanicalSuit_Wearing_Body_BlueRed',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_GrayBrown: {
    name: 'trait_MechanicalSuit_Wearing_Body_GrayBrown',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_GreenBrown: {
    name: 'trait_MechanicalSuit_Wearing_Body_GreenBrown',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_RedGreen: {
    name: 'trait_MechanicalSuit_Wearing_Body_RedGreen',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Body_WhiteCopper: {
    name: 'trait_MechanicalSuit_Wearing_Body_WhiteCopper',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_BlackBlue: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_BlackBlue',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_BlackCopper: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_BlackCopper',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_BlackGold: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_BlackGold',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_BlackGray: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_BlackGray',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_BlueGray: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_BlueGray',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_GrayBlack: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_GrayBlack',
    ignored: true,
  },
  trait_MechanicalSuit_Wearing_Helmet_GreenBlack: {
    name: 'trait_MechanicalSuit_Wearing_Helmet_GreenBlack',
    ignored: true,
  },
  trait_MeltMaster: {
    name: 'trait_MeltMaster',
    description: 'is grilled cheese maker melt master',
  },
  trait_Memorable: {
    name: 'trait_Memorable',
    description: 'is memorable',
  },
  trait_MentallyGifted: {
    name: 'trait_MentallyGifted',
    ignored: false,
    description: 'is mentally gifted',
  },
  trait_Mentor: {
    name: 'trait_Mentor',
    ignored: false,
    description: 'is a mentor',
  },
  trait_Misbehavior_Cat_JumpOnCounters: {
    name: 'trait_Misbehavior_Cat_JumpOnCounters',
    ignored: true,
  },
  trait_Misbehavior_Cat_Scratching: {
    name: 'trait_Misbehavior_Cat_Scratching',
    ignored: true,
  },
  trait_Misbehavior_Dog_Bark: {
    name: 'trait_Misbehavior_Dog_Bark',
    ignored: true,
  },
  trait_Misbehavior_Dog_EatPoop: {
    name: 'trait_Misbehavior_Dog_EatPoop',
    ignored: true,
  },
  trait_Misbehavior_Dog_JumpOnCounters: {
    name: 'trait_Misbehavior_Dog_JumpOnCounters',
    ignored: true,
  },
  trait_Misbehavior_Dog_PuddlesPlay: {
    name: 'trait_Misbehavior_Dog_PuddlesPlay',
    ignored: true,
  },
  trait_Misbehavior_Dog_Toilet: {
    name: 'trait_Misbehavior_Dog_Toilet',
    ignored: true,
  },
  trait_Misbehavior_Pet_Attack: {
    name: 'trait_Misbehavior_Pet_Attack',
    ignored: true,
  },
  trait_Misbehavior_Pet_BegEating: {
    name: 'trait_Misbehavior_Pet_BegEating',
    ignored: true,
  },
  trait_Misbehavior_Pet_PuddlesDrink: {
    name: 'trait_Misbehavior_Pet_PuddlesDrink',
    ignored: true,
  },
  trait_Misbehavior_Pet_TrashEat: {
    name: 'trait_Misbehavior_Pet_TrashEat',
    ignored: true,
  },
  trait_Misbehavior_Pet_TrashPlay: {
    name: 'trait_Misbehavior_Pet_TrashPlay',
    ignored: true,
  },
  trait_Misbehaviors_Pet_Debug: {
    name: 'trait_Misbehaviors_Pet_Debug',
    ignored: true,
  },
  trait_Misbehaviors_Pet_EatPeopleFood: {
    name: 'trait_Misbehaviors_Pet_EatPeopleFood',
    ignored: true,
  },
  trait_Misbehaviors_Pet_WakeUpSims: {
    name: 'trait_Misbehaviors_Pet_WakeUpSims',
    ignored: true,
  },
  trait_MorningPerson: {
    name: 'trait_MorningPerson',
    ignored: false,
    description: 'is a Morning Person',
  },
  trait_MovingOn_BurningSoul: {
    name: 'trait_MovingOn_BurningSoul',
    ignored: true,
  },
  trait_MovingOn_BurningSoul_Reincarnated: {
    name: 'trait_MovingOn_BurningSoul_Reincarnated',
    ignored: true,
  },
  trait_MovingOn_Hidden_DreamsFulfilled: {
    name: 'trait_MovingOn_Hidden_DreamsFulfilled',
    ignored: true,
  },
  trait_MovingOn_Hidden_FindingPurpose: {
    name: 'trait_MovingOn_Hidden_FindingPurpose',
    ignored: true,
  },
  trait_MovingOn_Hidden_InfantHasReincarnated: {
    name: 'trait_MovingOn_Hidden_InfantHasReincarnated',
    ignored: true,
  },
  trait_MovingOn_Hidden_MakingHeadway: {
    name: 'trait_MovingOn_Hidden_MakingHeadway',
    ignored: true,
  },
  trait_MovingOn_Hidden_NewfoundPurpose: {
    name: 'trait_MovingOn_Hidden_NewfoundPurpose',
    ignored: true,
  },
  trait_MovingOn_Hidden_NoRegrets: {
    name: 'trait_MovingOn_Hidden_NoRegrets',
    ignored: true,
  },
  trait_MovingOn_Hidden_PastLifeRecalled: {
    name: 'trait_MovingOn_Hidden_PastLifeRecalled',
    ignored: true,
  },
  trait_MovingOn_Hidden_QuiteAJourney: {
    name: 'trait_MovingOn_Hidden_QuiteAJourney',
    ignored: true,
  },
  trait_MovingOn_Hidden_TheRoadAhead: {
    name: 'trait_MovingOn_Hidden_TheRoadAhead',
    ignored: true,
  },
  trait_MovingOn_PerspectivesOnDeath: {
    name: 'trait_MovingOn_PerspectivesOnDeath',
    description:
      'is strengthened by loss and has a new perspective on death and life',
  },
  trait_MovingOn_Reincarnated: {
    name: 'trait_MovingOn_Reincarnated',
    description: 'is reincarnated',
  },
  trait_MultiUnit_Aspiration_DiscerningDweller: {
    name: 'trait_MultiUnit_Aspiration_DiscerningDweller',
    description: 'is a good neighbor',
  },
  trait_MultiUnit_Aspiration_FountainOfLocalKnowledge: {
    name: 'trait_MultiUnit_Aspiration_FountainOfLocalKnowledge',
    ignored: true,
  },
  trait_MultiUnit_Aspiration_LegendaryLandlord: {
    name: 'trait_MultiUnit_Aspiration_LegendaryLandlord',
    description: 'is a good landlord',
  },
  trait_MultiUnit_Aspiration_SeekerOfSecrets: {
    name: 'trait_MultiUnit_Aspiration_SeekerOfSecrets',
    ignored: true,
  },
  trait_MultiUnitGuide_KnowledgeableLeaser: {
    name: 'trait_MultiUnitGuide_KnowledgeableLeaser',
    ignored: true,
  },
  trait_Muser: {
    name: 'trait_Muser',
    ignored: false,
    description: 'is a muser',
  },
  trait_MusicFestival_Identifier_BebeRexha: {
    name: 'trait_MusicFestival_Identifier_BebeRexha',
    ignored: true,
  },
  trait_MusicFestival_Identifier_DaveBayley: {
    name: 'trait_MusicFestival_Identifier_DaveBayley',
    ignored: true,
  },
  trait_MusicFestival_Identifier_JoyOladokun: {
    name: 'trait_MusicFestival_Identifier_JoyOladokun',
    ignored: true,
  },
  trait_MusicLover: {
    name: 'trait_MusicLover',
    ignored: false,
    description: 'is a music lover',
  },
  trait_NaturalSpeaker: {
    name: 'trait_NaturalSpeaker',
    ignored: false,
    description: 'is a natural speaker',
  },
  trait_Nature_CountryCaretaker_NatureConversationalist: {
    name: 'trait_Nature_CountryCaretaker_NatureConversationalist',
    ignored: false,
    description:
      'is a Nature Conversationalist, has good relationship with animals',
  },
  trait_Nature_InfluentialIndividual: {
    name: 'trait_Nature_InfluentialIndividual',
    ignored: true,
    description: 'is Nature Influential',
  },
  trait_Nature_MasterMixer: {
    name: 'trait_Nature_MasterMixer',
    ignored: true,
  },
  trait_Neat: {
    name: 'trait_Neat',
    ignored: false,
    description: 'is neat',
  },
  trait_NectarKnowItAll: {
    name: 'trait_NectarKnowItAll',
    ignored: false,
    description: 'knows all about wine and nectar creation',
  },
  trait_NeedsNoOne: {
    name: 'trait_NeedsNoOne',
    ignored: false,
    description: "needs no one and doesn't need to socialize",
  },
  trait_NeverWeary: {
    name: 'trait_NeverWeary',
    ignored: false,
    description: 'never needs sleep',
  },
  trait_NewInTown_InspiredExplorer: {
    name: 'trait_NewInTown_InspiredExplorer',
    ignored: true,
  },
  trait_NightOwl: {
    name: 'trait_NightOwl',
    ignored: false,
    description: 'is a Night Owl',
  },
  trait_NightOwl_CrystalHelmet: {
    name: 'trait_NightOwl_CrystalHelmet',
    ignored: true,
  },
  trait_Nosy: {
    name: 'trait_Nosy',
    description: 'is nosy',
  },
  trait_NosyNeighbor: {
    name: 'trait_NosyNeighbor',
    ignored: true,
  },
  trait_Observant: {
    name: 'trait_Observant',
    ignored: false,
    description: 'is observant',
  },
  trait_Occult_NoOccult: {
    name: 'trait_Occult_NoOccult',
    ignored: true,
  },
  trait_Occult_WitchOccult: {
    name: 'trait_Occult_WitchOccult',
    ignored: true,
  },
  trait_Occult_WitchOccult_BloodlineAncient: {
    name: 'trait_Occult_WitchOccult_BloodlineAncient',
    ignored: true,
  },
  trait_Occult_WitchOccult_BloodlineStrong: {
    name: 'trait_Occult_WitchOccult_BloodlineStrong',
    ignored: true,
  },
  trait_Occult_WitchOccult_BloodlineWeak: {
    name: 'trait_Occult_WitchOccult_BloodlineWeak',
    ignored: true,
  },
  trait_Occult_WitchOccult_Manifested: {
    name: 'trait_Occult_WitchOccult_Manifested',
    ignored: true,
  },
  trait_OccultAlien: {
    name: 'trait_OccultAlien',
    description: 'is an alien',
  },
  trait_OccultAlien_and_Ghost: {
    name: 'trait_OccultAlien_and_Ghost',
    description: 'is an alien and a ghost',
  },
  trait_OccultAlien_Current: {
    name: 'trait_OccultAlien_Current',
    ignored: true,
  },
  trait_OccultAlien_FakeAlien: {
    name: 'trait_OccultAlien_FakeAlien',
    description: 'is a fake alien',
  },
  trait_OccultAlienPart: {
    name: 'trait_OccultAlienPart',
    ignored: true,
  },
  trait_OccultMermaid: {
    name: 'trait_OccultMermaid',
    description: 'is a mermaid',
  },
  trait_OccultMermaid_Discovered: {
    name: 'trait_OccultMermaid_Discovered',
    ignored: true,
  },
  trait_OccultMermaid_MerfolkWoke: {
    name: 'trait_OccultMermaid_MerfolkWoke',
    ignored: true,
  },
  trait_OccultMermaid_MermaidForm: {
    name: 'trait_OccultMermaid_MermaidForm',
    description: 'is in mermaid form',
  },
  trait_OccultMermaid_TemporaryDiscovered: {
    name: 'trait_OccultMermaid_TemporaryDiscovered',
    ignored: true,
  },
  trait_OccultMermaid_TYAE: {
    name: 'trait_OccultMermaid_TYAE',
    ignored: true,
  },
  trait_OccultMermaidAndGhost: {
    name: 'trait_OccultMermaidAndGhost',
    ignored: true,
  },
  trait_OccultVampire: {
    name: 'trait_OccultVampire',
    description: 'is a vampire',
  },
  trait_OccultVampire_BatBaby: {
    name: 'trait_OccultVampire_BatBaby',
    description: 'is a vampire bat baby',
  },
  trait_OccultVampire_Cured: {
    name: 'trait_OccultVampire_Cured',
    ignored: true,
  },
  trait_OccultVampire_DarkForm: {
    name: 'trait_OccultVampire_DarkForm',
    ignored: true,
  },
  trait_OccultVampire_DarkLeyLine: {
    name: 'trait_OccultVampire_DarkLeyLine',
    ignored: true,
  },
  trait_OccultVampire_Manifested: {
    name: 'trait_OccultVampire_Manifested',
    ignored: true,
  },
  trait_OccultVampire_ManualDarkForm: {
    name: 'trait_OccultVampire_ManualDarkForm',
    ignored: true,
  },
  trait_OccultWerewolf: {
    name: 'trait_OccultWerewolf',
    description: 'is a werewolf',
  },
  trait_OccultWerewolf_Abilities_TransformationMastery: {
    name: 'trait_OccultWerewolf_Abilities_TransformationMastery',
    ignored: true,
  },
  trait_OccultWerewolf_AspirationTraits_BetterFuryControl: {
    name: 'trait_OccultWerewolf_AspirationTraits_BetterFuryControl',
    ignored: true,
  },
  trait_OccultWerewolf_AspirationTraits_BetterTurning: {
    name: 'trait_OccultWerewolf_AspirationTraits_BetterTurning',
    ignored: true,
  },
  trait_OccultWerewolf_AspirationTraits_FormerLycan: {
    name: 'trait_OccultWerewolf_AspirationTraits_FormerLycan',
    ignored: true,
  },
  trait_OccultWerewolf_AspirationTraits_FriendlyWolf: {
    name: 'trait_OccultWerewolf_AspirationTraits_FriendlyWolf',
    ignored: true,
    description: 'is a friendly werewolf',
  },
  trait_OccultWerewolf_AspirationTraits_MoreFear: {
    name: 'trait_OccultWerewolf_AspirationTraits_MoreFear',
    ignored: true,
    description: 'instills fear as a werewolf',
  },
  trait_OccultWerewolf_DormantWolf: {
    name: 'trait_OccultWerewolf_DormantWolf',
    ignored: false,
    description:
      'is a dormant werewolf, with an inner wolf that remains asleep',
  },
  trait_OccultWerewolf_GreaterWolfBlood: {
    name: 'trait_OccultWerewolf_GreaterWolfBlood',
    ignored: true,
  },
  trait_OccultWerewolf_HadFirstFullMoon: {
    name: 'trait_OccultWerewolf_HadFirstFullMoon',
    ignored: true,
  },
  trait_OccultWerewolf_HadFirstTransformation: {
    name: 'trait_OccultWerewolf_HadFirstTransformation',
    ignored: true,
  },
  trait_OccultWerewolf_HasFatedMate: {
    name: 'trait_OccultWerewolf_HasFatedMate',
    ignored: true,
  },
  trait_OccultWerewolf_ImmortalWolf: {
    name: 'trait_OccultWerewolf_ImmortalWolf',
    ignored: true,
  },
  trait_OccultWerewolf_InitiationBonusTrait: {
    name: 'trait_OccultWerewolf_InitiationBonusTrait',
    ignored: true,
  },
  trait_OccultWerewolf_Manifested: {
    name: 'trait_OccultWerewolf_Manifested',
    ignored: true,
  },
  trait_OccultWerewolf_NaturalHealing: {
    name: 'trait_OccultWerewolf_NaturalHealing',
    ignored: true,
  },
  trait_OccultWerewolf_NoFuryGlow: {
    name: 'trait_OccultWerewolf_NoFuryGlow',
    ignored: true,
  },
  trait_OccultWerewolf_PrimalInstinct: {
    name: 'trait_OccultWerewolf_PrimalInstinct',
    ignored: true,
  },
  trait_OccultWerewolf_SuperSpeed: {
    name: 'trait_OccultWerewolf_SuperSpeed',
    ignored: true,
  },
  trait_OccultWerewolf_TeachToHowl: {
    name: 'trait_OccultWerewolf_TeachToHowl',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_AntiCapitalistCanine: {
    name: 'trait_OccultWerewolf_Temperaments_AntiCapitalistCanine',
    ignored: false,
    description: 'is an anticapitalist',
  },
  trait_OccultWerewolf_Temperaments_BigBadWolf: {
    name: 'trait_OccultWerewolf_Temperaments_BigBadWolf',
    ignored: false,
    description: 'is a Big Bad werewolf',
  },
  trait_OccultWerewolf_Temperaments_Carnivore: {
    name: 'trait_OccultWerewolf_Temperaments_Carnivore',
    ignored: false,
    description: 'is a carnivorous werewolf',
  },
  trait_OccultWerewolf_Temperaments_EasyExcitable: {
    name: 'trait_OccultWerewolf_Temperaments_EasyExcitable',
    ignored: false,
    description: 'is an easily excitable werewolf',
  },
  trait_OccultWerewolf_Temperaments_FeelsOutcasted: {
    name: 'trait_OccultWerewolf_Temperaments_FeelsOutcasted',
    ignored: false,
    description: 'feels like an outcast when not social',
  },
  trait_OccultWerewolf_Temperaments_Frisky: {
    name: 'trait_OccultWerewolf_Temperaments_Frisky',
    ignored: false,
    description: 'is a frisky werewolf',
  },
  trait_OccultWerewolf_Temperaments_GrumpyWolf: {
    name: 'trait_OccultWerewolf_Temperaments_GrumpyWolf',
    ignored: false,
    description: 'can be grumpy when low on sleep as a werewolf',
  },
  trait_OccultWerewolf_Temperaments_HatesBeingWet: {
    name: 'trait_OccultWerewolf_Temperaments_HatesBeingWet',
    ignored: false,
    description: 'hates being wet as a werewolf',
  },
  trait_OccultWerewolf_Temperaments_HungryLikeTheWolf: {
    name: 'trait_OccultWerewolf_Temperaments_HungryLikeTheWolf',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_Lunar_ForestMark: {
    name: 'trait_OccultWerewolf_Temperaments_Lunar_ForestMark',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_Lunar_HuntMark: {
    name: 'trait_OccultWerewolf_Temperaments_Lunar_HuntMark',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_Lunar_NightMark: {
    name: 'trait_OccultWerewolf_Temperaments_Lunar_NightMark',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_Lunar_WolfMark: {
    name: 'trait_OccultWerewolf_Temperaments_Lunar_WolfMark',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_MustBeClean: {
    name: 'trait_OccultWerewolf_Temperaments_MustBeClean',
    ignored: true,
  },
  trait_OccultWerewolf_Temperaments_NightWolf: {
    name: 'trait_OccultWerewolf_Temperaments_NightWolf',
    ignored: false,
    description: 'is a Night werewolf and keeps a nocturnal cycle',
  },
  trait_OccultWerewolf_Temperaments_Prideful: {
    name: 'trait_OccultWerewolf_Temperaments_Prideful',
    ignored: false,
    description: 'is prideful about being a Werewolf',
  },
  trait_OccultWerewolf_Temperaments_RestlessAnimal: {
    name: 'trait_OccultWerewolf_Temperaments_RestlessAnimal',
    ignored: false,
    description: 'is restless indoors',
  },
  trait_OccultWerewolf_Temperaments_SensitiveHearing: {
    name: 'trait_OccultWerewolf_Temperaments_SensitiveHearing',
    ignored: false,
    description: 'has sensitive hearing',
  },
  trait_OccultWerewolf_Temperaments_SurvivalInstincts: {
    name: 'trait_OccultWerewolf_Temperaments_SurvivalInstincts',
    ignored: false,
    description: 'has good survival instincts',
  },
  trait_OccultWerewolf_Temperaments_Territorial: {
    name: 'trait_OccultWerewolf_Temperaments_Territorial',
    ignored: false,
    description: 'is territorial',
  },
  trait_OccultWerewolf_Temperaments_WolfBrain: {
    name: 'trait_OccultWerewolf_Temperaments_WolfBrain',
    ignored: false,
    description: 'has low intelligence as a werewolf',
  },
  trait_OccultWerewolf_Temperaments_WrackedWithGuilt: {
    name: 'trait_OccultWerewolf_Temperaments_WrackedWithGuilt',
    ignored: false,
    description: 'is wracked with guilt because they are a werewolf',
  },
  trait_OccultWerewolf_WereForm: {
    name: 'trait_OccultWerewolf_WereForm',
    description: 'is in werewolf form',
  },
  trait_OccultWerewolf_WerewolfAlly: {
    name: 'trait_OccultWerewolf_WerewolfAlly',
    ignored: false,
    description: 'is an ally of werewolves',
  },
  trait_OneWithNature: {
    name: 'trait_OneWithNature',
    ignored: false,
    description: 'is One With Nature',
  },
  trait_Organizations_ArtSociety_Rank1: {
    name: 'trait_Organizations_ArtSociety_Rank1',
    ignored: true,
  },
  trait_Organizations_ArtSociety_Rank2: {
    name: 'trait_Organizations_ArtSociety_Rank2',
    ignored: true,
  },
  trait_Organizations_ArtSociety_Rank3: {
    name: 'trait_Organizations_ArtSociety_Rank3',
    ignored: true,
  },
  trait_Organizations_Debate_Rank1: {
    name: 'trait_Organizations_Debate_Rank1',
    ignored: true,
  },
  trait_Organizations_Debate_Rank2: {
    name: 'trait_Organizations_Debate_Rank2',
    ignored: true,
  },
  trait_Organizations_Debate_Rank3: {
    name: 'trait_Organizations_Debate_Rank3',
    ignored: true,
  },
  trait_Organizations_HonorSociety_Rank1: {
    name: 'trait_Organizations_HonorSociety_Rank1',
    ignored: true,
  },
  trait_Organizations_HonorSociety_Rank2: {
    name: 'trait_Organizations_HonorSociety_Rank2',
    ignored: true,
  },
  trait_Organizations_HonorSociety_Rank3: {
    name: 'trait_Organizations_HonorSociety_Rank3',
    ignored: true,
  },
  trait_Organizations_Robotics_Rank1: {
    name: 'trait_Organizations_Robotics_Rank1',
    ignored: true,
  },
  trait_Organizations_Robotics_Rank2: {
    name: 'trait_Organizations_Robotics_Rank2',
    ignored: true,
  },
  trait_Organizations_Robotics_Rank3: {
    name: 'trait_Organizations_Robotics_Rank3',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Party_Rank1: {
    name: 'trait_Organizations_SchoolSpirit_Party_Rank1',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Party_Rank2: {
    name: 'trait_Organizations_SchoolSpirit_Party_Rank2',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Party_Rank3: {
    name: 'trait_Organizations_SchoolSpirit_Party_Rank3',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Prank_Rank1: {
    name: 'trait_Organizations_SchoolSpirit_Prank_Rank1',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Prank_Rank2: {
    name: 'trait_Organizations_SchoolSpirit_Prank_Rank2',
    ignored: true,
  },
  trait_Organizations_SchoolSpirit_Prank_Rank3: {
    name: 'trait_Organizations_SchoolSpirit_Prank_Rank3',
    ignored: true,
  },
  trait_Organizations_SecretSociety_Favor_High: {
    name: 'trait_Organizations_SecretSociety_Favor_High',
    ignored: true,
  },
  trait_Organizations_SecretSociety_Favor_Low: {
    name: 'trait_Organizations_SecretSociety_Favor_Low',
    ignored: true,
  },
  trait_Organizations_SecretSociety_Favor_Med: {
    name: 'trait_Organizations_SecretSociety_Favor_Med',
    ignored: true,
  },
  trait_Organizations_SecretSociety_JoinVisit_Marked: {
    name: 'trait_Organizations_SecretSociety_JoinVisit_Marked',
    ignored: true,
  },
  trait_Outgoing: {
    name: 'trait_Outgoing',
    ignored: false,
    description: 'is outgoing',
  },
  trait_Overachiever: {
    name: 'trait_Overachiever',
    ignored: false,
    description: 'is an Overachiever',
  },
  trait_PaMatriarch: {
    name: 'trait_PaMatriarch',
    ignored: true,
  },
  trait_Paparazzi: {
    name: 'trait_Paparazzi',
    description: 'is a paparazzi',
  },
  trait_Paranoid: {
    name: 'trait_Paranoid',
    ignored: false,
    description: 'is paranoid',
  },
  trait_ParentingSkill_UnderstandBaby: {
    name: 'trait_ParentingSkill_UnderstandBaby',
    ignored: true,
  },
  trait_PartyAnimal: {
    name: 'trait_PartyAnimal',
    ignored: false,
    description: 'is a party animal',
  },
  trait_PerfectHost: {
    name: 'trait_PerfectHost',
    ignored: false,
    description: 'is great at hosting events',
  },
  trait_Perfectionist: {
    name: 'trait_Perfectionist',
    ignored: false,
    description: 'is a perfectionist',
  },
  trait_Perk_FeudTarget: {
    name: 'trait_Perk_FeudTarget',
    ignored: true,
  },
  trait_Pet_Active_Cat: {
    name: 'trait_Pet_Active_Cat',
    ignored: false,
    description: 'is active',
  },
  trait_Pet_Active_Dog: {
    name: 'trait_Pet_Active_Dog',
    ignored: false,
    description: 'is active',
  },
  trait_Pet_age_Adult: {
    name: 'trait_Pet_age_Adult',
    description: 'is an adult pet',
  },
  trait_Pet_age_Child: {
    name: 'trait_Pet_age_Child',
    description: 'is a baby pet',
  },
  trait_Pet_age_Elder: {
    name: 'trait_Pet_age_Elder',
    description: 'is an old pet',
  },
  trait_Pet_Aggressive_Cat: {
    name: 'trait_Pet_Aggressive_Cat',
    ignored: false,
    description: 'is an aggressive cat',
  },
  trait_Pet_Aggressive_Dog: {
    name: 'trait_Pet_Aggressive_Dog',
    ignored: false,
    description: 'is an aggressive dog',
  },
  trait_Pet_Curious_Cat: {
    name: 'trait_Pet_Curious_Cat',
    ignored: false,
    description: 'is a curious cat',
  },
  trait_Pet_Curious_Dog: {
    name: 'trait_Pet_Curious_Dog',
    ignored: false,
    description: 'is a curious dog',
  },
  trait_Pet_Friendly_Cat: {
    name: 'trait_Pet_Friendly_Cat',
    ignored: false,
    description: 'is a friendly cat',
  },
  trait_Pet_Friendly_Dog: {
    name: 'trait_Pet_Friendly_Dog',
    ignored: false,
    description: 'is a friendly dog',
  },
  trait_Pet_Glutton_Cat: {
    name: 'trait_Pet_Glutton_Cat',
    ignored: false,
    description: 'is a gluttonous cat',
  },
  trait_Pet_Glutton_Dog: {
    name: 'trait_Pet_Glutton_Dog',
    ignored: false,
    description: 'is a gluttonous dog',
  },
  trait_Pet_Hairy_Cat: {
    name: 'trait_Pet_Hairy_Cat',
    ignored: false,
    description: 'is very hairy',
  },
  trait_Pet_Hairy_Dog: {
    name: 'trait_Pet_Hairy_Dog',
    ignored: false,
    description: 'is very hairy',
  },
  trait_Pet_Hunter_Cat: {
    name: 'trait_Pet_Hunter_Cat',
    ignored: false,
    description: 'is a skilled Hunter',
  },
  trait_Pet_Hunter_Dog: {
    name: 'trait_Pet_Hunter_Dog',
    ignored: false,
    description: 'is a skilled Hunter',
  },
  trait_Pet_Independent_Cat: {
    name: 'trait_Pet_Independent_Cat',
    ignored: false,
    description: 'is independent',
  },
  trait_Pet_Independent_Dog: {
    name: 'trait_Pet_Independent_Dog',
    ignored: false,
    description: 'is independent',
  },
  trait_Pet_InsideOnly: {
    name: 'trait_Pet_InsideOnly',
    description: 'likes to be inside only',
  },
  trait_Pet_Lazy_Cat: {
    name: 'trait_Pet_Lazy_Cat',
    ignored: false,
    description: 'is a lazy cat',
  },
  trait_Pet_Lazy_Dog: {
    name: 'trait_Pet_Lazy_Dog',
    ignored: false,
    description: 'is a lazy dog',
  },
  trait_Pet_Loyal_Cat: {
    name: 'trait_Pet_Loyal_Cat',
    ignored: false,
    description: 'is loyal',
  },
  trait_Pet_Loyal_Dog: {
    name: 'trait_Pet_Loyal_Dog',
    ignored: false,
    description: 'is loyal',
  },
  trait_Pet_Missing_Pet: {
    name: 'trait_Pet_Missing_Pet',
    ignored: true,
  },
  trait_Pet_Naughty_Cat: {
    name: 'trait_Pet_Naughty_Cat',
    ignored: false,
    description: 'is a naughty cat',
  },
  trait_Pet_Naughty_Dog: {
    name: 'trait_Pet_Naughty_Dog',
    ignored: false,
    description: 'is a naughty dog',
  },
  trait_Pet_OutsideOnly: {
    name: 'trait_Pet_OutsideOnly',
    description: 'is an outside only pet',
  },
  trait_Pet_Playful_Cat: {
    name: 'trait_Pet_Playful_Cat',
    ignored: false,
    description: 'is a playful cat',
  },
  trait_Pet_Playful_Dog: {
    name: 'trait_Pet_Playful_Dog',
    ignored: false,
    description: 'is a playful dog',
  },
  trait_Pet_Skittish_Cat: {
    name: 'trait_Pet_Skittish_Cat',
    ignored: false,
    description: 'is a skittish cat',
  },
  trait_Pet_Skittish_Dog: {
    name: 'trait_Pet_Skittish_Dog',
    ignored: false,
    description: 'is a skittish dog',
  },
  trait_Pet_Smart_Cat: {
    name: 'trait_Pet_Smart_Cat',
    ignored: false,
    description: 'is a smart cat',
  },
  trait_Pet_Smart_Dog: {
    name: 'trait_Pet_Smart_Dog',
    ignored: false,
    description: 'is a smart dog',
  },
  trait_Pet_Stubborn_Cat: {
    name: 'trait_Pet_Stubborn_Cat',
    ignored: false,
    description: 'is a stubborn cat',
  },
  trait_Pet_Stubborn_Dog: {
    name: 'trait_Pet_Stubborn_Dog',
    ignored: false,
    description: 'is a stubborn dog',
  },
  trait_Pet_Vocal_Cat: {
    name: 'trait_Pet_Vocal_Cat',
    ignored: false,
    description: 'is a vocal cat',
  },
  trait_Pet_Vocal_Dog: {
    name: 'trait_Pet_Vocal_Dog',
    ignored: false,
    description: 'is a vocal dog',
  },
  trait_Pet_Wanderlust_Cat: {
    name: 'trait_Pet_Wanderlust_Cat',
    ignored: false,
    description: 'loves to wander',
  },
  trait_Pet_Wanderlust_Dog: {
    name: 'trait_Pet_Wanderlust_Dog',
    ignored: false,
    description: 'loves to wander',
  },
  trait_PetParent_Adventure: {
    name: 'trait_PetParent_Adventure',
    ignored: true,
  },
  trait_PetQuirk_Fear_CoffeeMaker: {
    name: 'trait_PetQuirk_Fear_CoffeeMaker',
    ignored: true,
  },
  trait_PetQuirk_Fear_Computer: {
    name: 'trait_PetQuirk_Fear_Computer',
    ignored: true,
  },
  trait_PetQuirk_Fear_Dishwasher: {
    name: 'trait_PetQuirk_Fear_Dishwasher',
    ignored: true,
  },
  trait_PetQuirk_Fear_DoorBell: {
    name: 'trait_PetQuirk_Fear_DoorBell',
    ignored: true,
  },
  trait_PetQuirk_Fear_Fire: {
    name: 'trait_PetQuirk_Fear_Fire',
    ignored: true,
  },
  trait_PetQuirk_Fear_FitnessEquipment: {
    name: 'trait_PetQuirk_Fear_FitnessEquipment',
    ignored: true,
  },
  trait_PetQuirk_Fear_Gaming: {
    name: 'trait_PetQuirk_Fear_Gaming',
    ignored: true,
  },
  trait_PetQuirk_Fear_Instrument: {
    name: 'trait_PetQuirk_Fear_Instrument',
    ignored: true,
  },
  trait_PetQuirk_Fear_Microwave: {
    name: 'trait_PetQuirk_Fear_Microwave',
    ignored: true,
  },
  trait_PetQuirk_Fear_RobotVacuum: {
    name: 'trait_PetQuirk_Fear_RobotVacuum',
    ignored: true,
  },
  trait_PetQuirk_Fear_Shower: {
    name: 'trait_PetQuirk_Fear_Shower',
    ignored: true,
  },
  trait_PetQuirk_Fear_Stereo: {
    name: 'trait_PetQuirk_Fear_Stereo',
    ignored: true,
  },
  trait_PetQuirk_Fear_Stove: {
    name: 'trait_PetQuirk_Fear_Stove',
    ignored: true,
  },
  trait_PetQuirk_Fear_Swiming: {
    name: 'trait_PetQuirk_Fear_Swiming',
    ignored: true,
  },
  trait_PetQuirk_Fear_Toilet: {
    name: 'trait_PetQuirk_Fear_Toilet',
    ignored: true,
  },
  trait_PetQuirk_Fear_TV: {
    name: 'trait_PetQuirk_Fear_TV',
    ignored: true,
  },
  trait_PetQuirk_Fear_Vacuum: {
    name: 'trait_PetQuirk_Fear_Vacuum',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_CoffeeMaker: {
    name: 'trait_PetQuirk_Obsessed_CoffeeMaker',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Computer: {
    name: 'trait_PetQuirk_Obsessed_Computer',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Cooking: {
    name: 'trait_PetQuirk_Obsessed_Cooking',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Dishwasher: {
    name: 'trait_PetQuirk_Obsessed_Dishwasher',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_DoorBell: {
    name: 'trait_PetQuirk_Obsessed_DoorBell',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Fire: {
    name: 'trait_PetQuirk_Obsessed_Fire',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_FishTanks: {
    name: 'trait_PetQuirk_Obsessed_FishTanks',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_FitnessEquipment: {
    name: 'trait_PetQuirk_Obsessed_FitnessEquipment',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Fridge: {
    name: 'trait_PetQuirk_Obsessed_Fridge',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Gaming: {
    name: 'trait_PetQuirk_Obsessed_Gaming',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Instrument: {
    name: 'trait_PetQuirk_Obsessed_Instrument',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Microwave: {
    name: 'trait_PetQuirk_Obsessed_Microwave',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Pet_Minor_Cage: {
    name: 'trait_PetQuirk_Obsessed_Pet_Minor_Cage',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_RobotVacuum: {
    name: 'trait_PetQuirk_Obsessed_RobotVacuum',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Shower: {
    name: 'trait_PetQuirk_Obsessed_Shower',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Stereo: {
    name: 'trait_PetQuirk_Obsessed_Stereo',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Swimming: {
    name: 'trait_PetQuirk_Obsessed_Swimming',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Toilet: {
    name: 'trait_PetQuirk_Obsessed_Toilet',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_TV: {
    name: 'trait_PetQuirk_Obsessed_TV',
    ignored: true,
  },
  trait_PetQuirk_Obsessed_Vacuum: {
    name: 'trait_PetQuirk_Obsessed_Vacuum',
    ignored: true,
  },
  trait_PetQuirk_PetBedSpin: {
    name: 'trait_PetQuirk_PetBedSpin',
    ignored: true,
  },
  trait_PetQuirk_PregnancyVomiting_No: {
    name: 'trait_PetQuirk_PregnancyVomiting_No',
    ignored: true,
  },
  trait_PetQuirk_PregnancyVomiting_Yes: {
    name: 'trait_PetQuirk_PregnancyVomiting_Yes',
    ignored: true,
  },
  trait_Pets_Adventure_A: {
    name: 'trait_Pets_Adventure_A',
    ignored: true,
  },
  trait_Pets_Adventure_AA_Unseen: {
    name: 'trait_Pets_Adventure_AA_Unseen',
    ignored: true,
  },
  trait_Pets_Adventure_AB_Unseen: {
    name: 'trait_Pets_Adventure_AB_Unseen',
    ignored: true,
  },
  trait_Pets_Adventure_AC_Unseen: {
    name: 'trait_Pets_Adventure_AC_Unseen',
    ignored: true,
  },
  trait_Pets_Adventure_B: {
    name: 'trait_Pets_Adventure_B',
    ignored: true,
  },
  trait_Pets_Adventure_C: {
    name: 'trait_Pets_Adventure_C',
    ignored: true,
  },
  trait_Pets_Adventure_CA: {
    name: 'trait_Pets_Adventure_CA',
    ignored: true,
  },
  trait_Pets_Adventure_CB: {
    name: 'trait_Pets_Adventure_CB',
    ignored: true,
  },
  trait_Pets_Adventure_CC: {
    name: 'trait_Pets_Adventure_CC',
    ignored: true,
  },
  trait_Pets_Adventure_LighthouseDog: {
    name: 'trait_Pets_Adventure_LighthouseDog',
    ignored: true,
  },
  trait_Pets_Adventure_XA: {
    name: 'trait_Pets_Adventure_XA',
    ignored: true,
  },
  trait_Pets_Adventure_XB: {
    name: 'trait_Pets_Adventure_XB',
    ignored: true,
  },
  trait_Pets_Adventure_XC: {
    name: 'trait_Pets_Adventure_XC',
    ignored: true,
  },
  trait_Pets_TrainingCommand_Fetch: {
    name: 'trait_Pets_TrainingCommand_Fetch',
    ignored: true,
  },
  trait_Pets_TrainingCommand_Heel: {
    name: 'trait_Pets_TrainingCommand_Heel',
    ignored: true,
  },
  trait_Pets_TrainingCommand_LieDown: {
    name: 'trait_Pets_TrainingCommand_LieDown',
    ignored: true,
  },
  trait_Pets_TrainingCommand_PlayDead: {
    name: 'trait_Pets_TrainingCommand_PlayDead',
    ignored: true,
  },
  trait_Pets_TrainingCommand_RollOver: {
    name: 'trait_Pets_TrainingCommand_RollOver',
    ignored: true,
  },
  trait_Pets_TrainingCommand_Shake: {
    name: 'trait_Pets_TrainingCommand_Shake',
    ignored: true,
  },
  trait_Pets_TrainingCommand_Sit: {
    name: 'trait_Pets_TrainingCommand_Sit',
    ignored: true,
  },
  trait_Pets_TrainingCommand_Speak: {
    name: 'trait_Pets_TrainingCommand_Speak',
    ignored: true,
  },
  trait_Phone_Black: {
    name: 'trait_Phone_Black',
    ignored: true,
  },
  trait_Phone_BlackStripes: {
    name: 'trait_Phone_BlackStripes',
    ignored: true,
  },
  trait_Phone_BluePolka: {
    name: 'trait_Phone_BluePolka',
    ignored: true,
  },
  trait_Phone_Brown: {
    name: 'trait_Phone_Brown',
    ignored: true,
  },
  trait_Phone_Color_astroBlack: {
    name: 'trait_Phone_Color_astroBlack',
    ignored: true,
  },
  trait_Phone_Color_astroGray: {
    name: 'trait_Phone_Color_astroGray',
    ignored: true,
  },
  trait_Phone_Color_astroMaroon: {
    name: 'trait_Phone_Color_astroMaroon',
    ignored: true,
  },
  trait_Phone_Color_astroPeach: {
    name: 'trait_Phone_Color_astroPeach',
    ignored: true,
  },
  trait_Phone_Color_astroPink: {
    name: 'trait_Phone_Color_astroPink',
    ignored: true,
  },
  trait_Phone_Color_astroPurple: {
    name: 'trait_Phone_Color_astroPurple',
    ignored: true,
  },
  trait_Phone_Color_cassetteBlack: {
    name: 'trait_Phone_Color_cassetteBlack',
    ignored: true,
  },
  trait_Phone_Color_cassetteBlue: {
    name: 'trait_Phone_Color_cassetteBlue',
    ignored: true,
  },
  trait_Phone_Color_cassetteGreen: {
    name: 'trait_Phone_Color_cassetteGreen',
    ignored: true,
  },
  trait_Phone_Color_cassetteOrange: {
    name: 'trait_Phone_Color_cassetteOrange',
    ignored: true,
  },
  trait_Phone_Color_cassettePink: {
    name: 'trait_Phone_Color_cassettePink',
    ignored: true,
  },
  trait_Phone_Color_cassetteRed: {
    name: 'trait_Phone_Color_cassetteRed',
    ignored: true,
  },
  trait_Phone_Color_duoBabyBlue: {
    name: 'trait_Phone_Color_duoBabyBlue',
    ignored: true,
  },
  trait_Phone_Color_duoBlack: {
    name: 'trait_Phone_Color_duoBlack',
    ignored: true,
  },
  trait_Phone_Color_duoGreen: {
    name: 'trait_Phone_Color_duoGreen',
    ignored: true,
  },
  trait_Phone_Color_duoLavender: {
    name: 'trait_Phone_Color_duoLavender',
    ignored: true,
  },
  trait_Phone_Color_duoSlate: {
    name: 'trait_Phone_Color_duoSlate',
    ignored: true,
  },
  trait_Phone_Color_duoUmber: {
    name: 'trait_Phone_Color_duoUmber',
    ignored: true,
  },
  trait_Phone_Color_floralGreenBlue: {
    name: 'trait_Phone_Color_floralGreenBlue',
    ignored: true,
  },
  trait_Phone_Color_floralMauve: {
    name: 'trait_Phone_Color_floralMauve',
    ignored: true,
  },
  trait_Phone_Color_floralPeach: {
    name: 'trait_Phone_Color_floralPeach',
    ignored: true,
  },
  trait_Phone_Color_floralPink: {
    name: 'trait_Phone_Color_floralPink',
    ignored: true,
  },
  trait_Phone_Color_floralSlate: {
    name: 'trait_Phone_Color_floralSlate',
    ignored: true,
  },
  trait_Phone_Color_floralYellow: {
    name: 'trait_Phone_Color_floralYellow',
    ignored: true,
  },
  trait_Phone_Color_geoBlue: {
    name: 'trait_Phone_Color_geoBlue',
    ignored: true,
  },
  trait_Phone_Color_geoBrown: {
    name: 'trait_Phone_Color_geoBrown',
    ignored: true,
  },
  trait_Phone_Color_geoGold: {
    name: 'trait_Phone_Color_geoGold',
    ignored: true,
  },
  trait_Phone_Color_geoGreen: {
    name: 'trait_Phone_Color_geoGreen',
    ignored: true,
  },
  trait_Phone_Color_geoRed: {
    name: 'trait_Phone_Color_geoRed',
    ignored: true,
  },
  trait_Phone_Color_geoSilver: {
    name: 'trait_Phone_Color_geoSilver',
    ignored: true,
  },
  trait_Phone_Color_paintBlack: {
    name: 'trait_Phone_Color_paintBlack',
    ignored: true,
  },
  trait_Phone_Color_paintBlue: {
    name: 'trait_Phone_Color_paintBlue',
    ignored: true,
  },
  trait_Phone_Color_paintCanary: {
    name: 'trait_Phone_Color_paintCanary',
    ignored: true,
  },
  trait_Phone_Color_paintGreen: {
    name: 'trait_Phone_Color_paintGreen',
    ignored: true,
  },
  trait_Phone_Color_paintTeal: {
    name: 'trait_Phone_Color_paintTeal',
    ignored: true,
  },
  trait_Phone_Color_paintWhite: {
    name: 'trait_Phone_Color_paintWhite',
    ignored: true,
  },
  trait_Phone_Color_roseBlack: {
    name: 'trait_Phone_Color_roseBlack',
    ignored: true,
  },
  trait_Phone_Color_roseBlue: {
    name: 'trait_Phone_Color_roseBlue',
    ignored: true,
  },
  trait_Phone_Color_roseGreen: {
    name: 'trait_Phone_Color_roseGreen',
    ignored: true,
  },
  trait_Phone_Color_roseLavender: {
    name: 'trait_Phone_Color_roseLavender',
    ignored: true,
  },
  trait_Phone_Color_roseMetalGold: {
    name: 'trait_Phone_Color_roseMetalGold',
    ignored: true,
  },
  trait_Phone_Color_roseWhite: {
    name: 'trait_Phone_Color_roseWhite',
    ignored: true,
  },
  trait_Phone_Color_swirlBlue: {
    name: 'trait_Phone_Color_swirlBlue',
    ignored: true,
  },
  trait_Phone_Color_swirlGray: {
    name: 'trait_Phone_Color_swirlGray',
    ignored: true,
  },
  trait_Phone_Color_swirlGreen: {
    name: 'trait_Phone_Color_swirlGreen',
    ignored: true,
  },
  trait_Phone_Color_swirlOrange: {
    name: 'trait_Phone_Color_swirlOrange',
    ignored: true,
  },
  trait_Phone_Color_swirlPink: {
    name: 'trait_Phone_Color_swirlPink',
    ignored: true,
  },
  trait_Phone_Color_swirlPurple: {
    name: 'trait_Phone_Color_swirlPurple',
    ignored: true,
  },
  trait_Phone_DarkBlue: {
    name: 'trait_Phone_DarkBlue',
    ignored: true,
  },
  trait_Phone_DarkGreen: {
    name: 'trait_Phone_DarkGreen',
    ignored: true,
  },
  trait_Phone_Gold: {
    name: 'trait_Phone_Gold',
    ignored: true,
  },
  trait_Phone_HotPinkPolka: {
    name: 'trait_Phone_HotPinkPolka',
    ignored: true,
  },
  trait_Phone_LightPink: {
    name: 'trait_Phone_LightPink',
    ignored: true,
  },
  trait_Phone_Lime: {
    name: 'trait_Phone_Lime',
    ignored: true,
  },
  trait_Phone_MintGreenStripes: {
    name: 'trait_Phone_MintGreenStripes',
    ignored: true,
  },
  trait_Phone_OrangePolka: {
    name: 'trait_Phone_OrangePolka',
    ignored: true,
  },
  trait_Phone_Purple: {
    name: 'trait_Phone_Purple',
    ignored: true,
  },
  trait_Phone_Red: {
    name: 'trait_Phone_Red',
    ignored: true,
  },
  trait_Phone_RoseGold: {
    name: 'trait_Phone_RoseGold',
    ignored: true,
  },
  trait_Phone_Silver: {
    name: 'trait_Phone_Silver',
    ignored: true,
  },
  trait_Phone_TurquoiseStripes: {
    name: 'trait_Phone_TurquoiseStripes',
    ignored: true,
  },
  trait_Phone_White: {
    name: 'trait_Phone_White',
    ignored: true,
  },
  trait_PhysicallyGifted: {
    name: 'trait_PhysicallyGifted',
    description: 'is physically gifted',
  },
  trait_Piper: {
    name: 'trait_Piper',
    ignored: false,
    description: 'is a masterful Piper',
  },
  trait_PlantSim: {
    name: 'trait_PlantSim',
    description: 'is a plant',
  },
  trait_PlantSimChallenge_RecievedStump: {
    name: 'trait_PlantSimChallenge_RecievedStump',
    ignored: true,
  },
  trait_Player: {
    name: 'trait_Player',
    ignored: false,
    description: 'is a romantic player',
  },
  trait_PotionMaster: {
    name: 'trait_PotionMaster',
    ignored: false,
    description: 'is a Potion Master',
  },
  trait_PracticeMakesPerfect: {
    name: 'trait_PracticeMakesPerfect',
    description: 'is a quick learner',
  },
  trait_PracticeMakesPerfect_BuffTrait_Creative_Tier0: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Creative_Tier0',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Creative_Tier1: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Creative_Tier1',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Creative_Tier2: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Creative_Tier2',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Creative_Tier3: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Creative_Tier3',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Creative_Tier4: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Creative_Tier4',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Mental_Tier0: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Mental_Tier0',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Mental_Tier1: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Mental_Tier1',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Mental_Tier2: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Mental_Tier2',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Mental_Tier3: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Mental_Tier3',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Mental_Tier4: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Mental_Tier4',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Physical_Tier0: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Physical_Tier0',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Physical_Tier1: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Physical_Tier1',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Physical_Tier2: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Physical_Tier2',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Physical_Tier3: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Physical_Tier3',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Physical_Tier4: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Physical_Tier4',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Social_Tier0: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Social_Tier0',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Social_Tier1: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Social_Tier1',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Social_Tier2: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Social_Tier2',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Social_Tier3: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Social_Tier3',
    ignored: true,
  },
  trait_PracticeMakesPerfect_BuffTrait_Social_Tier4: {
    name: 'trait_PracticeMakesPerfect_BuffTrait_Social_Tier4',
    ignored: true,
  },
  trait_PracticeMakesPerfect_Tracking_Creative: {
    name: 'trait_PracticeMakesPerfect_Tracking_Creative',
    ignored: true,
  },
  trait_PracticeMakesPerfect_Tracking_Mental: {
    name: 'trait_PracticeMakesPerfect_Tracking_Mental',
    ignored: true,
  },
  trait_PracticeMakesPerfect_Tracking_Physical: {
    name: 'trait_PracticeMakesPerfect_Tracking_Physical',
    ignored: true,
  },
  trait_PracticeMakesPerfect_Tracking_Social: {
    name: 'trait_PracticeMakesPerfect_Tracking_Social',
    ignored: true,
  },
  trait_PregnancyOptions_Pet_canNotReproduce: {
    name: 'trait_PregnancyOptions_Pet_canNotReproduce',
    ignored: true,
    description: 'cannot reproduce',
  },
  trait_PregnancyOptions_Pet_CanReproduce: {
    name: 'trait_PregnancyOptions_Pet_CanReproduce',
    ignored: true,
    description: 'can reproduce',
  },
  trait_PreparedVoyager: {
    name: 'trait_PreparedVoyager',
    ignored: true,
    description: 'is a Prepared Voyager',
  },
  trait_ProfessionalSlacker: {
    name: 'trait_ProfessionalSlacker',
    ignored: false,
    description:
      'is a professional slacker and has no fear of being demoted or fired',
  },
  trait_Proper: {
    name: 'trait_Proper',
    ignored: false,
    description: 'is prim and proper and snooty',
  },
  trait_Quick_Learner: {
    name: 'trait_Quick_Learner',
    ignored: false,
    description: 'is a quick learner',
  },
  trait_Rancher: {
    name: 'trait_Rancher',
    ignored: false,
    description: 'is a rancher',
  },
  trait_Reaper_dummy: {
    name: 'trait_Reaper_dummy',
    ignored: true,
  },
  trait_ReaperCareer_DeathReward: {
    name: 'trait_ReaperCareer_DeathReward',
    ignored: true,
  },
  trait_RecycleDisciple: {
    name: 'trait_RecycleDisciple',
    ignored: false,
    description: 'loves to recycle',
  },
  trait_RegainedHumanity: {
    name: 'trait_RegainedHumanity',
    ignored: false,
    description: 'is no longer a vampire and is now a human',
  },
  trait_Relatable: {
    name: 'trait_Relatable',
    ignored: false,
    description: 'is relatable',
  },
  trait_RelExpectations_EmotionalExclusivity_No: {
    name: 'trait_RelExpectations_EmotionalExclusivity_No',
    description:
      'will not be jealous if their partner engages in non-physical romance',
  },
  trait_RelExpectations_EmotionalExclusivity_Yes: {
    name: 'trait_RelExpectations_EmotionalExclusivity_Yes',
    description:
      'will become jealous if their partner has non-physical romance with someone else',
  },
  trait_RelExpectations_OpenToChange_No: {
    name: 'trait_RelExpectations_OpenToChange_No',
    description:
      'is firm on their romantic boundaries and does not want to explore them',
  },
  trait_RelExpectations_OpenToChange_Yes: {
    name: 'trait_RelExpectations_OpenToChange_Yes',
    description: 'is open to reconsidering their romantic boundaries',
  },
  trait_RelExpectations_PhysicalExclusivity_No: {
    name: 'trait_RelExpectations_PhysicalExclusivity_No',
    description:
      'will not be jealous if their partner engages in physical romance',
  },
  trait_RelExpectations_PhysicalExclusivity_Yes: {
    name: 'trait_RelExpectations_PhysicalExclusivity_Yes',
    description: 'will be jealous if their partner engages in physical romance',
  },
  trait_RelExpectations_WoohooExclusivity_No: {
    name: 'trait_RelExpectations_WoohooExclusivity_No',
    description: 'will not be jealous if their partner has sex with others',
  },
  trait_RelExpectations_WoohooExclusivity_Yes: {
    name: 'trait_RelExpectations_WoohooExclusivity_Yes',
    description: 'will be jealous if their partner has sex with others',
  },
  trait_Reputation_HasBeen_Rank_1_Terrible: {
    name: 'trait_Reputation_HasBeen_Rank_1_Terrible',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_2_ReallyBad: {
    name: 'trait_Reputation_HasBeen_Rank_2_ReallyBad',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_3_Bad: {
    name: 'trait_Reputation_HasBeen_Rank_3_Bad',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_4_Neutral: {
    name: 'trait_Reputation_HasBeen_Rank_4_Neutral',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_5_Good: {
    name: 'trait_Reputation_HasBeen_Rank_5_Good',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_6_ReallyGood: {
    name: 'trait_Reputation_HasBeen_Rank_6_ReallyGood',
    ignored: true,
  },
  trait_Reputation_HasBeen_Rank_7_Pristine: {
    name: 'trait_Reputation_HasBeen_Rank_7_Pristine',
    ignored: true,
  },
  trait_Reputation_Rank_1_Terrible: {
    name: 'trait_Reputation_Rank_1_Terrible',
    ignored: true,
  },
  trait_Reputation_Rank_2_ReallyBad: {
    name: 'trait_Reputation_Rank_2_ReallyBad',
    ignored: true,
  },
  trait_Reputation_Rank_3_Bad: {
    name: 'trait_Reputation_Rank_3_Bad',
    ignored: true,
  },
  trait_Reputation_Rank_4_Neutral: {
    name: 'trait_Reputation_Rank_4_Neutral',
    ignored: true,
  },
  trait_Reputation_Rank_5_Good: {
    name: 'trait_Reputation_Rank_5_Good',
    ignored: true,
  },
  trait_Reputation_Rank_6_ReallyGood: {
    name: 'trait_Reputation_Rank_6_ReallyGood',
    ignored: true,
  },
  trait_Reputation_Rank_7_Pristine: {
    name: 'trait_Reputation_Rank_7_Pristine',
    ignored: true,
  },
  trait_reward_Child_Confidence_HighSelfEsteem: {
    name: 'trait_reward_Child_Confidence_HighSelfEsteem',
    ignored: false,
    description: 'has high self-esteem',
  },
  trait_reward_Child_Confidence_LowSelfEsteem: {
    name: 'trait_reward_Child_Confidence_LowSelfEsteem',
    ignored: false,
    description: 'has low self-esteem',
  },
  trait_Reward_HSTeam_CheerTeam: {
    name: 'trait_Reward_HSTeam_CheerTeam',
    ignored: false,
    description: 'is on the cheer team',
  },
  trait_Reward_HSTeam_ChessTeam: {
    name: 'trait_Reward_HSTeam_ChessTeam',
    ignored: false,
    description: 'is on the chess team',
  },
  trait_Reward_HSTeam_ComputerTeam: {
    name: 'trait_Reward_HSTeam_ComputerTeam',
    ignored: false,
    description: 'is on the computer team',
  },
  trait_Reward_HSTeam_FootballTeam: {
    name: 'trait_Reward_HSTeam_FootballTeam',
    ignored: false,
    description: 'is on the football team',
  },
  trait_Reward_Infant_Happy: {
    name: 'trait_Reward_Infant_Happy',
    ignored: true,
  },
  trait_Reward_Infant_TopNotch: {
    name: 'trait_Reward_Infant_TopNotch',
    ignored: true,
  },
  trait_Reward_Infant_Unhappy: {
    name: 'trait_Reward_Infant_Unhappy',
    ignored: true,
  },
  trait_Rider_Gameplay_Mounted_ReinsDown: {
    name: 'trait_Rider_Gameplay_Mounted_ReinsDown',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_BeigeWhite: {
    name: 'trait_RoboticsArm_Wearing_BeigeWhite',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_BlackBlue: {
    name: 'trait_RoboticsArm_Wearing_BlackBlue',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_BlueRed: {
    name: 'trait_RoboticsArm_Wearing_BlueRed',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_GrayBrown: {
    name: 'trait_RoboticsArm_Wearing_GrayBrown',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_GreenBrown: {
    name: 'trait_RoboticsArm_Wearing_GreenBrown',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_RedGreen: {
    name: 'trait_RoboticsArm_Wearing_RedGreen',
    ignored: true,
  },
  trait_RoboticsArm_Wearing_WhiteCopper: {
    name: 'trait_RoboticsArm_Wearing_WhiteCopper',
    ignored: true,
  },
  Trait_Romantic: {
    name: 'Trait_Romantic',
    ignored: false,
    description: 'is romantic',
  },
  trait_RomanticallyReserved: {
    name: 'trait_RomanticallyReserved',
    description: 'is romantically reserved',
  },
  trait_RomanticSage: {
    name: 'trait_RomanticSage',
    description: 'are thoughtful and optimistic about romantic relationships',
  },
  trait_RoommateNPC_Archetype_Breaker: {
    name: 'trait_RoommateNPC_Archetype_Breaker',
    ignored: true,
  },
  trait_RoommateNPC_Archetype_Cheerleader: {
    name: 'trait_RoommateNPC_Archetype_Cheerleader',
    description: 'is a cheerleader',
  },
  trait_RoommateNPC_Archetype_ClingySocialite: {
    name: 'trait_RoommateNPC_Archetype_ClingySocialite',
    description: 'is a clingy socialite',
  },
  trait_RoommateNPC_Archetype_CouchPotato: {
    name: 'trait_RoommateNPC_Archetype_CouchPotato',
    description: 'is a couch potato',
  },
  trait_RoommateNPC_Archetype_EmoLoner: {
    name: 'trait_RoommateNPC_Archetype_EmoLoner',
    description: 'is an emo loner',
  },
  trait_RoommateNPC_Archetype_Fixer: {
    name: 'trait_RoommateNPC_Archetype_Fixer',
    description: 'is a fixer',
  },
  trait_RoommateNPC_Archetype_LoudMusic: {
    name: 'trait_RoommateNPC_Archetype_LoudMusic',
    description: 'likes to play loud music',
  },
  trait_RoommateNPC_Archetype_Mealmaker: {
    name: 'trait_RoommateNPC_Archetype_Mealmaker',
    description: 'likes to make meals',
  },
  trait_RoommateNPC_Archetype_PartyPlanner: {
    name: 'trait_RoommateNPC_Archetype_PartyPlanner',
    description: 'is a party planner',
  },
  trait_RoommateNPC_Archetype_SuperNeat: {
    name: 'trait_RoommateNPC_Archetype_SuperNeat',
    description: 'is super neat and clean',
  },
  trait_RoommateNPC_Interest_Art: {
    name: 'trait_RoommateNPC_Interest_Art',
    description: 'is interested in art',
  },
  trait_RoommateNPC_Interest_Baking: {
    name: 'trait_RoommateNPC_Interest_Baking',
    description: 'is interested in baking',
  },
  trait_RoommateNPC_Interest_Computers: {
    name: 'trait_RoommateNPC_Interest_Computers',
    description: 'is interested in computers',
  },
  trait_RoommateNPC_Interest_Fitness: {
    name: 'trait_RoommateNPC_Interest_Fitness',
    description: 'is interested in fitness',
  },
  trait_RoommateNPC_Interest_Music: {
    name: 'trait_RoommateNPC_Interest_Music',
    description: 'is interested in music',
  },
  trait_RoommateNPC_Quirk_Absent: {
    name: 'trait_RoommateNPC_Quirk_Absent',
    description: 'is always absent',
  },
  trait_RoommateNPC_Quirk_BathroomHog: {
    name: 'trait_RoommateNPC_Quirk_BathroomHog',
    description: 'always hogs the bathroom',
  },
  trait_RoommateNPC_Quirk_BigCloset: {
    name: 'trait_RoommateNPC_Quirk_BigCloset',
    description: 'has a huge closet',
  },
  trait_RoommateNPC_Quirk_LateOnRent: {
    name: 'trait_RoommateNPC_Quirk_LateOnRent',
    description: 'is always late on rent',
  },
  trait_RoommateNPC_Quirk_Prankster: {
    name: 'trait_RoommateNPC_Quirk_Prankster',
    description: 'is a prankster',
  },
  trait_RoommateNPC_Quirk_PublicAffectionDisplayer: {
    name: 'trait_RoommateNPC_Quirk_PublicAffectionDisplayer',
    description: 'always is making public displays of affection',
  },
  trait_RoommateNPC_Standard: {
    name: 'trait_RoommateNPC_Standard',
    description: 'is a roommate',
  },
  trait_SacredKnittingKnowledge: {
    name: 'trait_SacredKnittingKnowledge',
    ignored: false,
    description: 'possesses sacred knitting knowledge',
  },
  trait_Savant: {
    name: 'trait_Savant',
    ignored: false,
    description: 'is a savant',
  },
  trait_Scarecrow: {
    name: 'trait_Scarecrow',
    description: 'is a scarecrow',
  },
  trait_Scenario_AlienAdbuction_Adults: {
    name: 'trait_Scenario_AlienAdbuction_Adults',
    ignored: true,
  },
  trait_Scenario_Cookout: {
    name: 'trait_Scenario_Cookout',
    ignored: true,
  },
  trait_Scenario_ExploreTheNight: {
    name: 'trait_Scenario_ExploreTheNight',
    ignored: true,
  },
  trait_Scenario_ExploreTheNight_StayedUp: {
    name: 'trait_Scenario_ExploreTheNight_StayedUp',
    ignored: true,
  },
  trait_Scenario_Inheritance_Goal_GrandmotherGhost: {
    name: 'trait_Scenario_Inheritance_Goal_GrandmotherGhost',
    ignored: true,
  },
  trait_Scenario_Inheritance_Goal_MoneyDonated: {
    name: 'trait_Scenario_Inheritance_Goal_MoneyDonated',
    ignored: true,
  },
  trait_Scenario_Inheritance_Goal_ReadWill: {
    name: 'trait_Scenario_Inheritance_Goal_ReadWill',
    ignored: true,
  },
  trait_Scenario_Inheritance_Goal_SiblingsFriends: {
    name: 'trait_Scenario_Inheritance_Goal_SiblingsFriends',
    ignored: true,
  },
  trait_Scenario_Inheritance_Grandmother: {
    name: 'trait_Scenario_Inheritance_Grandmother',
    ignored: true,
  },
  trait_Scenario_InTheMoodlet: {
    name: 'trait_Scenario_InTheMoodlet',
    ignored: true,
  },
  trait_Scenario_NewInTown: {
    name: 'trait_Scenario_NewInTown',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P1_7a_Intro: {
    name: 'trait_Scenario_NewInTown_Hidden_P1_7a_Intro',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P1_7b_Intro: {
    name: 'trait_Scenario_NewInTown_Hidden_P1_7b_Intro',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P1_7c_Intro: {
    name: 'trait_Scenario_NewInTown_Hidden_P1_7c_Intro',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P3a_Intro: {
    name: 'trait_Scenario_NewInTown_Hidden_P3a_Intro',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P3b_Intro: {
    name: 'trait_Scenario_NewInTown_Hidden_P3b_Intro',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_P4_relgain: {
    name: 'trait_Scenario_NewInTown_Hidden_P4_relgain',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_Phase3a_NewAcquaintanceCaller_FriendGym: {
    name: 'trait_Scenario_NewInTown_Hidden_Phase3a_NewAcquaintanceCaller_FriendGym',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_Phase3b_NewAcquaintanceCaller_FriendBar: {
    name: 'trait_Scenario_NewInTown_Hidden_Phase3b_NewAcquaintanceCaller_FriendBar',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_Phase3b_NewAcquaintanceCaller_RomanceBar: {
    name: 'trait_Scenario_NewInTown_Hidden_Phase3b_NewAcquaintanceCaller_RomanceBar',
    ignored: true,
  },
  trait_Scenario_NewInTown_Hidden_woohooed: {
    name: 'trait_Scenario_NewInTown_Hidden_woohooed',
    ignored: true,
  },
  trait_Scenario_NoSkillsNoProblem: {
    name: 'trait_Scenario_NoSkillsNoProblem',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Child: {
    name: 'trait_Scenario_ParentingPredicaments_Child',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_FinalGrade_Leonardo_A: {
    name: 'trait_Scenario_ParentingPredicaments_FinalGrade_Leonardo_A',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_FinalGrade_Leonardo_F: {
    name: 'trait_Scenario_ParentingPredicaments_FinalGrade_Leonardo_F',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_FinalGrade_Sofia_A: {
    name: 'trait_Scenario_ParentingPredicaments_FinalGrade_Sofia_A',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_FinalGrade_Sofia_F: {
    name: 'trait_Scenario_ParentingPredicaments_FinalGrade_Sofia_F',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Jennifer: {
    name: 'trait_Scenario_ParentingPredicaments_Jennifer',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Leonardo: {
    name: 'trait_Scenario_ParentingPredicaments_Leonardo',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Pablo: {
    name: 'trait_Scenario_ParentingPredicaments_Pablo',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Parent: {
    name: 'trait_Scenario_ParentingPredicaments_Parent',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Principal: {
    name: 'trait_Scenario_ParentingPredicaments_Principal',
    ignored: true,
  },
  trait_Scenario_ParentingPredicaments_Sofia: {
    name: 'trait_Scenario_ParentingPredicaments_Sofia',
    ignored: true,
  },
  trait_Scenario_ProudParent: {
    name: 'trait_Scenario_ProudParent',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_Nova: {
    name: 'trait_Scenario_StuckInTheirShadow_Nova',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P1_CompletedMotives: {
    name: 'trait_Scenario_StuckInTheirShadow_P1_CompletedMotives',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P1_CompletedProgramming: {
    name: 'trait_Scenario_StuckInTheirShadow_P1_CompletedProgramming',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P2_RivalPurchases: {
    name: 'trait_Scenario_StuckInTheirShadow_P2_RivalPurchases',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_CompletedImproveWorsen: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_CompletedImproveWorsen',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_DecisionGoalActive: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_DecisionGoalActive',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_RivalArrived: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_RivalArrived',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_RivalInvited: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_RivalInvited',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_RivalKicked: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_RivalKicked',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_RivalSleepover: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_RivalSleepover',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_Start: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_Start',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P3_VoodooOwner: {
    name: 'trait_Scenario_StuckInTheirShadow_P3_VoodooOwner',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4A_AskedAboutCareer: {
    name: 'trait_Scenario_StuckInTheirShadow_P4A_AskedAboutCareer',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4A_AstronautNo: {
    name: 'trait_Scenario_StuckInTheirShadow_P4A_AstronautNo',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4A_AstronautYes: {
    name: 'trait_Scenario_StuckInTheirShadow_P4A_AstronautYes',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4B_CanQuit: {
    name: 'trait_Scenario_StuckInTheirShadow_P4B_CanQuit',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4B_IndieAccepted: {
    name: 'trait_Scenario_StuckInTheirShadow_P4B_IndieAccepted',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4B_IndieRejected: {
    name: 'trait_Scenario_StuckInTheirShadow_P4B_IndieRejected',
    ignored: true,
  },
  trait_Scenario_StuckInTheirShadow_P4B_Promoted: {
    name: 'trait_Scenario_StuckInTheirShadow_P4B_Promoted',
    ignored: true,
  },
  trait_Scenario_UnluckyChef: {
    name: 'trait_Scenario_UnluckyChef',
    ignored: true,
  },
  trait_SchoolLocker_Claimed: {
    name: 'trait_SchoolLocker_Claimed',
    ignored: true,
  },
  trait_Scientist_ExpertRepair: {
    name: 'trait_Scientist_ExpertRepair',
    ignored: true,
  },
  trait_ScoutingAptitude: {
    name: 'trait_ScoutingAptitude',
    ignored: false,
    description: 'is a good scout',
  },
  trait_ScubaGear_DiveKnife: {
    name: 'trait_ScubaGear_DiveKnife',
    ignored: true,
  },
  trait_ScubaGear_Rebreather: {
    name: 'trait_ScubaGear_Rebreather',
    ignored: true,
  },
  trait_ScubaGear_SpearfishingGun: {
    name: 'trait_ScubaGear_SpearfishingGun',
    ignored: true,
  },
  trait_ScubaGear_TreasureTool: {
    name: 'trait_ScubaGear_TreasureTool',
    ignored: true,
  },
  trait_ScubaGear_UnderwaterCamera: {
    name: 'trait_ScubaGear_UnderwaterCamera',
    ignored: true,
  },
  trait_SeasonedGamer: {
    name: 'trait_SeasonedGamer',
    ignored: false,
    description: 'is a seasoned video gamer',
  },
  trait_SeldomSleepy: {
    name: 'trait_SeldomSleepy',
    ignored: false,
    description: 'is seldom sleepy and needs less sleep',
  },
  trait_SelfAbsorbed: {
    name: 'trait_SelfAbsorbed',
    ignored: false,
    description: 'is self-absorbed',
  },
  trait_SelfAssured: {
    name: 'trait_SelfAssured',
    ignored: false,
    description: 'is self-assured',
  },
  trait_SexualOrientation_WooHooInterests_Female: {
    name: 'trait_SexualOrientation_WooHooInterests_Female',
    description: 'is sexually attracted to females',
  },
  trait_SexualOrientation_WooHooInterests_Male: {
    name: 'trait_SexualOrientation_WooHooInterests_Male',
    description: 'is sexually attracted to males',
  },
  trait_SexualOrientation_WooHooInterests_NotFemale: {
    name: 'trait_SexualOrientation_WooHooInterests_NotFemale',
    description: 'is not sexually attracted to females',
  },
  trait_SexualOrientation_WooHooInterests_NotMale: {
    name: 'trait_SexualOrientation_WooHooInterests_NotMale',
    description: 'is not sexually attracted to males',
  },
  trait_Shameless: {
    name: 'trait_Shameless',
    ignored: false,
    description: 'is shameless',
  },
  trait_SicknessImmunity: {
    name: 'trait_SicknessImmunity',
    description: 'is immune to sickness',
  },
  trait_Sim_Reputation_Host: {
    name: 'trait_Sim_Reputation_Host',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Acting: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Acting',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Baking: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Baking',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Bowling: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Bowling',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Comedy: {
    name: 'trait_SimPreference_NoOpinion_Activities_Comedy',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Cooking: {
    name: 'trait_SimPreference_NoOpinion_Activities_Cooking',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_CrossStitch: {
    name: 'Trait_SimPreference_NoOpinion_Activities_CrossStitch',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Dancing: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Dancing',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Debating: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Debating',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_DJMixing: {
    name: 'Trait_SimPreference_NoOpinion_Activities_DJMixing',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_EquestrianSkill: {
    name: 'trait_SimPreference_NoOpinion_Activities_EquestrianSkill',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Fishing: {
    name: 'trait_SimPreference_NoOpinion_Activities_Fishing',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Fitness: {
    name: 'trait_SimPreference_NoOpinion_Activities_Fitness',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Gardening: {
    name: 'trait_SimPreference_NoOpinion_Activities_Gardening',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_GemologySkill: {
    name: 'trait_SimPreference_NoOpinion_Activities_GemologySkill',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Guitar: {
    name: 'trait_SimPreference_NoOpinion_Activities_Guitar',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Handiness: {
    name: 'trait_SimPreference_NoOpinion_Activities_Handiness',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Knitting: {
    name: 'trait_SimPreference_NoOpinion_Activities_Knitting',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_MediaProduction: {
    name: 'Trait_SimPreference_NoOpinion_Activities_MediaProduction',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Mischief: {
    name: 'trait_SimPreference_NoOpinion_Activities_Mischief',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Mixology: {
    name: 'trait_SimPreference_NoOpinion_Activities_Mixology',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_NectarMaking: {
    name: 'trait_SimPreference_NoOpinion_Activities_NectarMaking',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Painting: {
    name: 'trait_SimPreference_NoOpinion_Activities_Painting',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Photography: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Photography',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Piano: {
    name: 'trait_SimPreference_NoOpinion_Activities_Piano',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_PipeOrgan: {
    name: 'Trait_SimPreference_NoOpinion_Activities_PipeOrgan',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Programming: {
    name: 'trait_SimPreference_NoOpinion_Activities_Programming',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Robotics: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Robotics',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_RockClimbing: {
    name: 'Trait_SimPreference_NoOpinion_Activities_RockClimbing',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_RocketScience: {
    name: 'trait_SimPreference_NoOpinion_Activities_RocketScience',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Singing: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Singing',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Skiing: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Skiing',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_Activities_Snowboarding: {
    name: 'Trait_SimPreference_NoOpinion_Activities_Snowboarding',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_VideoGaming: {
    name: 'trait_SimPreference_NoOpinion_Activities_VideoGaming',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Violin: {
    name: 'trait_SimPreference_NoOpinion_Activities_Violin',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Wellness: {
    name: 'trait_SimPreference_NoOpinion_Activities_Wellness',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Activities_Writing: {
    name: 'trait_SimPreference_NoOpinion_Activities_Writing',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Ambitionless: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Ambitionless',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Argumentative: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Argumentative',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Cerebral: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Cerebral',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Egotistical: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Egotistical',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_EmotionalDecisionMaker: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_EmotionalDecisionMaker',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Funny: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Funny',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_HardWorker: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_HardWorker',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_HighEnergy: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_HighEnergy',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Homebody: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Homebody',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Idealist: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Idealist',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_KidEnthusiast: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_KidEnthusiast',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Mischievous: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Mischievous',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_NatureEnthusiast: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_NatureEnthusiast',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Optimist: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Optimist',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Pessimist: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Pessimist',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_PetEnthusiast: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_PetEnthusiast',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_RomanceEnthusiast: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_RomanceEnthusiast',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Characteristic_Spirited: {
    name: 'trait_SimPreference_NoOpinion_Characteristic_Spirited',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Affection: {
    name: 'trait_SimPreference_NoOpinion_Communication_Affection',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Arguments: {
    name: 'trait_SimPreference_NoOpinion_Communication_Arguments',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Complaints: {
    name: 'trait_SimPreference_NoOpinion_Communication_Complaints',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Compliments: {
    name: 'trait_SimPreference_NoOpinion_Communication_Compliments',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Deception: {
    name: 'trait_SimPreference_NoOpinion_Communication_Deception',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_DeepThoughts: {
    name: 'trait_SimPreference_NoOpinion_Communication_DeepThoughts',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Flirtation: {
    name: 'trait_SimPreference_NoOpinion_Communication_Flirtation',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Gossip: {
    name: 'trait_SimPreference_NoOpinion_Communication_Gossip',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Hobbies: {
    name: 'trait_SimPreference_NoOpinion_Communication_Hobbies',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Interests: {
    name: 'trait_SimPreference_NoOpinion_Communication_Interests',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Jokes: {
    name: 'trait_SimPreference_NoOpinion_Communication_Jokes',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Malicious: {
    name: 'trait_SimPreference_NoOpinion_Communication_Malicious',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_PhysicalIntimacy: {
    name: 'trait_SimPreference_NoOpinion_Communication_PhysicalIntimacy',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_PottyHumor: {
    name: 'trait_SimPreference_NoOpinion_Communication_PottyHumor',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Pranks: {
    name: 'trait_SimPreference_NoOpinion_Communication_Pranks',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_SillyBehavior: {
    name: 'trait_SimPreference_NoOpinion_Communication_SillyBehavior',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_SmallTalk: {
    name: 'trait_SimPreference_NoOpinion_Communication_SmallTalk',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Communication_Stories: {
    name: 'trait_SimPreference_NoOpinion_Communication_Stories',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Basics: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Basics',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Boho: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Boho',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Country: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Country',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Hipster: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Hipster',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Outdoorsy: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Outdoorsy',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Polished: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Polished',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Preppy: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Preppy',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Rocker: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Rocker',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Fashion_Streetwear: {
    name: 'trait_SimPreference_NoOpinion_Fashion_Streetwear',
    ignored: true,
  },
  trait_SimPreference_NoOpinion_Music_All: {
    name: 'trait_SimPreference_NoOpinion_Music_All',
    ignored: true,
  },
  Trait_SimPreference_NoOpinion_VideoGaming: {
    name: 'Trait_SimPreference_NoOpinion_VideoGaming',
    ignored: true,
  },
  trait_Sincere: {
    name: 'trait_Sincere',
    ignored: false,
    description: 'is sincere',
  },
  trait_Skeptical: {
    name: 'trait_Skeptical',
    description: 'is skeptical',
  },
  trait_Skill_Fishing_HiSkill: {
    name: 'trait_Skill_Fishing_HiSkill',
    description: 'is good at fishing',
  },
  trait_Skill_Imagination_1: {
    name: 'trait_Skill_Imagination_1',
    description: 'has a good imagination',
  },
  trait_Skill_Imagination_2: {
    name: 'trait_Skill_Imagination_2',
    description: 'has a good imagination',
  },
  trait_Skill_Imagination_3: {
    name: 'trait_Skill_Imagination_3',
    description: 'has a good imagination',
  },
  trait_Skill_Imagination_4: {
    name: 'trait_Skill_Imagination_4',
    description: 'has a good imagination',
  },
  trait_Skill_Imagination_5: {
    name: 'trait_Skill_Imagination_5',
    description: 'has a good imagination',
  },
  trait_SleightofHand: {
    name: 'trait_SleightofHand',
    ignored: false,
    description: 'can perform sleight of hand tricks',
  },
  trait_Slob: {
    name: 'trait_Slob',
    ignored: false,
    description: 'is a slob',
  },
  trait_Smart_Hub_WakeUp_Routine_Daily_Affirmation: {
    name: 'trait_Smart_Hub_WakeUp_Routine_Daily_Affirmation',
    ignored: true,
  },
  trait_Smart_Hub_WakeUp_Routine_Daily_Joke: {
    name: 'trait_Smart_Hub_WakeUp_Routine_Daily_Joke',
    ignored: true,
  },
  trait_Smart_Hub_WakeUp_Routine_Daily_News: {
    name: 'trait_Smart_Hub_WakeUp_Routine_Daily_News',
    ignored: true,
  },
  trait_Snob: {
    name: 'trait_Snob',
    ignored: false,
    description: 'is a snob',
  },
  trait_Snooping_Menace: {
    name: 'trait_Snooping_Menace',
    description: 'is a snooping menace',
  },
  trait_Snooping_SafeKeeper: {
    name: 'trait_Snooping_SafeKeeper',
    description: 'is good at making friends and finding secrets',
  },
  trait_SnowSportsSlope_Intensity_High: {
    name: 'trait_SnowSportsSlope_Intensity_High',
    ignored: true,
  },
  trait_SnowSportsSlope_Intensity_Low: {
    name: 'trait_SnowSportsSlope_Intensity_Low',
    ignored: true,
  },
  trait_SnowSportsSlope_Intensity_Med: {
    name: 'trait_SnowSportsSlope_Intensity_Med',
    ignored: true,
  },
  trait_SnowSportsSlope_Sled_ArmsUp: {
    name: 'trait_SnowSportsSlope_Sled_ArmsUp',
    ignored: true,
  },
  trait_SnowSportsSlope_Snowboarding_RecordVideo: {
    name: 'trait_SnowSportsSlope_Snowboarding_RecordVideo',
    ignored: true,
  },
  trait_SociallyAwkward: {
    name: 'trait_SociallyAwkward',
    ignored: false,
    description: 'is socially awkward',
  },
  trait_SociallyGifted: {
    name: 'trait_SociallyGifted',
    ignored: false,
    description: 'is socially gifted',
  },
  trait_SpecialNPC_isFTUERoommate: {
    name: 'trait_SpecialNPC_isFTUERoommate',
    ignored: true,
  },
  trait_SpecialNPCs_BabyAriel: {
    name: 'trait_SpecialNPCs_BabyAriel',
    ignored: true,
  },
  trait_SpecialNPCs_EP16SpecialNPC_SammyGarcia: {
    name: 'trait_SpecialNPCs_EP16SpecialNPC_SammyGarcia',
    ignored: true,
  },
  trait_SpecialNPCs_EP16SpecialNPC_TheRingBear: {
    name: 'trait_SpecialNPCs_EP16SpecialNPC_TheRingBear',
    ignored: true,
  },
  trait_SpecialNPCs_GAMESCOM_LoveInterest: {
    name: 'trait_SpecialNPCs_GAMESCOM_LoveInterest',
    ignored: true,
  },
  trait_Species_Cat: {
    name: 'trait_Species_Cat',
    description: 'is a cat',
  },
  trait_Species_Dog: {
    name: 'trait_Species_Dog',
    description: 'is a dog',
  },
  trait_Species_Horse: {
    name: 'trait_Species_Horse',
    description: 'is a horse',
  },
  trait_Species_Human: {
    name: 'trait_Species_Human',
    ignored: true,
  },
  trait_SpeciesExtended_LargeDogs: {
    name: 'trait_SpeciesExtended_LargeDogs',
    description: 'is a large dog',
  },
  trait_SpeciesExtended_SmallDogs: {
    name: 'trait_SpeciesExtended_SmallDogs',
    description: 'is a small dog',
  },
  trait_SpeedCleaner: {
    name: 'trait_SpeedCleaner',
    ignored: false,
    description: 'is a Speed Cleaner',
  },
  trait_SpeedReader: {
    name: 'trait_SpeedReader',
    ignored: false,
    description: 'is a speed reader',
  },
  trait_SpiceHound: {
    name: 'trait_SpiceHound',
    ignored: false,
    description: 'loves spicy food',
  },
  trait_Squeamish: {
    name: 'trait_Squeamish',
    ignored: false,
    description: 'is squeamish',
  },
  trait_SteelBladder: {
    name: 'trait_SteelBladder',
    ignored: false,
    description: 'has the ability to hold their pee for a long time',
  },
  trait_Stormchaser: {
    name: 'trait_Stormchaser',
    ignored: false,
    description: 'is a storm chaser',
  },
  trait_StovesAndGrillsMaster: {
    name: 'trait_StovesAndGrillsMaster',
    ignored: false,
    description: 'is a Stove and Grill Master',
  },
  trait_Strangerville_ActivelyPossessed_Overlay: {
    name: 'trait_Strangerville_ActivelyPossessed_Overlay',
    ignored: true,
  },
  trait_Strangerville_Hidden_ExaminedLabDoor: {
    name: 'trait_Strangerville_Hidden_ExaminedLabDoor',
    ignored: true,
  },
  trait_Strangerville_Hidden_HasAskedAround: {
    name: 'trait_Strangerville_Hidden_HasAskedAround',
    ignored: true,
  },
  trait_Strangerville_Hidden_HasDefeatedMotherPlant: {
    name: 'trait_Strangerville_Hidden_HasDefeatedMotherPlant',
    ignored: true,
  },
  trait_Strangerville_Hidden_HasSeenMotherPlant: {
    name: 'trait_Strangerville_Hidden_HasSeenMotherPlant',
    ignored: true,
  },
  trait_Strangerville_Infected: {
    name: 'trait_Strangerville_Infected',
    ignored: true,
  },
  trait_Strangerville_Vaccinated: {
    name: 'trait_Strangerville_Vaccinated',
    ignored: true,
  },
  trait_SuperGreenThumb: {
    name: 'trait_SuperGreenThumb',
    ignored: false,
    description: 'has a green thumb',
  },
  trait_SuperParent_RoleModel: {
    name: 'trait_SuperParent_RoleModel',
    ignored: false,
    description: 'is a Super Parent Role Model',
  },
  trait_SupremeAuthority: {
    name: 'trait_SupremeAuthority',
    ignored: false,
    description: 'has supreme authority and good at fights',
  },
  trait_SurpriseHoliday_DiscountDay: {
    name: 'trait_SurpriseHoliday_DiscountDay',
    ignored: true,
  },
  trait_SurpriseHoliday_PirateDay: {
    name: 'trait_SurpriseHoliday_PirateDay',
    ignored: true,
  },
  trait_SurvivalInstinct: {
    name: 'trait_SurvivalInstinct',
    ignored: false,
    description: 'has a strong survival instinct',
  },
  trait_Survivalist: {
    name: 'trait_Survivalist',
    ignored: false,
    description: 'is a survivalist',
  },
  trait_TailStyle_Down: {
    name: 'trait_TailStyle_Down',
    ignored: true,
  },
  trait_TailStyle_Up: {
    name: 'trait_TailStyle_Up',
    ignored: true,
  },
  trait_teen: {
    name: 'trait_teen',
    ignored: true,
  },
  trait_TeenPranks_Prankster: {
    name: 'trait_TeenPranks_Prankster',
    ignored: false,
    description: 'is a Prankster',
  },
  trait_Temperature_BurningMan: {
    name: 'trait_Temperature_BurningMan',
    ignored: false,
    description: 'is unaffected by hot temperatures',
  },
  trait_Temperature_ColdAcclimation: {
    name: 'trait_Temperature_ColdAcclimation',
    ignored: false,
    description: 'is acclimated to cold weather',
  },
  trait_Temperature_HeatAcclimation: {
    name: 'trait_Temperature_HeatAcclimation',
    ignored: false,
    description: 'is acclimated to hot weather',
  },
  trait_Temperature_IceMan: {
    name: 'trait_Temperature_IceMan',
    ignored: false,
    description: 'is unaffected by cold temperatures',
  },
  trait_TheKnack: {
    name: 'trait_TheKnack',
    ignored: false,
    description: 'is handy at fixing things',
  },
  trait_TheMaster: {
    name: 'trait_TheMaster',
    ignored: true,
  },
  trait_toddler: {
    name: 'trait_toddler',
    ignored: true,
  },
  trait_Toddler_Angelic: {
    name: 'trait_Toddler_Angelic',
    ignored: false,
    description: 'is angelic',
  },
  trait_Toddler_Charmer: {
    name: 'trait_Toddler_Charmer',
    ignored: false,
    description: 'is a charmer',
  },
  trait_Toddler_Clingy: {
    name: 'trait_Toddler_Clingy',
    ignored: false,
    description: 'is clingy',
  },
  trait_Toddler_Fussy: {
    name: 'trait_Toddler_Fussy',
    ignored: false,
    description: 'is fussy',
  },
  trait_Toddler_Independent: {
    name: 'trait_Toddler_Independent',
    ignored: false,
    description: 'is independent',
  },
  trait_Toddler_Inquisitive: {
    name: 'trait_Toddler_Inquisitive',
    ignored: false,
    description: 'is inquisitive',
  },
  trait_Toddler_Silly: {
    name: 'trait_Toddler_Silly',
    ignored: false,
    description: 'is silly',
  },
  trait_Toddler_Wild: {
    name: 'trait_Toddler_Wild',
    ignored: false,
    description: 'is wild',
  },
  trait_Top_Notch_Toddler: {
    name: 'trait_Top_Notch_Toddler',
    ignored: false,
    description: 'is a quick learner',
  },
  trait_Top_Notch_Toddler_Hidden: {
    name: 'trait_Top_Notch_Toddler_Hidden',
    ignored: true,
  },
  trait_TownMascot: {
    name: 'trait_TownMascot',
    description: 'is the town mascot',
  },
  trait_TrueMaster: {
    name: 'trait_TrueMaster',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_1: {
    name: 'trait_Umbrella_Preference_Adult_1',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_10: {
    name: 'trait_Umbrella_Preference_Adult_10',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_11: {
    name: 'trait_Umbrella_Preference_Adult_11',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_12: {
    name: 'trait_Umbrella_Preference_Adult_12',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_2: {
    name: 'trait_Umbrella_Preference_Adult_2',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_3: {
    name: 'trait_Umbrella_Preference_Adult_3',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_4: {
    name: 'trait_Umbrella_Preference_Adult_4',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_5: {
    name: 'trait_Umbrella_Preference_Adult_5',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_6: {
    name: 'trait_Umbrella_Preference_Adult_6',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_7: {
    name: 'trait_Umbrella_Preference_Adult_7',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_8: {
    name: 'trait_Umbrella_Preference_Adult_8',
    ignored: true,
  },
  trait_Umbrella_Preference_Adult_9: {
    name: 'trait_Umbrella_Preference_Adult_9',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_1: {
    name: 'trait_Umbrella_Preference_Child_1',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_10: {
    name: 'trait_Umbrella_Preference_Child_10',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_11: {
    name: 'trait_Umbrella_Preference_Child_11',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_12: {
    name: 'trait_Umbrella_Preference_Child_12',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_2: {
    name: 'trait_Umbrella_Preference_Child_2',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_3: {
    name: 'trait_Umbrella_Preference_Child_3',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_4: {
    name: 'trait_Umbrella_Preference_Child_4',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_5: {
    name: 'trait_Umbrella_Preference_Child_5',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_6: {
    name: 'trait_Umbrella_Preference_Child_6',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_7: {
    name: 'trait_Umbrella_Preference_Child_7',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_8: {
    name: 'trait_Umbrella_Preference_Child_8',
    ignored: true,
  },
  trait_Umbrella_Preference_Child_9: {
    name: 'trait_Umbrella_Preference_Child_9',
    ignored: true,
  },
  trait_Umbrella_User: {
    name: 'trait_Umbrella_User',
    ignored: true,
  },
  trait_Unflirty: {
    name: 'trait_Unflirty',
    ignored: false,
    description: 'is un-flirtatious',
  },
  trait_University_ArtHistoryDegreeBA: {
    name: 'trait_University_ArtHistoryDegreeBA',
    ignored: true,
  },
  trait_University_ArtHistoryDegreeBAHonors: {
    name: 'trait_University_ArtHistoryDegreeBAHonors',
    ignored: true,
  },
  trait_University_ArtHistoryDegreeBS: {
    name: 'trait_University_ArtHistoryDegreeBS',
    ignored: true,
  },
  trait_University_ArtHistoryDegreeBSHonors: {
    name: 'trait_University_ArtHistoryDegreeBSHonors',
    ignored: true,
  },
  trait_University_BartenderDegree: {
    name: 'trait_University_BartenderDegree',
    ignored: false,
    description: 'has a Bartender Degree',
  },
  trait_University_BiologyDegreeBA: {
    name: 'trait_University_BiologyDegreeBA',
    ignored: true,
  },
  trait_University_BiologyDegreeBAHonors: {
    name: 'trait_University_BiologyDegreeBAHonors',
    ignored: true,
  },
  trait_University_BiologyDegreeBS: {
    name: 'trait_University_BiologyDegreeBS',
    ignored: true,
  },
  trait_University_BiologyDegreeBSHonors: {
    name: 'trait_University_BiologyDegreeBSHonors',
    ignored: true,
  },
  trait_University_CommunicationsDegreeBA: {
    name: 'trait_University_CommunicationsDegreeBA',
    ignored: true,
  },
  trait_University_CommunicationsDegreeBAHonors: {
    name: 'trait_University_CommunicationsDegreeBAHonors',
    ignored: true,
  },
  trait_University_CommunicationsDegreeBS: {
    name: 'trait_University_CommunicationsDegreeBS',
    ignored: true,
  },
  trait_University_CommunicationsDegreeBSHonors: {
    name: 'trait_University_CommunicationsDegreeBSHonors',
    ignored: true,
  },
  trait_University_ComputerScienceDegreeBA: {
    name: 'trait_University_ComputerScienceDegreeBA',
    ignored: true,
  },
  trait_University_ComputerScienceDegreeBAHonors: {
    name: 'trait_University_ComputerScienceDegreeBAHonors',
    ignored: true,
  },
  trait_University_ComputerScienceDegreeBS: {
    name: 'trait_University_ComputerScienceDegreeBS',
    ignored: true,
  },
  trait_University_ComputerScienceDegreeBSHonors: {
    name: 'trait_University_ComputerScienceDegreeBSHonors',
    ignored: true,
  },
  trait_University_CulinaryArtsDegreeBA: {
    name: 'trait_University_CulinaryArtsDegreeBA',
    ignored: true,
  },
  trait_University_CulinaryArtsDegreeBAHonors: {
    name: 'trait_University_CulinaryArtsDegreeBAHonors',
    ignored: true,
  },
  trait_University_CulinaryArtsDegreeBS: {
    name: 'trait_University_CulinaryArtsDegreeBS',
    ignored: true,
  },
  trait_University_CulinaryArtsDegreeBSHonors: {
    name: 'trait_University_CulinaryArtsDegreeBSHonors',
    ignored: true,
  },
  trait_University_DegreeTraits_ArtHistory: {
    name: 'trait_University_DegreeTraits_ArtHistory',
    description: 'has a degree in art history',
  },
  trait_University_DegreeTraits_Biology: {
    name: 'trait_University_DegreeTraits_Biology',
    description: 'has a biology degree',
  },
  trait_University_DegreeTraits_Communications: {
    name: 'trait_University_DegreeTraits_Communications',
    description: 'has a communications degree',
  },
  trait_University_DegreeTraits_ComputerScience: {
    name: 'trait_University_DegreeTraits_ComputerScience',
    description: 'has a computer science degree',
  },
  trait_University_DegreeTraits_CulinaryArts: {
    name: 'trait_University_DegreeTraits_CulinaryArts',
    description: 'has a culinary arts degree',
  },
  trait_University_DegreeTraits_Drama: {
    name: 'trait_University_DegreeTraits_Drama',
    description: 'has a degree in drama',
  },
  trait_University_DegreeTraits_Economics: {
    name: 'trait_University_DegreeTraits_Economics',
    description: 'has a degree in economics',
  },
  trait_University_DegreeTraits_FineArt: {
    name: 'trait_University_DegreeTraits_FineArt',
    description: 'has a degree in fine arts',
  },
  trait_University_DegreeTraits_History: {
    name: 'trait_University_DegreeTraits_History',
    description: 'has a degree in history',
  },
  trait_University_DegreeTraits_LanguageAndLiterature: {
    name: 'trait_University_DegreeTraits_LanguageAndLiterature',
    description: 'has a degree in language and literature',
  },
  trait_University_DegreeTraits_Physics: {
    name: 'trait_University_DegreeTraits_Physics',
    description: 'has a degree in physics',
  },
  trait_University_DegreeTraits_Psychology: {
    name: 'trait_University_DegreeTraits_Psychology',
    description: 'has a degree in psychology',
  },
  trait_University_DegreeTraits_Type_ArtsDegree: {
    name: 'trait_University_DegreeTraits_Type_ArtsDegree',
    description: 'has a degree in arts',
  },
  trait_University_DegreeTraits_Type_Honors: {
    name: 'trait_University_DegreeTraits_Type_Honors',
    ignored: true,
  },
  trait_University_DegreeTraits_Villainy: {
    name: 'trait_University_DegreeTraits_Villainy',
    description: 'has a degree in villainy',
  },
  trait_University_DramaDegreeBA: {
    name: 'trait_University_DramaDegreeBA',
    ignored: true,
  },
  trait_University_DramaDegreeBAHonors: {
    name: 'trait_University_DramaDegreeBAHonors',
    ignored: true,
  },
  trait_University_DramaDegreeBS: {
    name: 'trait_University_DramaDegreeBS',
    ignored: true,
  },
  trait_University_DramaDegreeBSHonors: {
    name: 'trait_University_DramaDegreeBSHonors',
    ignored: true,
  },
  trait_University_EconomicsDegreeBA: {
    name: 'trait_University_EconomicsDegreeBA',
    ignored: true,
  },
  trait_University_EconomicsDegreeBAHonors: {
    name: 'trait_University_EconomicsDegreeBAHonors',
    ignored: true,
  },
  trait_University_EconomicsDegreeBS: {
    name: 'trait_University_EconomicsDegreeBS',
    ignored: true,
  },
  trait_University_EconomicsDegreeBSHonors: {
    name: 'trait_University_EconomicsDegreeBSHonors',
    ignored: true,
  },
  trait_University_FineArtDegreeBA: {
    name: 'trait_University_FineArtDegreeBA',
    ignored: true,
  },
  trait_University_FineArtDegreeBAHonors: {
    name: 'trait_University_FineArtDegreeBAHonors',
    ignored: true,
  },
  trait_University_FineArtDegreeBS: {
    name: 'trait_University_FineArtDegreeBS',
    ignored: true,
  },
  trait_University_FineArtDegreeBSHonors: {
    name: 'trait_University_FineArtDegreeBSHonors',
    ignored: true,
  },
  trait_University_HigherEducation: {
    name: 'trait_University_HigherEducation',
    ignored: false,
    description: 'is highly educated',
  },
  trait_University_HistoryDegreeBA: {
    name: 'trait_University_HistoryDegreeBA',
    ignored: true,
  },
  trait_University_HistoryDegreeBAHonors: {
    name: 'trait_University_HistoryDegreeBAHonors',
    ignored: true,
  },
  trait_University_HistoryDegreeBS: {
    name: 'trait_University_HistoryDegreeBS',
    ignored: true,
  },
  trait_University_HistoryDegreeBSHonors: {
    name: 'trait_University_HistoryDegreeBSHonors',
    ignored: true,
  },
  trait_University_LanguageAndLiteratureDegreeBA: {
    name: 'trait_University_LanguageAndLiteratureDegreeBA',
    ignored: true,
  },
  trait_University_LanguageAndLiteratureDegreeBAHonors: {
    name: 'trait_University_LanguageAndLiteratureDegreeBAHonors',
    ignored: true,
  },
  trait_University_LanguageAndLiteratureDegreeBS: {
    name: 'trait_University_LanguageAndLiteratureDegreeBS',
    ignored: true,
  },
  trait_University_LanguageAndLiteratureDegreeBSHonors: {
    name: 'trait_University_LanguageAndLiteratureDegreeBSHonors',
    ignored: true,
  },
  trait_University_PhysicsDegreeBA: {
    name: 'trait_University_PhysicsDegreeBA',
    ignored: true,
  },
  trait_University_PhysicsDegreeBAHonors: {
    name: 'trait_University_PhysicsDegreeBAHonors',
    ignored: true,
  },
  trait_University_PhysicsDegreeBS: {
    name: 'trait_University_PhysicsDegreeBS',
    ignored: true,
  },
  trait_University_PhysicsDegreeBSHonors: {
    name: 'trait_University_PhysicsDegreeBSHonors',
    ignored: true,
  },
  trait_University_PsychologyDegreeBA: {
    name: 'trait_University_PsychologyDegreeBA',
    ignored: true,
  },
  trait_University_PsychologyDegreeBAHonors: {
    name: 'trait_University_PsychologyDegreeBAHonors',
    ignored: true,
  },
  trait_University_PsychologyDegreeBS: {
    name: 'trait_University_PsychologyDegreeBS',
    ignored: true,
  },
  trait_University_PsychologyDegreeBSHonors: {
    name: 'trait_University_PsychologyDegreeBSHonors',
    ignored: true,
  },
  trait_University_VillainyDegreeBA: {
    name: 'trait_University_VillainyDegreeBA',
    ignored: true,
  },
  trait_University_VillainyDegreeBAHonors: {
    name: 'trait_University_VillainyDegreeBAHonors',
    ignored: true,
  },
  trait_University_VillainyDegreeBS: {
    name: 'trait_University_VillainyDegreeBS',
    ignored: true,
  },
  trait_University_VillainyDegreeBSHonors: {
    name: 'trait_University_VillainyDegreeBSHonors',
    ignored: true,
  },
  trait_UnstoppableFame: {
    name: 'trait_UnstoppableFame',
    ignored: false,
    description: 'is an immortalized celebrity',
  },
  trait_Untroubled: {
    name: 'trait_Untroubled',
    ignored: false,
    description: 'is untroubled and carefree',
  },
  trait_ValuedCustomer: {
    name: 'trait_ValuedCustomer',
    ignored: true,
  },
  trait_Vegetarian: {
    name: 'trait_Vegetarian',
    ignored: false,
    description: 'is a vegetarian',
  },
  trait_WalkStyleCreepy: {
    name: 'trait_WalkStyleCreepy',
    description: 'has a creepy walk',
  },
  trait_WalkStyleDefault: {
    name: 'trait_WalkStyleDefault',
    ignored: true,
  },
  trait_WalkStyleEnergetic: {
    name: 'trait_WalkStyleEnergetic',
    description: 'has an energetic walk',
  },
  trait_WalkStyleFeminine: {
    name: 'trait_WalkStyleFeminine',
    description: 'has a feminine walk',
  },
  trait_WalkStyleGoofy: {
    name: 'trait_WalkStyleGoofy',
    description: 'has a goofy walk',
  },
  trait_WalkStylePerky: {
    name: 'trait_WalkStylePerky',
    description: 'has a perky walk',
  },
  trait_WalkStyleSleepy: {
    name: 'trait_WalkStyleSleepy',
    description: 'has a sleepy walk',
  },
  trait_WalkStyleSnooty: {
    name: 'trait_WalkStyleSnooty',
    description: 'has a snooty walk',
  },
  trait_WalkStyleSwagger: {
    name: 'trait_WalkStyleSwagger',
    description: 'has a swagger walk',
  },
  trait_WalkStyleTough: {
    name: 'trait_WalkStyleTough',
    description: 'has a tough style walk',
  },
  trait_Waterproof: {
    name: 'trait_Waterproof',
    ignored: false,
    description: "is waterproof and doesn't get wet",
  },
  trait_WebMaster: {
    name: 'trait_WebMaster',
    description: 'is a computer whiz',
  },
  trait_WeddingTradition_BouquetToss: {
    name: 'trait_WeddingTradition_BouquetToss',
    ignored: true,
  },
  trait_WeddingTradition_CoupleCakeCut: {
    name: 'trait_WeddingTradition_CoupleCakeCut',
    ignored: true,
  },
  trait_WeddingTradition_FirstDance: {
    name: 'trait_WeddingTradition_FirstDance',
    ignored: true,
  },
  trait_WeddingTradition_GroupDance: {
    name: 'trait_WeddingTradition_GroupDance',
    ignored: true,
  },
  trait_WeddingTradition_HadBouquet: {
    name: 'trait_WeddingTradition_HadBouquet',
    ignored: true,
  },
  trait_WeddingTradition_HadWeddingCake: {
    name: 'trait_WeddingTradition_HadWeddingCake',
    ignored: true,
  },
  trait_WeddingTradition_RingExchange: {
    name: 'trait_WeddingTradition_RingExchange',
    ignored: true,
  },
  trait_WeddingTradition_SpousalKiss: {
    name: 'trait_WeddingTradition_SpousalKiss',
    ignored: true,
  },
  trait_WeddingTradition_WalkedDownAisle: {
    name: 'trait_WeddingTradition_WalkedDownAisle',
    ignored: true,
  },
  trait_WerewolfBookRead_PeterBarker1: {
    name: 'trait_WerewolfBookRead_PeterBarker1',
    ignored: true,
  },
  trait_WerewolfBookRead_PeterBarker2: {
    name: 'trait_WerewolfBookRead_PeterBarker2',
    ignored: true,
  },
  trait_WerewolfBookRead_PeterBarker3: {
    name: 'trait_WerewolfBookRead_PeterBarker3',
    ignored: true,
  },
  trait_WerewolfBookRead_PeterBarker4: {
    name: 'trait_WerewolfBookRead_PeterBarker4',
    ignored: true,
  },
  trait_WerewolfBookRead_Secret1: {
    name: 'trait_WerewolfBookRead_Secret1',
    ignored: true,
  },
  trait_WerewolfBookRead_Secret2: {
    name: 'trait_WerewolfBookRead_Secret2',
    ignored: true,
  },
  trait_WerewolfBookRead_Secret3: {
    name: 'trait_WerewolfBookRead_Secret3',
    ignored: true,
  },
  trait_WerewolfBookRead_Secret4: {
    name: 'trait_WerewolfBookRead_Secret4',
    ignored: true,
  },
  trait_WerewolfBookRead_Vulfgang1: {
    name: 'trait_WerewolfBookRead_Vulfgang1',
    ignored: true,
  },
  trait_WerewolfBookRead_Vulfgang2: {
    name: 'trait_WerewolfBookRead_Vulfgang2',
    ignored: true,
  },
  trait_WerewolfBookRead_Vulfgang3: {
    name: 'trait_WerewolfBookRead_Vulfgang3',
    ignored: true,
  },
  trait_WerewolfBookRead_Vulfgang4: {
    name: 'trait_WerewolfBookRead_Vulfgang4',
    ignored: true,
  },
  trait_WerewolfInterest_DontWant: {
    name: 'trait_WerewolfInterest_DontWant',
    ignored: true,
  },
  trait_WerewolfInterest_Want: {
    name: 'trait_WerewolfInterest_Want',
    ignored: true,
  },
  trait_WerewolfPack_AllianceFeud_Alliance: {
    name: 'trait_WerewolfPack_AllianceFeud_Alliance',
    ignored: true,
  },
  trait_WerewolfPack_AllianceFeud_Feud: {
    name: 'trait_WerewolfPack_AllianceFeud_Feud',
    ignored: true,
  },
  trait_WerewolfPack_AllianceFeud_Neutral: {
    name: 'trait_WerewolfPack_AllianceFeud_Neutral',
    ignored: true,
  },
  trait_WerewolfPack_Discipline_Probation: {
    name: 'trait_WerewolfPack_Discipline_Probation',
    ignored: true,
  },
  trait_WerewolfPack_Discipline_ReportToLeader: {
    name: 'trait_WerewolfPack_Discipline_ReportToLeader',
    ignored: true,
  },
  trait_WerewolfPack_Discipline_Warning: {
    name: 'trait_WerewolfPack_Discipline_Warning',
    ignored: true,
  },
  trait_WerewolfPack_FriendA: {
    name: 'trait_WerewolfPack_FriendA',
    ignored: false,
    description: 'is a friend of the Moonwood Collective',
  },
  trait_WerewolfPack_FriendA_ReportToLeader: {
    name: 'trait_WerewolfPack_FriendA_ReportToLeader',
    ignored: true,
  },
  trait_WerewolfPack_FriendB: {
    name: 'trait_WerewolfPack_FriendB',
    ignored: false,
    description: 'is a friend of The Wildfangs',
  },
  trait_WerewolfPack_FriendB_ReportToLeader: {
    name: 'trait_WerewolfPack_FriendB_ReportToLeader',
    ignored: true,
  },
  trait_WerewolfPack_LeaderHasNotRedecorated: {
    name: 'trait_WerewolfPack_LeaderHasNotRedecorated',
    ignored: true,
  },
  trait_WerewolfPack_ReportToLeader_Other: {
    name: 'trait_WerewolfPack_ReportToLeader_Other',
    ignored: true,
  },
  trait_WerewolfPackA: {
    name: 'trait_WerewolfPackA',
    description: 'is a member of The Moonwood Collective',
  },
  trait_WerewolfPackA_Leader: {
    name: 'trait_WerewolfPackA_Leader',
    ignored: true,
    description: 'is a leader of The Moonwood Collective',
  },
  trait_WerewolfPackA_Member: {
    name: 'trait_WerewolfPackA_Member',
    ignored: true,
    description: 'is a member of The Moonwood Collective',
  },
  trait_WerewolfPackB: {
    name: 'trait_WerewolfPackB',
    description: 'is a member of The Wildfangs',
  },
  trait_WerewolfPackB_Leader: {
    name: 'trait_WerewolfPackB_Leader',
    description: 'is the leader of The Wildfangs',
  },
  trait_WerewolfPackB_Member: {
    name: 'trait_WerewolfPackB_Member',
    description: 'is a member of The Wildfangs',
  },
  trait_Wise: {
    name: 'trait_Wise',
    description: 'is wise',
  },
  trait_WitchOccult_AskedAboutMagic: {
    name: 'trait_WitchOccult_AskedAboutMagic',
    ignored: true,
  },
  trait_WitchOccult_Broom_Walkby: {
    name: 'trait_WitchOccult_Broom_Walkby',
    ignored: true,
  },
  trait_WitchOccult_Brooms_UseBroomTeleports: {
    name: 'trait_WitchOccult_Brooms_UseBroomTeleports',
    ignored: true,
  },
  trait_WitchOccult_FormerWitch: {
    name: 'trait_WitchOccult_FormerWitch',
    ignored: true,
  },
  trait_WitchOccult_MoteSight: {
    name: 'trait_WitchOccult_MoteSight',
    ignored: true,
  },
  trait_WitchOccult_Perks_MoteHound: {
    name: 'trait_WitchOccult_Perks_MoteHound',
    ignored: true,
  },
  trait_WitchOccult_Wands_PreferWands: {
    name: 'trait_WitchOccult_Wands_PreferWands',
    ignored: true,
  },
  trait_WitchOccult_Wands_UseWand: {
    name: 'trait_WitchOccult_Wands_UseWand',
    ignored: true,
  },
  trait_WithNanny: {
    name: 'trait_WithNanny',
    description: 'is with nanny',
  },
  trait_WolfTown_Greg: {
    name: 'trait_WolfTown_Greg',
    ignored: true,
  },
  trait_WorldlyKnowledge: {
    name: 'trait_WorldlyKnowledge',
    ignored: false,
    description: 'is good at socializing at social events',
  },
  trait_WorldRenownedActor: {
    name: 'trait_WorldRenownedActor',
    ignored: false,
    description: 'is a world-renowned actor',
  },
  trait_youngAdult: {
    name: 'trait_youngAdult',
    ignored: true,
  },
  wellness_CalmingAura: {
    name: 'wellness_CalmingAura',
    description: 'has a calming aura',
  },
  wellness_ClearPerspective: {
    name: 'wellness_ClearPerspective',
    description: 'has a clear perspective on life',
  },
  wellness_MomentOfClarity: {
    name: 'wellness_MomentOfClarity',
    description: 'is having a moment of clarity',
  },
  wellness_SelfCareExpertise: {
    name: 'wellness_SelfCareExpertise',
    description: 'is an expert at self-care',
  },
  wellness_SpaMembership: {
    name: 'wellness_SpaMembership',
    ignored: true,
  },
};
