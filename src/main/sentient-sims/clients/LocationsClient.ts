import { ApiClient } from './ApiClient';
import { LocationEntity } from '../db/entities/LocationEntity';
import { axiosClient } from './AxiosClient';
import { MessageImage } from '../models/OpenAIMessage';

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
   * Writes a description from what the game has reported about the lot and any screenshots,
   * for the editor. Resolves { error } when it cannot: no visit and no screenshot (409), or
   * screenshots without a provider that can see them (400).
   */
  async describeLocation(
    locationId: number,
    screenshots: MessageImage[] = [],
  ): Promise<{ description: string; facts: string; lotType?: string } | { error: string }> {
    const response = await axiosClient.post<{ description?: string; facts?: string; lotType?: string; error?: string }>(
      `${this.apiUrl}/locations/${locationId}/describe`,
      { screenshots },
      { validateStatus: (status) => status < 300 || status === 409 || status === 400 },
    );
    if (!response.data.description) {
      return { error: response.data.error ?? 'Visit this lot in game first, or add a screenshot' };
    }
    return {
      description: response.data.description,
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
