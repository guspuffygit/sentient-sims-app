import { traitDescriptions } from 'main/sentient-sims/descriptions/traitDescriptions';
import { moodDescriptions } from 'main/sentient-sims/descriptions/moodDescriptions';
import { careerDescriptions } from 'main/sentient-sims/descriptions/careerDescriptions';
import { defaultLocationDescriptions } from 'main/sentient-sims/descriptions/locationDescriptions';
import { interactionDescriptions } from 'main/sentient-sims/descriptions/interactionDescriptions';

export type TraitOption = { key: string; label: string };
export type CareerOption = { careerKey: string; trackKey: string; level: number; label: string };
export type LocationOption = { id: number; label: string };
export type InteractionOption = { key: string; label: string; sampleAction?: string };

export function getTraitOptions(): TraitOption[] {
  return Object.entries(traitDescriptions)
    .filter(([, trait]) => !trait.ignored && trait.description)
    .map(([key, trait]) => ({ key, label: `${key} — ${trait.description}` }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function getMoodOptions(): TraitOption[] {
  return Object.entries(moodDescriptions)
    .filter(([, mood]) => !mood.ignored && mood.description)
    .map(([key, mood]) => ({ key, label: `${key} — ${mood.description}` }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function getCareerOptions(): CareerOption[] {
  const options: CareerOption[] = [];
  Object.entries(careerDescriptions).forEach(([careerKey, tracks]) => {
    Object.entries(tracks).forEach(([trackKey, levels]) => {
      Object.entries(levels).forEach(([levelKey, levelDetail]) => {
        const level = Number(levelKey);
        options.push({
          careerKey,
          trackKey,
          level,
          label: `${levelDetail.name} (Level ${level})`,
        });
      });
    });
  });
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function getLocationOptions(): LocationOption[] {
  return Array.from(defaultLocationDescriptions.values())
    .map((location) => ({ id: location.id, label: `${location.name} (${location.lot_type})` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getInteractionOptions(): InteractionOption[] {
  const options: InteractionOption[] = [];
  interactionDescriptions.forEach((description, key) => {
    if (description.ignored || !description.pre_actions || description.pre_actions.length === 0) {
      return;
    }
    options.push({ key, label: key, sampleAction: description.pre_actions[0] });
  });
  return options.sort((a, b) => a.key.localeCompare(b.key));
}
