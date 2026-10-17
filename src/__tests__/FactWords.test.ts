import { describe, expect, it } from 'vitest';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import {
  aspirationParts,
  aspirationWords,
  attractionWords,
  businessParts,
  businessText,
  careerBranchWords,
  careerParts,
  careerTrackWords,
  factValueWords,
  familyBitWords,
  fearWords,
  isChildPhase,
  preferenceKind,
  preferenceParts,
  preferenceWords,
  skillWords,
  traitWords,
} from 'main/sentient-sims/util/factWords';
import { businessWords, jobWords } from 'main/sentient-sims/util/renderKnownFacts';

// The game's identifiers said in plain words, for the prompt and the Facts window alike.
// Every shape here was read off a live database on 2026-10-12.
describe('fact words', () => {
  it('names a pet trait with its species, because the dog Glutton is not the sim Glutton', () => {
    expect(traitWords('trait_Pet_Glutton_Dog')).toBe('Glutton (Dog)');
    expect(traitWords('trait_Pet_Hairy_Cat')).toBe('Hairy (Cat)');
    expect(traitWords('trait_Pet_Wanderlust_Dog')).toBe('Wanderlust (Dog)');
  });

  it('says a trait the way the game shows it', () => {
    expect(traitWords('trait_Insane')).toBe('Erratic');
    expect(traitWords('trait_Business_Savvy')).toBe('Business Savvy');
    expect(traitWords('trait_Reward_Infant_TopNotch')).toBe('Top-Notch Infant');
    expect(traitWords('trait_Toddler_TopNotch')).toBe('Top-Notch Toddler');
    expect(traitWords('trait_TopNotchToddler')).toBe('Top-Notch Toddler');
    expect(traitWords('trait_ChildSkillReward_Headstrong')).toBe('Headstrong');
    expect(traitWords('trait_ChildhoodPhase_Clingy')).toBe('Clingy');
    expect(traitWords('trait_ChildConfidence_High')).toBe('High Confidence');
    expect(traitWords('TURBODRIVER:WickedWhims_Trait_Personality_Archetype_Lover_Major')).toBe('Lover');
    expect(traitWords('TURBODRIVER:WickedWhims_Trait_Personality_Archetype_Sinister_Minor')).toBe('Sinister');
    expect(traitWords('trait_LoveStruck')).toBe('Lovebug');
    expect(traitWords('trait_HomeTurf')).toBe('Loves Being Home');
    expect(traitWords('trait_NewInTown_InspiredExplorer')).toBe('Inspired Explorer');
    expect(traitWords('trait_CorporateWorker_CharismaticCrooner')).toBe('Charismatic Crooner');
    expect(traitWords('trait_Excursion_Mountaineer_Rank2')).toBe('Capable Mountaineer');
    expect(traitWords('trait_HardlyHungry')).toBe('Hardly Hungry');
    expect(traitWords('trait_Iceproof')).toBe('Iceproof');
    expect(traitWords('trait_Temperature_IceMan')).toBe('Iceproof');
    expect(traitWords('trait_Temperature_BurningMan')).toBe('Heatproof');
    expect(traitWords('trait_TheKnack')).toBe('Handy');
    expect(factValueWords(FactPredicate.REWARD_TRAIT, 'trait_Business_Savvy')).toBe('Business Savvy');
  });

  it('says a satisfaction reward as what it does', () => {
    expect(traitWords('trait_Marketable')).toBe('Crafts High Value Items');
    expect(traitWords('trait_Temperature_ColdAcclimation')).toBe('Immune to Cold Weather');
    expect(traitWords('trait_Temperature_HeatAcclimation')).toBe('Immune to Hot Weather');
    expect(traitWords('trait_Stormchaser')).toBe('Loves Stormy Weather');
    expect(traitWords('trait_Naturalist')).toBe('Immune to Fire');
    expect(traitWords('trait_Waterproof')).toBe('Waterproof');
    expect(traitWords('trait_SpeedCleaner')).toBe('Speed Cleaner');
    expect(traitWords('trait_SuperGreenThumb')).toBe('Super Green Thumb');
    expect(traitWords('trait_Observant')).toBe('Observant');
    expect(traitWords('trait_Beguiling')).toBe('Beguiling');
    expect(traitWords('trait_LifeSkills_Responsible')).toBe('Responsible');
    expect(traitWords('trait_PetQuirk_Fear_Vacuum')).toBe('Afraid of Vacuum');
    expect(traitWords('trait_PetQuirk_Obsessed_Computer')).toBe('Obsessed with Computer');
  });

  it('calls the Idealist characteristic Artsy, which is what the game shows', () => {
    expect(preferenceWords('trait_SimPreference_Dislikes_Characteristic_Idealist')).toBe('Artsy Sims');
    expect(preferenceParts('trait_SimPreference_Dislikes_Characteristic_Idealist')).toEqual({
      group: 'Types of Sims',
      label: 'Artsy Sims',
    });
  });

  it('names a reward the way the panel does, including the WickedWhims ones', () => {
    // Jake Flores's rewards, read off the Facts window 2026-10-13
    expect(traitWords('trait_FreeServices')).toBe('Receives Free Services');
    expect(traitWords('trait_Longevity')).toBe('Long-lived');
    expect(traitWords('trait_ClubPresident')).toBe('Natural Leader');
    expect(traitWords('trait_MorningPerson')).toBe('Morning Sim');
    expect(traitWords('trait_SelfAssured')).toBe('Self-Assured');
    expect(traitWords('TURBODRIVER:WickedWhims_Trait_Attractiveness_Reward_UniqueLooks')).toBe('Unique Looks');
    expect(traitWords('TURBODRIVER:WickedWhims_Trait_Nudity_NoSweat_Reward')).toBe("Doesn't Sweat");
    expect(traitWords('TURBODRIVER:WickedWhims_Trait_Sex_SexuallyAlluring')).toBe('Sexually Alluring');
    // Mara Bellweather's panel: Beloved and Confidante, where the files say Legendary and NosyNeighbor
    expect(traitWords('trait_Legendary')).toBe('Beloved');
    expect(traitWords('trait_NosyNeighbor')).toBe('Confidante');
    expect(factValueWords(FactPredicate.PHASE, 'TURBODRIVER:WickedWhims_Trait_FertilityIssues')).toBe('Hypofertile');
    expect(isChildPhase('TURBODRIVER:WickedWhims_Trait_FertilityIssues')).toBe(false);
    expect(isChildPhase('trait_ChildConfidence_High')).toBe(true);
  });

  it('names a characteristic the way the Likes panel does', () => {
    expect(preferenceWords('trait_SimPreference_Dislikes_Characteristic_KidEnthusiast')).toBe('Family-Oriented Sims');
    expect(preferenceWords('trait_SimPreference_Likes_Characteristic_Optimist')).toBe('Optimistic Sims');
  });

  it('files a turn-on under the Lovestruck panel headings', () => {
    expect(preferenceParts('trait_Attraction_Activities_Broke_TurnOff')).toEqual({
      group: 'Way of Life',
      label: 'Broke',
    });
    expect(preferenceParts('trait_Attraction_Characteristics_Messy_TurnOff')).toEqual({
      group: 'Characteristics',
      label: 'Messy',
    });
    expect(preferenceParts('trait_Attraction_Characteristics_Idealist_TurnOn')).toEqual({
      group: 'Characteristics',
      label: 'Artsy',
    });
    // Performer sits under Way of Life on the panel, whatever the files say
    expect(preferenceParts('trait_Attraction_SkillArchetypes_Performer_TurnOn')).toEqual({
      group: 'Way of Life',
      label: 'Performer',
    });
    expect(preferenceParts('trait_Attraction_SkillArchetypes_Cooking_TurnOn')).toEqual({
      group: 'Skills',
      label: 'Cooking',
    });
    expect(preferenceParts('trait_Attraction_OutfitColor_Red_TurnOn')).toEqual({ group: 'Outfit Color', label: 'Red' });
  });

  it('names a fear the way the panel does', () => {
    expect(fearWords('trait_Fear_Dark')).toBe('The Dark');
    expect(fearWords('trait_Fear_Unfulfilled')).toBe('Unfulfilled Dreams');
    expect(fearWords('trait_Fear_DeadEndJob')).toBe('Dead-End Job');
    expect(fearWords('trait_Fear_BeingCheatedOn')).toBe('Being Cheated On');
    expect(factValueWords(FactPredicate.FEAR, 'trait_Fear_CrowdedPlaces')).toBe('Crowded Places');
  });

  it('drops the age prefix and splits the words of a sim trait', () => {
    expect(traitWords('trait_HotHeaded')).toBe('Hot-Headed');
    expect(traitWords('Trait_AnimalEnthusiast')).toBe('Animal Enthusiast');
    expect(traitWords('trait_Infant_Cautious')).toBe('Cautious');
    expect(traitWords('trait_Toddler_Wild')).toBe('Wild');
    expect(traitWords('trait_Geek')).toBe('Geek');
  });

  it('says what a like is of, with the category only where a bare word would mean nothing', () => {
    expect(preferenceWords('trait_SimPreference_Likes_Activities_Cooking')).toBe('Cooking');
    expect(preferenceWords('Trait_SimPreference_Likes_Activities_Fitness')).toBe('Fitness');
    expect(preferenceWords('trait_SimPreference_Likes_Activities_RockClimbing')).toBe('Rock Climbing');
    expect(preferenceWords('trait_SimPreference_Likes_Music_HipHop')).toBe('Hip Hop music');
    expect(preferenceWords('trait_SimPreference_Dislikes_Color_Blue')).toBe('the colour Blue');
    expect(preferenceWords('trait_SimPreference_Likes_Characteristic_Funny')).toBe('Funny Sims');
    expect(preferenceWords('trait_SimPreference_Likes_Characteristic_HardWorker')).toBe('Hard Worker Sims');
    expect(preferenceWords('trait_SimPreference_Dislikes_Communication_PottyHumor')).toBe(
      'Potty Humor (in conversation)',
    );
    expect(preferenceWords('trait_SimPreference_Likes_Decor_Boho')).toBe('Boho decor');
  });

  it('says a turn-on as a turn-on', () => {
    expect(preferenceWords('trait_Attraction_Activities_Broke_TurnOn')).toBe('Broke (turn-on)');
    expect(preferenceWords('trait_Attraction_HairColor_Green_TurnOff')).toBe('Green hair (turn-off)');
    expect(preferenceWords('trait_Attraction_Fashion_Country_TurnOff')).toBe('Country fashion (turn-off)');
    expect(preferenceWords('trait_Attraction_SkillArchetypes_Arts&Crafts_TurnOn')).toBe('Arts & Crafts (turn-on)');
  });

  it('tells a turn-on from a like, and says it bare inside its own list', () => {
    expect(preferenceKind('trait_Attraction_Activities_Broke_TurnOn', 'likes')).toBe('turn-on');
    expect(preferenceKind('trait_Attraction_Fashion_Country_TurnOff', 'dislikes')).toBe('turn-off');
    expect(preferenceKind('trait_SimPreference_Likes_Activities_Cooking', 'likes')).toBe('likes');
    expect(preferenceKind('trait_SimPreference_Dislikes_Color_Blue', 'dislikes')).toBe('dislikes');
    expect(attractionWords('trait_Attraction_HairColor_Green_TurnOn')).toBe('Green hair');
    expect(attractionWords('trait_Attraction_SkillArchetypes_Arts&Crafts_TurnOff')).toBe('Arts & Crafts');
  });

  it('splits a like into the Facts window heading and the bare words under it', () => {
    expect(preferenceParts('trait_SimPreference_Likes_Color_Blue')).toEqual({ group: 'Colors', label: 'Blue' });
    expect(preferenceParts('trait_SimPreference_Likes_Activities_Fishing')).toEqual({
      group: 'Activities',
      label: 'Fishing',
    });
    expect(preferenceParts('trait_SimPreference_Dislikes_Communication_DeepThoughts')).toEqual({
      group: 'Conversation Topics',
      label: 'Deep Thoughts',
    });
    expect(preferenceParts('trait_SimPreference_Likes_Characteristic_HardWorker')).toEqual({
      group: 'Types of Sims',
      label: 'Hard Worker Sims',
    });
    expect(preferenceParts('trait_Attraction_HairColor_Green_TurnOn')).toEqual({ group: 'Hair Color', label: 'Green' });
    expect(preferenceParts('something a player typed')).toEqual({ label: 'something a player typed' });
  });

  it('spells out the abbreviations in the game files', () => {
    expect(skillWords('NLS (level 9)')).toBe('Natural Living (level 9)');
    expect(preferenceWords('trait_SimPreference_Likes_Activities_NLS')).toBe('Natural Living');
  });

  it('keeps a value a player typed exactly as typed', () => {
    expect(factValueWords(FactPredicate.FEAR, 'being abducted by aliens')).toBe('being abducted by aliens');
    expect(factValueWords(FactPredicate.JOB, "Pub Owner at The Gnome's Arms")).toBe("Pub Owner at The Gnome's Arms");
    expect(jobWords("Pub Owner at The Gnome's Arms")).toBe("you work as Pub Owner at The Gnome's Arms");
    expect(factValueWords(FactPredicate.NOTE, 'Bosun is your dog')).toBe('Bosun is your dog');
  });

  it('drops the skill tier and keeps the level', () => {
    // The game's on-screen names, which is what a sim should say
    expect(skillWords('AdultMajor_HomestyleCooking (level 8)')).toBe('Cooking (level 8)');
    expect(skillWords('AdultMajor_Bartending (level 3)')).toBe('Mixology (level 3)');
    expect(skillWords('AdultMajor_GourmetCooking (level 2)')).toBe('Gourmet Cooking (level 2)');
    expect(skillWords('Hidden_TreadMill_Rock_ClimbingWall_Climb (level 4)')).toBe('Rock Climbing (level 4)');
    expect(skillWords('AdultMinor_Dancing (level 3)')).toBe('Dancing (level 3)');
    expect(skillWords('Toddler_Communication (level 4)')).toBe('Communication (level 4)');
    expect(skillWords('Fitness (level 4)')).toBe('Fitness (level 4)');
  });

  it('says a career the way a person does', () => {
    expect(careerTrackWords('career_Adult_Culinary')).toBe('Culinary');
    expect(careerTrackWords('career_Adult_NPC_Nanny')).toBe('Nanny');
    expect(careerTrackWords('career_Adult_PartTime_Barista')).toBe('Barista (part-time)');
    expect(careerTrackWords('career_Adult_Freelancer_Artist')).toBe('Freelance Artist');
    expect(careerTrackWords('career_Adult_Active_ActorCareer')).toBe('Actor');
    expect(careerTrackWords('careers_Adult_CorporateWorker')).toBe('Corporate Worker');
    expect(careerTrackWords('career_Child_GradeSchool')).toBe('Grade School');
    expect(careerTrackWords('detectiveCareer_1')).toBe('Detective');
    expect(factValueWords(FactPredicate.JOB, 'career_Adult_Business (level 6)')).toBe('Business (level 6)');
    expect(jobWords('career_Adult_NPC_Nanny (level 1)')).toBe('you work in the Nanny career, level 1');
  });

  it('names a lettered aspiration track the way Create a Sim does', () => {
    // Tessa Vale is on Successful Lineage and the store says Track_Family_A (2026-10-13)
    expect(aspirationWords('Track_Family_A')).toBe('Successful Lineage');
    expect(aspirationWords('Track_Popularity_A')).toBe('Friend of the World');
    expect(aspirationWords('Track_Creativity_MasterActor')).toBe('Master Actor');
    expect(aspirationWords('Track_Mental')).toBe('Whiz Kid');
    expect(aspirationParts('Track_Family_A')).toEqual({ name: 'Successful Lineage', category: 'Family' });
    // A letter the table does not know falls back to the category alone
    expect(aspirationWords('Track_Love_Z')).toBe('Love');
    expect(aspirationParts('Track_Love_Z')).toEqual({ name: undefined, category: 'Love' });
  });

  it('reads the career branch off the track the mod sends', () => {
    expect(careerBranchWords('Athletic_Track3_BodyBuilder')).toBe('Bodybuilder');
    expect(careerBranchWords('careerTrack3_Florist')).toBe('Florist');
    expect(careerBranchWords('Athletic_Track1')).toBeUndefined();
    expect(careerBranchWords('careerTrack_NPC_Bartender')).toBeUndefined();
    expect(careerBranchWords(undefined)).toBeUndefined();
    expect(careerParts('career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)')).toEqual({
      track: 'Athletic',
      branch: 'Bodybuilder',
      level: '10',
    });
    expect(factValueWords(FactPredicate.JOB, 'career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)')).toBe(
      'Bodybuilder (Athletic, level 10)',
    );
    expect(jobWords('career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)')).toBe(
      'you work in the Athletic career (Bodybuilder branch), level 10',
    );
  });

  it('keeps a business as its name, with the kind only when it is not a small business', () => {
    expect(businessText('Vale Curios', 'SMALL_BUSINESS')).toBe('Vale Curios');
    expect(businessText('Chez Vale', 'RESTAURANT')).toBe('Chez Vale (restaurant)');
    expect(businessParts('Vale Curios')).toEqual({ name: 'Vale Curios', kind: 'small business' });
    expect(businessParts('Chez Vale (restaurant)')).toEqual({ name: 'Chez Vale', kind: 'restaurant' });
    expect(businessWords('Vale Curios')).toBe('you own a small business, Vale Curios');
    expect(businessWords('Paws (vet clinic)')).toBe('you own a vet clinic, Paws');
  });

  it('says the enum values in lower-case words', () => {
    expect(factValueWords(FactPredicate.AGE_STAGE, 'YOUNGADULT')).toBe('young adult');
    expect(factValueWords(FactPredicate.SPECIES, 'SMALLDOG')).toBe('small dog');
    expect(factValueWords(FactPredicate.OCCULT, 'FAIRY')).toBe('fairy');
    expect(factValueWords(FactPredicate.DEATH_TYPE, 'KillerRabbit')).toBe('Killer Rabbit');
    expect(factValueWords(FactPredicate.DEATH_TYPE, 'OLD_AGE')).toBe('old age');
  });

  it('reads the romantic bits as well as the family ones', () => {
    expect(familyBitWords('romantic-Married')).toBe('married');
    expect(familyBitWords('romantic-Significant_Other')).toBe('significant other');
    expect(factValueWords(FactPredicate.FAMILY_BIT, 'family_Target_IsSonOrDaughterOf_Actor')).toBe('child');
  });
});
