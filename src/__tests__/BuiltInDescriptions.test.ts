import { describe, expect, it } from 'vitest';
import {
  defaultLocationDescriptions,
  defaultLotDescription,
} from 'main/sentient-sims/descriptions/locationDescriptions';
import { placeDescriptionProblems } from 'main/sentient-sims/util/lotDescription';

// The shipped defaults ride in every scene prompt set on their lot, so they are held to the
// same gate as a generated description, plus the sheet's "no people" rule: the scene writer
// took every bartender and guest in the old texts literally (format experiment, 2026-10-15).

const PEOPLE =
  /\b(she|he|his|her|hers|him|you|your|owner|owners|resident|residents|visitor|visitors|guest|guests|bartender|bartenders|member|members|staff|patron|patrons|customer|customers|family|families|roommate|roommates|scientists?|lives here|live here)\b/i;

const described = [...defaultLocationDescriptions.values()].filter(
  (location) => location.description !== defaultLotDescription,
);

describe('built-in lot descriptions', () => {
  it('ship for every lot the sheet has reviewed, with the two unknown lots on the stock text', () => {
    expect(described.length).toBeGreaterThanOrEqual(80);
    expect(defaultLocationDescriptions.size - described.length).toBe(2);
  });

  it('pass the generated-description gate: no person, no moment, 1-4 sentences', () => {
    const failures = described
      .map((location) => ({
        name: location.name,
        problems: placeDescriptionProblems(
          location.description,
          location.lot_type === 'Residence' ? 'venue_residential' : undefined,
        ),
      }))
      .filter((entry) => entry.problems.length > 0);
    expect(failures).toEqual([]);
  });

  it('put nobody in the place', () => {
    const failures = described
      .map((location) => {
        // The lot's own name may carry a word ("Hermit's House", "Specter Family Manor")
        const text = location.description.split(location.name).join(' ');
        return { name: location.name, hit: PEOPLE.exec(text)?.[0] };
      })
      .filter((entry) => entry.hit);
    expect(failures).toEqual([]);
  });

  it('start with the name and read in the present tense', () => {
    const odd = described.filter(
      (location) =>
        !location.description
          .toLowerCase()
          .replace(/^the /, '')
          .startsWith(location.name.toLowerCase().replace(/^the /, '')) ||
        /\b(was|were|stood|had|boasted)\b/.test(location.description.split('.')[0]),
    );
    expect(odd.map((location) => location.name)).toEqual([]);
  });
});
