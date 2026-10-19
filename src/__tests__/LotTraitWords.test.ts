import {
  allLotTraitWords,
  lotTraitLine,
  lotTraitName,
  lotTraitWords,
  traitKey,
} from 'main/sentient-sims/util/lotTraitWords';

// Lot traits read as the Build mode panel names them, with one clause each in the lot's own
// terms. The tuning names here are the ones the mod sent live on 2026-10-17 plus the game's
// own list of zone modifiers.

describe('lotTraitWords', () => {
  it('reads the tuning names the game sends as the panel names (live 2026-10-17)', () => {
    expect(lotTraitWords('zoneModifier_lotTrait_FreshAir')).toEqual({
      name: 'Bracing Breezes',
      flavor: 'oodles of fresh air, bracing for exercise',
      challenge: false,
    });
    expect(lotTraitWords('zoneModifier_lotTrait_GreatAcoustics').name).toBe('Great Acoustics');
    expect(lotTraitWords('zoneModifier_lotTrait_BurglarTime')).toEqual({
      name: 'Heist Havoc',
      flavor: 'burglars like this lot, and the alarms have a mind of their own',
      challenge: true,
    });
    expect(lotTraitWords('zoneModifier_lotTrait_CelebrityHangOut_LowFame').name).toBe('Up-and-Coming Hotspot');
    expect(lotTraitWords('zoneModifier_lotTrait_CelebrityHangOut_HighFame').name).toBe('Hottest Spot in Town');
    expect(lotTraitWords('zoneModifier_lotTrait_Singles_Hangout').name).toBe('Singles Hangout');
    expect(lotTraitWords('zoneModifier_lotTrait_NaturalLight').name).toBe('Natural Light');
    expect(lotTraitWords('zoneModifier_lotTrait_Convivial').name).toBe('Convivial');
  });

  it('knows the one the game spells with a plural prefix and a suffix (Celebrity Home)', () => {
    expect(lotTraitWords('zoneModifiers_lotTrait_CelebrityHomeLotTrait').name).toBe('Celebrity Home');
    expect(lotTraitName('zoneModifiers_lotTrait_CelebrityHomeLotTrait')).toBe('Celebrity Home Lot Trait');
  });

  it('strips category words, creator prefixes and WickedWhims plumbing before the lookup', () => {
    expect(traitKey('lotTrait_Generic_PeaceAndQuiet')).toBe('peaceandquiet');
    expect(lotTraitWords('lotTrait_Generic_PeaceAndQuiet').name).toBe('Peace and Quiet');
    expect(lotTraitWords('zoneModifier_pro_Quiet').name).toBe('Quiet');
    expect(lotTraitWords('zoneModifier_PetWorld_CatFriendly').name).toBe('Cat Friendly');
    expect(lotTraitWords('zoneModifier_LotTraits_Foxes')).toMatchObject({ name: 'Wild Foxes', challenge: true });
    expect(lotTraitWords('zoneModifier_LotTrait_TrashUpdate').name).toBe('Reduce and Recycle');
    expect(lotTraitWords('TURBODRIVER:WickedWhims_ZoneModifier_LotTrait_Nudity_CasualNudity')).toEqual({
      name: 'Casual Nudity',
      challenge: false,
    });
  });

  it('tells the haunted apartment from the Spooky challenge', () => {
    expect(lotTraitWords('zoneModifier_con_Haunted')).toMatchObject({ name: 'Haunted', challenge: false });
    expect(lotTraitWords('zoneModifier_lotTrait_Haunted')).toMatchObject({ name: 'Spooky', challenge: true });
  });

  it('falls back to the tuning name in words for a trait it does not know', () => {
    expect(lotTraitWords('zoneModifier_lotTrait_SomethingNew')).toEqual({ name: 'Something New', challenge: false });
    expect(lotTraitWords('x_Quirk')).toEqual({ name: 'x Quirk', challenge: false });
  });

  it('pins every entry: a panel name, a clause with no person, no rule and no full stop', () => {
    const entries = allLotTraitWords();
    expect(entries.length).toBeGreaterThanOrEqual(75);
    const names = new Set<string>();
    for (const entry of entries) {
      expect(entry.name, entry.key).toMatch(/^[A-Z]/);
      expect(entry.flavor, entry.key).toBeTruthy();
      expect(entry.flavor, entry.key).not.toMatch(/\.$/);
      expect(entry.flavor, entry.key).not.toMatch(/\b(you|your|she|he|sims?|visitor|guest|someone)\b/i);
      expect(entry.flavor, entry.key).not.toMatch(/\d+%|moodlet|skill gain|boost/i);
      expect(lotTraitWords(`zoneModifier_lotTrait_${entry.key}`).name, entry.key).toBe(entry.name);
      names.add(entry.name);
    }
    // Two keys may share a name (the Celebrity Home spellings, Teen Neighborhood) but never a clause that differs
    const byName = new Map<string, string>();
    for (const entry of entries) {
      const seen = byName.get(entry.name);
      if (seen) {
        expect(entry.flavor, entry.name).toBe(seen);
      }
      byName.set(entry.name, entry.flavor ?? '');
    }
  });
});

describe('lotTraitLine', () => {
  const traits = [
    'zoneModifier_lotTrait_GreatAcoustics',
    'zoneModifier_lotTrait_FreshAir',
    'zoneModifier_lotTrait_BurglarTime',
  ];

  it('writes panel names with their clause, the challenges after a semicolon', () => {
    expect(lotTraitLine(traits, ['zoneModifier_lotTrait_BurglarTime'])).toBe(
      'Lot traits: Great Acoustics (the acoustics are perfect, a good place to play music), Bracing Breezes (oodles of fresh air, bracing for exercise); lot challenges: Heist Havoc (burglars like this lot, and the alarms have a mind of their own)',
    );
  });

  it('splits challenges from the table alone when the mod sent no lot_challenges', () => {
    expect(lotTraitLine(traits)).toContain('; lot challenges: Heist Havoc');
  });

  it('can leave the clauses out, and drops a name sent twice', () => {
    expect(lotTraitLine([...traits, 'zoneModifier_lotTrait_FreshAir'], [], { flavor: false })).toBe(
      'Lot traits: Great Acoustics, Bracing Breezes; lot challenges: Heist Havoc',
    );
  });

  it('is nothing for no traits, and a challenges line when every trait is one', () => {
    expect(lotTraitLine([])).toBeUndefined();
    expect(lotTraitLine(['zoneModifier_lotTrait_Gremlins'], [], { flavor: false })).toBe('Lot challenges: Gremlins');
  });
});
