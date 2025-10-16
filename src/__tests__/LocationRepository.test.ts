import '@testing-library/jest-dom';
import * as fs from 'fs';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { mockApiContext } from './util';

function locationsAreEqual(a: LocationEntity, b: LocationEntity): boolean {
  return a.id === b.id && a.description === b.description && a.name === b.name && a.lot_type === b.lot_type;
}

describe('LocationRepository', () => {
  it('is_generic', async () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    await ctx.db.loadDatabase({
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

  it('CRUD', async () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    await ctx.db.loadDatabase({
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
});
