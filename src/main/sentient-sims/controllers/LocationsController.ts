/* eslint-disable promise/always-return */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { LocationRepository } from '../db/LocationRepository';
import { LocationEntity } from '../db/entities/LocationEntity';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';

export class LocationsController {
  private readonly locationRepository: LocationRepository;

  constructor(locationRepository: LocationRepository) {
    this.locationRepository = locationRepository;

    this.getLocation = this.getLocation.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);
  }

  async getLocation(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const result = await this.locationRepository.getLocation({
        id: Number(locationId),
      });
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting location', err);
      return res.json({ error: err.message });
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const location: LocationEntity = req.body;
      await this.locationRepository.updateLocation(location);
      return res.json({
        text: `Updated location with id ${location.id}`,
      });
    } catch (err: any) {
      log.error('Error updating location', err);
      return res.json({ error: err.message });
    }
  }

  async deleteLocation(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const deleteLocationRequest: DeleteLocationRequest = {
        id: Number(locationId),
      };

      await this.locationRepository.deleteLocation(deleteLocationRequest);
      return res.json({ text: 'Deleted' });
    } catch (err: any) {
      log.error('Error deleting location', err);
      return res.json({ error: err.message });
    }
  }
}
