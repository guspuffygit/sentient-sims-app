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
   * POST /locations/:locationId/describe
   * Writes drafts from what the game has reported about the lot, for the editor: description
   * is the first of versions. Resolves { error } in plain words when it cannot (no visit this
   * app run, a provider error), with inSettings when the fix is in Settings > AI Providers.
   */
  async describeLocation(
    locationId: number,
  ): Promise<
    | { description: string; versions: string[]; facts: string; lotType?: string }
    | { error: string; inSettings?: boolean }
  > {
    const response = await axiosClient.post<{
      description?: string;
      versions?: string[];
      facts?: string;
      lotType?: string;
      error?: string;
      inSettings?: boolean;
    }>(`${this.apiUrl}/locations/${locationId}/describe`, {}, { validateStatus: () => true });
    if (!response.data.description) {
      return {
        error: response.data.error ?? 'The description could not be written; try again',
        inSettings: response.data.inSettings,
      };
    }
    return {
      description: response.data.description,
      versions: response.data.versions?.length ? response.data.versions : [response.data.description],
      facts: response.data.facts ?? '',
      lotType: response.data.lotType,
    };
  }

  /**
   * DELETE /locations/:locationId
   * Deletes a location by ID.
   */
  async deleteLocation(locationId: number): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/locations/${locationId}`);
    return response.data;
  }

  /**
   * POST /locations/online
   * Publishes a location's description as the shared default (mappers only). Resolves to
   * the names from the save that held it back, empty when it was published.
   */
  async publishLocation(location: LocationEntity, force = false): Promise<string[]> {
    const response = await axiosClient.post<{ text?: string; names?: string[] }>(
      `${this.apiUrl}/locations/online`,
      { ...location, ...(force ? { force: true } : {}) },
      { validateStatus: (status) => status < 300 || status === 422 },
    );
    return response.status === 422 ? (response.data.names ?? ['a name from your save']) : [];
  }

  /**
   * DELETE /locations/online/:locationId
   * Removes a location's shared default (mappers only).
   */
  async unpublishLocation(locationId: number): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/locations/online/${locationId}`);
    return response.data;
  }
}
