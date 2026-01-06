import { ApiClient } from './ApiClient';
import { LocationEntity } from '../db/entities/LocationEntity';
import { axiosClient } from './AxiosClient';

export class LocationsClient extends ApiClient {
  /**
   * GET /locations
   * Retrieves all locations.
   */
  async getAllLocations(): Promise<LocationEntity[]> {
    const response = await axiosClient.get<LocationEntity[]>(`${this.apiUrl}/locations`);
    return response.data;
  }

  /**
   * GET /locations/default
   * Retrieves default locations.
   */
  async getDefaultLocations(): Promise<LocationEntity[]> {
    const response = await axiosClient.get<LocationEntity[]>(`${this.apiUrl}/locations/default`);
    return response.data;
  }

  /**
   * GET /locations/modified
   * Retrieves modified locations.
   */
  async getModifiedLocations(): Promise<LocationEntity[]> {
    const response = await axiosClient.get<LocationEntity[]>(`${this.apiUrl}/locations/modified`);
    return response.data;
  }

  /**
   * GET /locations/:locationId
   * Retrieves a single location by ID.
   */
  async getLocation(locationId: number): Promise<LocationEntity> {
    const response = await axiosClient.get<LocationEntity>(`${this.apiUrl}/locations/${locationId}`);
    return response.data;
  }

  /**
   * POST /locations
   * Updates a location (expects the full LocationEntity in the body).
   */
  async updateLocation(location: LocationEntity): Promise<{ text: string }> {
    const response = await axiosClient.post<{ text: string }>(`${this.apiUrl}/locations`, location);
    return response.data;
  }

  /**
   * DELETE /locations/:locationId
   * Deletes a location by ID.
   */
  async deleteLocation(locationId: number): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/locations/${locationId}`);
    return response.data;
  }
}
