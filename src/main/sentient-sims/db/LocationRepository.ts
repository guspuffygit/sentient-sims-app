import { defaultLocationDescriptions } from '../descriptions/locationDescriptions';
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
  async getLocation(
    locationRequest: GetLocationRequest
  ): Promise<LocationEntity> {
    const query = `SELECT * FROM location WHERE id = ?`;
    const result = await this.dbService.all(query, [locationRequest.id]);
    if (result.length > 0) {
      return result[0];
    }

    return (
      defaultLocationDescriptions.get(locationRequest.id.toString()) || {
        id: locationRequest.id,
        name: 'none',
        lot_type: 'Residence',
        description: [
          'The suburban residence was nestled within a quiet neighborhood, surrounded by neatly trimmed lawns and white picket fences.',
          'The house boasted a timeless charm.',
          'A neatly manicured garden with blooming flowers lined the walkway leading up to the front porch.',
          'The front door, provided a welcoming entrance.',
          'Inside, the air was fresh and crisp, with the scent of freshly brewed coffee wafting through the air.',
          'The living room was cozy, with comfortable sofas and armchairs creating the perfect ambiance for a relaxing time at home.',
        ].join(' '),
        is_generic: true,
      }
    );
  }

  /**
   * Updates an existing location or inserts a new location if it does not exist in the database.
   *
   * @param {ParticipantEntity} location - The location entity to update or insert.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateLocation(location: LocationEntity) {
    return this.dbService.run(
      'INSERT OR REPLACE INTO location(id, name, lot_type, description) VALUES(?, ?, ?, ?)',
      [location.id, location.name, location.lot_type, location.description]
    );
  }

  async deleteLocation(location: DeleteLocationRequest) {
    return this.dbService.run('DELETE FROM location WHERE id = ?', [
      location.id,
    ]);
  }
}
