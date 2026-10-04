import { defaultLocationDescriptions, defaultLotDescription } from '../descriptions/locationDescriptions';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { GetLocationRequest } from '../models/GetLocationRequest';
import { Repository } from './Repository';
import { LocationEntity } from './entities/LocationEntity';

export class LocationRepository extends Repository {
  /**
   * Retrieves a location by their ID. If the location is not found in the
   * database, it returns the default lot description.

   * @returns {Promise<ParticipantEntity>} A promise that resolves to the location entity.
   */
  getLocation(locationRequest: GetLocationRequest): LocationEntity {
    const results = this.dbService
      .getDb()
      .prepare('SELECT * FROM location WHERE id = ?')
      .all([locationRequest.id]) as LocationEntity[];
    if (results.length > 0) {
      return results[0];
    }

    const locationEntity = defaultLocationDescriptions.get(locationRequest.id.toString());
    const defaultLocation = {
      id: locationRequest.id,
      name: 'the home',
      lot_type: 'Residence',
      description: defaultLotDescription,
      is_generic: true,
    };

    if (!locationEntity) {
      return defaultLocation;
    }

    return {
      id: locationRequest.id,
      name: locationEntity.name || defaultLocation.name,
      lot_type: locationEntity.lot_type || defaultLocation.lot_type,
      description: locationEntity.description || defaultLocation.description,
      is_generic: locationEntity.description === defaultLocation.description,
    };
  }

  // V-6: store a GENERATED description for a lot that only ever had the stock default.
  // Guarded like the participant path: re-read first, and never replace a description the
  // player (or an earlier generation) already put there.
  setDescriptionIfGeneric(location: LocationEntity, description: string, zoneName?: string): boolean {
    const existing = this.dbService
      .getDb()
      .prepare('SELECT * FROM location WHERE id = ?')
      .all([location.id]) as LocationEntity[];

    if (existing.length > 0 && existing[0].description && existing[0].description !== defaultLotDescription) {
      return false;
    }

    this.updateLocation({
      id: location.id,
      name: zoneName || existing[0]?.name || location.name,
      lot_type: existing[0]?.lot_type || location.lot_type,
      description,
    });
    return true;
  }

  /**
   * Updates an existing location or inserts a new location if it does not exist in the database.
   *
   * @param {ParticipantEntity} location - The location entity to update or insert.
   */
  updateLocation(location: LocationEntity) {
    return this.dbService
      .getDb()
      .prepare('INSERT OR REPLACE INTO location(id, name, lot_type, description) VALUES(?, ?, ?, ?)')
      .run([location.id, location.name, location.lot_type, location.description]);
  }

  deleteLocation(location: DeleteLocationRequest) {
    return this.dbService.getDb().prepare('DELETE FROM location WHERE id = ?').run([location.id]);
  }

  getAllLocations(): LocationEntity[] {
    const locations = new Map(defaultLocationDescriptions);
    const results = this.getModifiedLocations();

    results.forEach((location) => {
      locations.set(location.id.toString(), location);
    });

    return Array.from(locations.values());
  }

  getModifiedLocations(): LocationEntity[] {
    return this.dbService.getDb().prepare('SELECT * FROM location').all() as LocationEntity[];
  }

  getDefaultLocations(): LocationEntity[] {
    return Array.from(defaultLocationDescriptions.values());
  }
}
