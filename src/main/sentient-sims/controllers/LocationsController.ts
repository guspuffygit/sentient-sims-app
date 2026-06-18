import { Request, Response } from 'express';
import log from 'electron-log';
import { LocationEntity } from '../db/entities/LocationEntity';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { notifyLocationChanged } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class LocationsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getLocation = (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      const result = this.ctx.locationRepository.getLocation({
        id: Number(locationId),
      });
      return res.json(result);
    } catch (err) {
      log.error('Error getting location', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getAllLocations = (req: Request, res: Response) => {
    try {
      const result = this.ctx.locationRepository.getAllLocations();
      return res.json(result);
    } catch (err) {
      log.error('Error getting all locations', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getDefaultLocations = (req: Request, res: Response) => {
    try {
      return res.json(this.ctx.locationRepository.getDefaultLocations());
    } catch (err) {
      log.error('Error getting default locations', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getModifiedLocations = (req: Request, res: Response) => {
    try {
      return res.json(this.ctx.locationRepository.getModifiedLocations());
    } catch (err) {
      log.error('Error getting default locations', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  updateLocation = (req: Request, res: Response) => {
    try {
      const location = req.body as LocationEntity;
      this.ctx.locationRepository.updateLocation(location);

      notifyLocationChanged();

      return res.json({
        text: `Updated location with id ${location.id}`,
      });
    } catch (err) {
      log.error('Error updating location', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  deleteLocation = (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      const deleteLocationRequest: DeleteLocationRequest = {
        id: Number(locationId),
      };

      this.ctx.locationRepository.deleteLocation(deleteLocationRequest);

      notifyLocationChanged();

      return res.json({ text: 'Deleted' });
    } catch (err) {
      log.error('Error deleting location', err);
      return res.json({ error: errorMessage(err) });
    }
  };
}
