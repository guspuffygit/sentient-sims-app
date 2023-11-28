/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { DbService } from 'main/sentient-sims/services/DbService';
import * as fs from 'fs';
import { LocationRepository } from 'main/sentient-sims/db/LocationRepository';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';
import { mockDirectoryService } from './util';

describe('LocationRepository', () => {
  it('is_generic', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    await dbService.loadDatabase('1237632');
    const locationRepository = new LocationRepository(dbService);

    // Check generic location is returned when id doesnt exist in defaultLocationDescriptions
    const result = await locationRepository.getLocation({ id: 11111 });
    expect(result.is_generic).toBeTruthy();

    // Check default location description is returned
    const defaultResult = await locationRepository.getLocation({
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
    await dbService.loadDatabase('1231237632');
    const locationRepository = new LocationRepository(dbService);

    const locationId = 254110336;

    const expectedResult: LocationEntity = {
      id: locationId,
      name: 'New Name',
      lot_type: 'New Lot Type',
      description: 'New description',
    };
    await locationRepository.updateLocation(expectedResult);
    const result = await locationRepository.getLocation({ id: locationId });
    expect(result.id).toEqual(expectedResult.id);
    expect(result.name).toEqual(expectedResult.name);
    expect(result.description).toEqual(expectedResult.description);
    expect(result.lot_type).toEqual(expectedResult.lot_type);

    await locationRepository.deleteLocation({ id: locationId });
    const defaultResult = await locationRepository.getLocation({
      id: locationId,
    });
    expect(defaultResult.name).toEqual('The Futures Past');
  });
});
