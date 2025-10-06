import { LocationEntity } from '../db/entities/LocationEntity';
import { getCareerTrackLevel } from '../descriptions/careerDescriptions';
import { moodDescriptions } from '../descriptions/moodDescriptions';
import { getSexCategory, getSexLocation } from '../descriptions/wwDescriptions';
import { SSEnvironment, SSSeasonSegment, SSSeasonType } from '../models/InteractionEvents';
import { SentientSim } from '../models/SentientSim';
import { SimAge } from '../models/SimAge';
import { removeEmojis } from '../util/filter';
import { traitDescriptions } from '../descriptions/traitDescriptions';
import { TraitType } from '../models/TraitType';

export enum BodyState {
  OUTFIT = 1,
  UNDERWEAR = 2,
  NUDE = 3,
}

export type ActorMapping = {
  formatted: string;
  actor: string;
  mapping: string;
};

export function formatListToString(items: string[]): string {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return items.join(' and ');
  }
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function formatMoods(moods: string[]): string[] {
  return moods
    .filter(
      (mood) => mood in moodDescriptions && !moodDescriptions[mood]?.ignored && moodDescriptions[mood]?.description,
    )
    .map((mood) => moodDescriptions[mood].description as string);
}

function formatAge(age: SimAge): string {
  switch (age) {
    case SimAge.BABY:
      return 'baby';
    case SimAge.INFANT:
      return 'infant';
    case SimAge.TODDLER:
      return 'toddler';
    case SimAge.CHILD:
      return 'child';
    case SimAge.TEEN:
      return 'teen';
    case SimAge.YOUNGADULT:
      return 'young adult';
    case SimAge.ADULT:
      return 'adult';
    case SimAge.ELDER:
      return 'elder';
    default:
      return 'unknown age';
  }
}

function formatCareers(sentientSim: SentientSim): string[] {
  const formattedCareers: string[] = [];

  sentientSim.careers.forEach((career) => {
    const careerDescription = getCareerTrackLevel(career);
    if (careerDescription) {
      const description = careerDescription.sentient_sims_description;
      const formattedCareer = description.replaceAll('{sim_name}', sentientSim.name);
      formattedCareers.push(formattedCareer);
    }
  });

  return formattedCareers;
}

export function hasWWProperties(sentientSim: SentientSim): boolean {
  return sentientSim.upper_body !== undefined && sentientSim.lower_body !== undefined;
}

export function formatWWProperties(sentientSim: SentientSim) {
  const upperBody = sentientSim.upper_body;
  const lowerBody = sentientSim.lower_body;

  if (upperBody === BodyState.NUDE && lowerBody === BodyState.NUDE) {
    return `${sentientSim.name} is completely naked.`;
  }
  if (upperBody === BodyState.NUDE && lowerBody === BodyState.OUTFIT) {
    return `${sentientSim.name} is completely naked on top and fully clothed below the waist.`;
  }
  if (upperBody === BodyState.NUDE && lowerBody === BodyState.UNDERWEAR) {
    return `${sentientSim.name} is completely naked on top and only wearing underwear below the waist.`;
  }
  if (upperBody === BodyState.OUTFIT && lowerBody === BodyState.OUTFIT) {
    return `${sentientSim.name} is fully clothed.`;
  }
  if (upperBody === BodyState.OUTFIT && lowerBody === BodyState.UNDERWEAR) {
    return `${sentientSim.name} is fully clothed on top and only wearing underwear below the waist.`;
  }
  if (upperBody === BodyState.OUTFIT && lowerBody === BodyState.NUDE) {
    return `${sentientSim.name} is fully clothed on top and naked below the waist.`;
  }
  if (upperBody === BodyState.UNDERWEAR && lowerBody === BodyState.UNDERWEAR) {
    return `${sentientSim.name} is only wearing underwear.`;
  }
  if (upperBody === BodyState.UNDERWEAR && lowerBody === BodyState.NUDE) {
    if (sentientSim.gender === 'Male') {
      return `${sentientSim.name} is completely naked.`;
    }
    return `${sentientSim.name} is wearing underwear on top and fully naked below the waist.`;
  }
  if (upperBody === BodyState.UNDERWEAR && lowerBody === BodyState.OUTFIT) {
    if (sentientSim.gender === 'Male') {
      return `${sentientSim.name} is shirtless and fully clothed below the waist.`;
    }
    return `${sentientSim.name} is wearing underwear shirtless on top and fully clothed below the waist.`;
  }

  return undefined;
}

function formatProperties(sentientSim: SentientSim): string[] {
  const formattedProperties: string[] = [];

  if (sentientSim.is_ghost) {
    formattedProperties.push('is a dead translucent ghost');
  }

  if (sentientSim.in_pool) {
    formattedProperties.push('is in the water in the pool');
  }

  if (sentientSim.on_fire) {
    formattedProperties.push('is currently burning on fire with flames on their clothing');
  }

  if (sentientSim.is_dying) {
    formattedProperties.push('is actively dying with the Grim Reaper present about to take their life');
  }

  return formattedProperties;
}

export function formatSentientSim(sentientSim: SentientSim): string {
  const likes: string[] = [];
  const dislikes: string[] = [];
  const attractions: string[] = [];
  const turnOffs: string[] = [];
  const fears: string[] = [];
  const genericTraits: string[] = [];
  sentientSim.traits
    .filter((trait) => trait in traitDescriptions)
    .map((trait) => traitDescriptions[trait])
    .filter((trait) => !trait?.ignored && trait?.description)
    .forEach((trait) => {
      if (trait.trait_type === TraitType.LIKE) {
        if (trait.class === 'AttractionPreference') {
          attractions.push(trait.description as string);
        } else {
          likes.push(trait.description as string);
        }
      } else if (trait.trait_type === TraitType.DISLIKE) {
        if (trait.class === 'AttractionPreference') {
          turnOffs.push(trait.description as string);
        } else {
          dislikes.push(trait.description as string);
        }
      } else if (trait.trait_type === TraitType.FEAR) {
        fears.push(trait.description as string);
      } else {
        genericTraits.push(trait.description as string);
      }
    });

  const moods = formatMoods(sentientSim.moods);
  const careers = formatCareers(sentientSim);
  const properties = formatProperties(sentientSim);

  const prompt = [`${sentientSim.name} is a ${sentientSim.gender} ${formatAge(sentientSim.age)}.`];

  if (likes.length > 0) {
    prompt.push(`${sentientSim.name} likes ${formatListToString(likes)}.`);
  }

  if (dislikes.length > 0) {
    prompt.push(`${sentientSim.name} hates ${formatListToString(dislikes)}.`);
  }

  if (attractions.length > 0) {
    prompt.push(`${sentientSim.name} is attracted to a partner who ${formatListToString(attractions)}.`);
  }

  if (turnOffs.length > 0) {
    prompt.push(`${sentientSim.name} is turned off by a partner who ${formatListToString(turnOffs)}.`);
  }

  if (fears.length > 0) {
    prompt.push(`${sentientSim.name} fears ${formatListToString(fears)}.`);
  }

  if (genericTraits.length > 0) {
    prompt.push(`${sentientSim.name} ${formatListToString(genericTraits)}.`);
  }

  if (moods.length > 0) {
    prompt.push(`${sentientSim.name} ${formatListToString(moods)}.`);
  }

  if (sentientSim.description) {
    let { description } = sentientSim;

    if (!description.endsWith('!') && !description.endsWith('.')) {
      description += '.';
    }

    prompt.push(description);
  }

  if (careers.length > 0) {
    prompt.push(careers.join(' '));
  }

  if (hasWWProperties(sentientSim)) {
    const formattedWWProperties = formatWWProperties(sentientSim);
    if (formattedWWProperties) {
      prompt.push(formattedWWProperties);
    }
  }

  if (properties.length > 0) {
    prompt.push(`${sentientSim.name} ${formatListToString(properties)}`);
  }

  return prompt.join(' ');
}

export function formatAction(
  action: string,
  sentientSims: SentientSim[],
  location: LocationEntity,
  sexCategoryType?: number,
  sexLocationType?: number,
) {
  let formattedAction = action;

  if (formattedAction.includes('{non_initiator_participants}') && sentientSims.length > 1) {
    const sentientSimNames = [];
    for (let i = 1; i < sentientSims.length; i++) {
      sentientSimNames.push(sentientSims[i].name);
    }
    formattedAction = formattedAction.replaceAll('{non_initiator_participants}', formatListToString(sentientSimNames));
  }

  if (formattedAction.includes('{participants}')) {
    const sentientSimNames = sentientSims.map((sim) => sim.name);
    formattedAction = formattedAction.replaceAll('{participants}', formatListToString(sentientSimNames));
  }

  formattedAction = formattedAction.replaceAll('{location}', location.name);
  formattedAction = formattedAction.replaceAll('{location_type}', location.lot_type);
  formattedAction = formattedAction.replaceAll('{location_description}', location.description);

  for (let i = 0; i < sentientSims.length; i++) {
    formattedAction = formattedAction.replaceAll(`{actor.${i}}`, sentientSims[i].name);

    if (sentientSims[i].gender === 'Male') {
      formattedAction = formattedAction.replaceAll(`{actor.${i}.he/she}`, 'he');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.him/her}`, 'him');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.his/her}`, 'his');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.himself/herself}`, 'himself');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.uncle/aunt}`, 'uncle');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.brother/sister}`, 'brother');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.husband/wife}`, 'husband');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.nephew/niece}`, 'nephew');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.son/daughter}`, 'son');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.dad/mom}`, 'dad');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.father/mother}`, 'father');
    } else {
      formattedAction = formattedAction.replaceAll(`{actor.${i}.he/she}`, 'she');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.him/her}`, 'her');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.his/her}`, 'her');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.himself/herself}`, 'herself');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.uncle/aunt}`, 'aunt');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.brother/sister}`, 'sister');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.husband/wife}`, 'wife');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.nephew/niece}`, 'niece');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.son/daughter}`, 'daughter');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.dad/mom}`, 'mom');
      formattedAction = formattedAction.replaceAll(`{actor.${i}.father/mother}`, 'mother');
    }

    if (sexCategoryType) {
      const sexCategory = getSexCategory(sexCategoryType);
      if (sexCategory) {
        formattedAction = formattedAction.replaceAll(`{sex_category}`, sexCategory);
      }
    }

    if (sexLocationType) {
      const sexLocation = getSexLocation(sexLocationType);
      if (sexLocation) {
        formattedAction = formattedAction.replaceAll(`{sex_location}`, sexLocation);
      }
    }
  }

  return formattedAction;
}

export function getMappingStringReplacementPairs(sentientSims?: SentientSim[]): ActorMapping[] {
  const mappings: ActorMapping[] = [];

  if (!sentientSims) {
    return mappings;
  }

  sentientSims.forEach((sentientSim, index) => {
    if (sentientSim.gender === 'Male') {
      mappings.push({
        formatted: 'he',
        actor: `{actor.${index}.he/she}`,
        mapping: `he.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'him',
        actor: `{actor.${index}.him/her}`,
        mapping: `him.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'his',
        actor: `{actor.${index}.his/her}`,
        mapping: `his.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'himself',
        actor: `{actor.${index}.himself/herself}`,
        mapping: `himself.${sentientSim.name}`,
      });
    } else {
      mappings.push({
        formatted: 'she',
        actor: `{actor.${index}.he/she}`,
        mapping: `she.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'her',
        actor: `{actor.${index}.him/her}`,
        mapping: `her.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'her',
        actor: `{actor.${index}.his/her}`,
        mapping: `her.${sentientSim.name}`,
      });
      mappings.push({
        formatted: 'herself',
        actor: `{actor.${index}.himself/herself}`,
        mapping: `herself.${sentientSim.name}`,
      });
    }
    mappings.push({
      formatted: sentientSim.name,
      actor: `{actor.${index}}`,
      mapping: sentientSim.name,
    });
  });

  return mappings;
}

export function getMappingStringErrorPairs(sentientSims?: SentientSim[]) {
  const errors: Map<string, string> = new Map(
    Object.entries({
      he: 'Replace he with he.Firstname Lastname',
      him: 'Replace him with him.Firstname Lastname',
      his: 'Replace his with his.Firstname Lastname',
      himself: 'Replace himself with himself.Firstname Lastname',
      she: 'Replace she with she.Firstname Lastname',
      her: 'Replace her with her.Firstname Lastname',
      herself: 'Replace himself with herself.Firstname Lastname',
    }),
  );

  if (!sentientSims) {
    return errors;
  }

  sentientSims.forEach((sentientSim) => {
    const name = sentientSim.name.trim();
    const spaceIndex = name.indexOf(' ');
    if (spaceIndex !== -1) {
      errors.set(name.substring(0, spaceIndex), 'Use the full name of the sim when describing the animation');
      errors.set(name.substring(spaceIndex + 1), 'Use the full name of the sim when describing the animation');
    }
  });

  return errors;
}

export function removeLastParagraph(text: string): string {
  const paragraphs = text.split('\n');

  if (paragraphs.length > 2) {
    paragraphs.pop();
  }

  return paragraphs.join('\n').trim();
}

export function trimIncompleteSentence(text: string): string {
  const lastPunctIndex = Math.max(text.lastIndexOf('.'), text.lastIndexOf('?'), text.lastIndexOf('!'));

  if (lastPunctIndex >= 0) {
    return text.substring(0, lastPunctIndex + 1);
  }

  return text;
}

export function getFirstWord(sentence: string): string {
  const words = sentence.split(/\s+/);

  return words[0] || '';
}

export function removeNonLetters(input: string): string {
  return input.replace(/[^a-zA-Z]/g, '');
}

export function removeStopTokens(text: string, stopTokens?: string[]) {
  let output = text;

  if (stopTokens && stopTokens.length > 0) {
    stopTokens.forEach((stopToken) => {
      if (output.startsWith(stopToken)) {
        output = output.slice(stopToken.length).trimStart();
      }
      output = output.split(stopToken, 1)[0].trim();
    });
  }

  return output;
}

export function cleanupAIOutput(text: string, stopTokens?: string[]): string {
  let output: string = text.trim();

  const index = output.indexOf(':');
  output = index !== -1 ? output.substring(index + 1) : output;
  output = output.replaceAll('*', '');
  output = removeStopTokens(output, stopTokens);
  output = removeLastParagraph(output);
  output = trimIncompleteSentence(output);
  output = removeEmojis(output);

  return output.trim();
}

export function cleanAIClassificationOutput(text: string): string {
  let output: string = text.trim();

  output = getFirstWord(output);
  output = removeNonLetters(output);

  return output.trim().toLowerCase();
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatDateTime(environment: SSEnvironment): string {
  const dayName = daysOfWeek[environment.time.day];

  const minute = environment.time.minute.toString().padStart(2, '0');

  // Determine AM or PM part and convert hour to 12-hour format.
  const amPm = environment.time.hour >= 12 ? 'PM' : 'AM';
  const hourIn12HourFormat = environment.time.hour % 12 || 12; // Convert 0 hour to 12 for 12 AM.

  return `<DATE>The day is ${dayName} at ${hourIn12HourFormat}:${minute} ${amPm}.</DATE>`;
}

export function formatSeason(environment: SSEnvironment): string {
  let segmentString = '';
  switch (environment.season?.season_segment) {
    case SSSeasonSegment.EARLY:
      segmentString += 'Early';
      break;
    case SSSeasonSegment.MID:
      segmentString += 'Mid';
      break;
    case SSSeasonSegment.LATE:
      segmentString += 'Late';
      break;
    default:
      segmentString += 'Eternal';
      break;
  }

  let seasonString = '';
  switch (environment.season?.season_type) {
    case SSSeasonType.SPRING:
      seasonString += 'Spring';
      break;
    case SSSeasonType.WINTER:
      seasonString += 'Winter';
      break;
    case SSSeasonType.FALL:
      seasonString += 'Fall';
      break;
    case SSSeasonType.SUMMER:
    default:
      seasonString += 'Summer';
      break;
  }

  return `<SEASON>${segmentString} ${seasonString}</SEASON>`;
}
