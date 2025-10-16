import { Request, Response } from 'express';
import log from 'electron-log';
import { LocationEntity } from '../db/entities/LocationEntity';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { notifyLocationChanged } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';

export class LocationsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getLocation = this.getLocation.bind(this);
    this.getAllLocations = this.getAllLocations.bind(this);
    this.getDefaultLocations = this.getDefaultLocations.bind(this);
    this.getModifiedLocations = this.getModifiedLocations.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);
  }

  async getLocation(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const result = this.ctx.locationRepository.getLocation({
        id: Number(locationId),
      });
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting location', err);
      return res.json({ error: err.message });
    }
  }

  async getAllLocations(req: Request, res: Response) {
    try {
      const result = this.ctx.locationRepository.getAllLocations();
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting all locations', err);
      return res.json({ error: err.message });
    }
  }

  async getDefaultLocations(req: Request, res: Response) {
    try {
      return res.json(this.ctx.locationRepository.getDefaultLocations());
    } catch (err: any) {
      log.error('Error getting default locations', err);
      return res.json({ error: err.message });
    }
  }

  async getModifiedLocations(req: Request, res: Response) {
    try {
      return res.json(this.ctx.locationRepository.getModifiedLocations());
    } catch (err: any) {
      log.error('Error getting default locations', err);
      return res.json({ error: err.message });
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const location: LocationEntity = req.body;
      this.ctx.locationRepository.updateLocation(location);

      notifyLocationChanged();

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

      this.ctx.locationRepository.deleteLocation(deleteLocationRequest);

      notifyLocationChanged();

      return res.json({ text: 'Deleted' });
    } catch (err: any) {
      log.error('Error deleting location', err);
      return res.json({ error: err.message });
    }
  }
}
