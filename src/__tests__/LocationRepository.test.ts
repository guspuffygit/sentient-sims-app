import * as fs from 'fs';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { LocationRepository } from 'main/sentient-sims/db/LocationRepository';
import { OnlineLocation } from 'main/sentient-sims/db/OnlineLocationRepository';
import { defaultLotDescription } from 'main/sentient-sims/descriptions/locationDescriptions';
import { mockApiContext } from './util';

function locationsAreEqual(a: LocationEntity, b: LocationEntity): boolean {
  return a.id === b.id && a.description === b.description && a.name === b.name && a.lot_type === b.lot_type;
}

describe('LocationRepository', () => {
  it('is_generic', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '1237632',
      saveId: '2',
    });

    // Check generic location is returned when id doesnt exist in defaultLocationDescriptions
    const result = ctx.locationRepository.getLocation({ id: 11111 });
    expect(result.is_generic).toBeTruthy();

    // Check default location description is returned
    const defaultResult = ctx.locationRepository.getLocation({
      id: 254110336,
    });
    expect(defaultResult.is_generic).toBeFalsy();
    expect(defaultResult.name).toEqual('The Futures Past');
  });

  it('CRUD', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '1231237632',
      saveId: '2',
    });

    const locationId = 254110336;

    const expectedResult: LocationEntity = {
      id: locationId,
      name: 'New Name',
      lot_type: 'New Lot Type',
      description: 'New description',
    };
    ctx.locationRepository.updateLocation(expectedResult);
    const result = ctx.locationRepository.getLocation({ id: locationId });
    expect(locationsAreEqual(result, expectedResult)).toBeTruthy();

    const allLocations = ctx.locationRepository.getAllLocations();
    expect(allLocations.some((item) => item.id === expectedResult.id)).toBeTruthy();

    const modifiedLocations = ctx.locationRepository.getModifiedLocations();
    expect(modifiedLocations.some((item) => item.id === expectedResult.id)).toBeTruthy();

    const defaultLocations = ctx.locationRepository.getDefaultLocations();
    expect(
      defaultLocations.some((item) => item.id === expectedResult.id && item.description === expectedResult.description),
    ).toBeFalsy();

    ctx.locationRepository.deleteLocation({ id: locationId });
    const defaultResult = ctx.locationRepository.getLocation({
      id: locationId,
    });
    expect(defaultResult.name).toEqual('The Futures Past');
  });

  describe('defaults', () => {
    // Rattlesnake Juice ships a built-in description; 1593901060 (JF&S Clothiers) has none
    const RATTLESNAKE = 254075440;
    const CLOTHIERS = 1593901060;

    function repository(saveId: string, online: Record<string, OnlineLocation> = {}) {
      const ctx = mockApiContext();
      fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
      ctx.db.loadDatabase({ sessionId: `loc-${saveId}`, saveId });
      const shared = new Map(Object.entries(online));
      return new LocationRepository(ctx.db, { peek: () => shared });
    }

    const sharedClothiers: OnlineLocation = {
      id: CLOTHIERS,
      name: 'JF&S Clothiers',
      lot_type: 'Shop',
      description: 'A narrow tailor shop lined with bolts of cloth.',
    };

    it('resolves the save, then the shared default, then the built-in, then the stock text', () => {
      const repo = repository('20', { [CLOTHIERS]: sharedClothiers });

      expect(repo.getLocation({ id: CLOTHIERS })).toMatchObject({ source: 'online', lot_type: 'Shop' });
      expect(repo.getLocation({ id: RATTLESNAKE })).toMatchObject({ source: 'built-in', lot_type: 'Bar' });
      expect(repo.getLocation({ id: 4242 })).toMatchObject({ source: 'stock', is_generic: true });

      repo.updateLocation({ id: CLOTHIERS, name: 'JF&S Clothiers', lot_type: 'Shop', description: 'My own words.' });
      const own = repo.getLocation({ id: CLOTHIERS });
      expect(own).toMatchObject({ source: 'save', description: 'My own words.' });
      expect(own.default?.description).toEqual(sharedClothiers.description);

      // Restore to Default
      repo.deleteLocation({ id: CLOTHIERS });
      expect(repo.getLocation({ id: CLOTHIERS }).description).toEqual(sharedClothiers.description);
    });

    it('a shared default beats the built-in one', () => {
      const shared = { ...sharedClothiers, id: RATTLESNAKE, name: 'Rattlesnake Juice', lot_type: 'Bar' };
      const repo = repository('21', { [RATTLESNAKE]: shared });
      expect(repo.getLocation({ id: RATTLESNAKE })).toMatchObject({
        source: 'online',
        description: shared.description,
      });
    });

    it('treats a stored row still on the stock text as no row', () => {
      const repo = repository('22', { [CLOTHIERS]: sharedClothiers });
      repo.updateLocation({
        id: CLOTHIERS,
        name: 'JF&S Clothiers',
        lot_type: 'Residence',
        description: defaultLotDescription,
      });
      expect(repo.getLocation({ id: CLOTHIERS })).toMatchObject({ source: 'online', lot_type: 'Shop' });

      repo.updateLocation({
        id: 4243,
        name: 'Laguna del Abrazo',
        lot_type: 'Residence',
        description: defaultLotDescription,
      });
      expect(repo.getLocation({ id: 4243 })).toMatchObject({
        source: 'stock',
        is_generic: true,
        name: 'Laguna del Abrazo',
      });
    });

    it('a generated description yields to a default; the player editing it makes it theirs', () => {
      const shared = new Map<string, OnlineLocation>();
      const ctx = mockApiContext();
      fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
      ctx.db.loadDatabase({ sessionId: 'loc-23', saveId: '23' });
      const repo = new LocationRepository(ctx.db, { peek: () => shared });
      expect(
        repo.setDescriptionIfGeneric(repo.getLocation({ id: CLOTHIERS }), 'An AI guess.', 'JF&S Clothiers', 'Shop'),
      ).toBeTruthy();
      expect(repo.getLocation({ id: CLOTHIERS })).toMatchObject({ source: 'generated', lot_type: 'Shop' });

      // The shared default lands later: it replaces the guess without anyone pressing anything
      shared.set(String(CLOTHIERS), sharedClothiers);
      const later = repo;
      expect(later.getLocation({ id: CLOTHIERS })).toMatchObject({ source: 'online' });

      later.updateLocation({
        id: CLOTHIERS,
        name: 'JF&S Clothiers',
        lot_type: 'Shop',
        description: 'An AI guess, edited.',
      });
      expect(later.getLocation({ id: CLOTHIERS })).toMatchObject({ source: 'save' });
    });

    it('never generates over a default or a description a person wrote', () => {
      const repo = repository('24', { [CLOTHIERS]: sharedClothiers });
      expect(repo.setDescriptionIfGeneric(repo.getLocation({ id: CLOTHIERS }), 'An AI guess.')).toBeFalsy();
      expect(repo.setDescriptionIfGeneric(repo.getLocation({ id: RATTLESNAKE }), 'An AI guess.')).toBeFalsy();

      repo.updateLocation({ id: 4244, name: 'Den', lot_type: 'Hideout', description: 'Typed by hand.' });
      expect(repo.setDescriptionIfGeneric(repo.getLocation({ id: 4244 }), 'An AI guess.')).toBeFalsy();
    });

    it('keeps a lot type a person chose', () => {
      const repo = repository('25');
      repo.updateLocation({ id: 4245, name: 'Den', lot_type: 'Hideout', description: '' });
      repo.setDescriptionIfGeneric(repo.getLocation({ id: 4245 }), 'An AI guess.', undefined, 'Residence');
      expect(repo.getLocation({ id: 4245 }).lot_type).toEqual('Hideout');
    });

    it('lists every source once, with the built-in names kept', () => {
      const repo = repository('26', { [CLOTHIERS]: sharedClothiers });
      const all = repo.getAllLocations();
      expect(all.filter((location) => location.id === CLOTHIERS)).toHaveLength(1);
      expect(all.find((location) => location.id === 3996254301)?.name).toEqual('The Inked Inlet');
    });
  });
});
