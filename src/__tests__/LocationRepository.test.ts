import '@testing-library/jest-dom';
import { DbService } from 'main/sentient-sims/services/DbService';
import * as fs from 'fs';
import { LocationRepository } from 'main/sentient-sims/db/LocationRepository';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { mockDirectoryService } from './util';

function locationsAreEqual(a: LocationEntity, b: LocationEntity): boolean {
  return a.id === b.id && a.description === b.description && a.name === b.name && a.lot_type === b.lot_type;
}

describe('LocationRepository', () => {
  it('is_generic', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    await dbService.loadDatabase({
      sessionId: '1237632',
      saveId: '2',
    });
    const locationRepository = new LocationRepository(dbService);

    // Check generic location is returned when id doesnt exist in defaultLocationDescriptions
    const result = locationRepository.getLocation({ id: 11111 });
    expect(result.is_generic).toBeTruthy();

    // Check default location description is returned
    const defaultResult = locationRepository.getLocation({
      id: 254110336,
    });
    expect(defaultResult.is_generic).toBeFalsy();
    expect(defaultResult.name).toEqual('The Futures Past');
  });

  it('CRUD', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    await dbService.loadDatabase({
      sessionId: '1231237632',
      saveId: '2',
    });
    const locationRepository = new LocationRepository(dbService);

    const locationId = 254110336;

    const expectedResult: LocationEntity = {
      id: locationId,
      name: 'New Name',
      lot_type: 'New Lot Type',
      description: 'New description',
    };
    locationRepository.updateLocation(expectedResult);
    const result = locationRepository.getLocation({ id: locationId });
    expect(locationsAreEqual(result, expectedResult)).toBeTruthy();

    const allLocations = locationRepository.getAllLocations();
    expect(allLocations.some((item) => item.id === expectedResult.id)).toBeTruthy();

    const modifiedLocations = locationRepository.getModifiedLocations();
    expect(modifiedLocations.some((item) => item.id === expectedResult.id)).toBeTruthy();

    const defaultLocations = locationRepository.getDefaultLocations();
    expect(
      defaultLocations.some((item) => item.id === expectedResult.id && item.description === expectedResult.description),
    ).toBeFalsy();

    locationRepository.deleteLocation({ id: locationId });
    const defaultResult = locationRepository.getLocation({
      id: locationId,
    });
    expect(defaultResult.name).toEqual('The Futures Past');
  });
});
