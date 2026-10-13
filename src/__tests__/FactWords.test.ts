import { describe, expect, it } from 'vitest';
import { FactPredicate } from 'main/sentient-sims/pipeline/facts/predicates';
import {
  aspirationWords,
  careerTrackWords,
  factValueWords,
  familyBitWords,
  preferenceWords,
  skillWords,
  traitWords,
} from 'main/sentient-sims/util/factWords';
import { jobWords } from 'main/sentient-sims/util/renderKnownFacts';

// The game's identifiers said in plain words, for the prompt and the Facts window alike.
// Every shape here was read off a live database on 2026-10-12.
describe('fact words', () => {
  it('names a pet trait with its species, because the dog Glutton is not the sim Glutton', () => {
    expect(traitWords('trait_Pet_Glutton_Dog')).toBe('Glutton (Dog)');
    expect(traitWords('trait_Pet_Hairy_Cat')).toBe('Hairy (Cat)');
    expect(traitWords('trait_Pet_Wanderlust_Dog')).toBe('Wanderlust (Dog)');
  });

  it('drops the age prefix and splits the words of a sim trait', () => {
    expect(traitWords('trait_HotHeaded')).toBe('Hot Headed');
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
    expect(preferenceWords('trait_SimPreference_Likes_Characteristic_Funny')).toBe('Funny (in people)');
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

  it('keeps a value a player typed exactly as typed', () => {
    expect(factValueWords(FactPredicate.FEAR, 'being abducted by aliens')).toBe('being abducted by aliens');
    expect(factValueWords(FactPredicate.JOB, "Pub Owner at The Gnome's Arms")).toBe("Pub Owner at The Gnome's Arms");
    expect(jobWords("Pub Owner at The Gnome's Arms")).toBe("you work as Pub Owner at The Gnome's Arms");
    expect(factValueWords(FactPredicate.NOTE, 'Bosun is your dog')).toBe('Bosun is your dog');
  });

  it('drops the skill tier and keeps the level', () => {
    expect(skillWords('AdultMajor_HomestyleCooking (level 8)')).toBe('Homestyle Cooking (level 8)');
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

  it('names an aspiration by its track when the game only has a letter for it', () => {
    expect(aspirationWords('Track_Popularity_A')).toBe('Popularity');
    expect(aspirationWords('Track_Creativity_MasterActor')).toBe('Master Actor (Creativity)');
    expect(aspirationWords('Track_Mental')).toBe('Mental');
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
