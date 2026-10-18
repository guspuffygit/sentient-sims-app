import { Request, Response } from 'express';
import log from 'electron-log';
import { LocationEntity } from '../db/entities/LocationEntity';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { notifyLocationChanged } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';
import { InteractionService } from '../services/InteractionService';
import { OnlineLocation } from '../db/OnlineLocationRepository';
import { lotHasFacts } from '../util/lotDescription';
import { PLACEHOLDER_NAME } from '../db/LocationRepository';
import { plainProviderError } from '../util/providerErrorWords';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class LocationsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getLocation = async (req: Request, res: Response) => {
    try {
      await this.ctx.onlineLocationRepository.load();
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

  getAllLocations = async (req: Request, res: Response) => {
    try {
      await this.ctx.onlineLocationRepository.load();
      // A lot the neighborhood table does not know is placed by the world the game reported
      const result = this.ctx.locationRepository.getAllLocations().map((location) => {
        const world = location.neighborhood ? undefined : this.ctx.simStateCache.getLotBlock(location.id)?.world_name;
        return world ? { ...location, neighborhood: world } : location;
      });
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
      const { id, name, lot_type: lotType, description } = req.body as LocationEntity;
      const location = { id, name, lot_type: lotType, description };
      // An editor saved with the default untouched (the in-game dialog's OK) keeps following it
      const fallback = this.ctx.locationRepository.getDefault(id);
      const isDefault =
        fallback?.name === name && fallback.lot_type === lotType && fallback.description === description;
      if (isDefault) {
        this.ctx.locationRepository.deleteLocation({ id });
      } else {
        this.ctx.locationRepository.updateLocation(location);
      }

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

  // "Auto-Generate Description" on the Locations page: three cards for a lot the game has
  // reported this app run, written from the same facts as the fallback writer, with the lot
  // type. Nothing is stored; the editor gets the drafts and Save is the player's. 409 for a
  // lot the game has not reported this app run.
  describeLocation = async (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      const lot = this.ctx.simStateCache.getLotBlock(String(locationId));
      if (!lotHasFacts(lot)) {
        res.status(409).json({ error: 'Visit this lot in game first' });
        return;
      }
      const location = this.ctx.locationRepository.getLocation({ id: Number(locationId) });
      // The app's name for the lot (a shipped name, or the player's) over the in-game one,
      // which keeps any rename made in game
      const name = location.name && location.name !== PLACEHOLDER_NAME ? location.name : lot?.lot_name;
      const written = await this.ctx.defaultDescriptions.describeLocation(location, lot, name, {
        interactive: true,
        versions: 3,
      });
      if (!written) {
        res.status(502).json({ error: 'The writer produced nothing usable; try again' });
        return;
      }
      res.json(written);
    } catch (err) {
      log.error('Error writing a location description', err);
      // The player reads what the provider's error means, and where to fix it
      const { plain, inSettings } = plainProviderError(errorMessage(err));
      res.status(500).json({ error: plain, inSettings });
    }
  };

  // Mappers only (the page shows the button to them, the server enforces it). Sets the
  // shared default every player gets; a player's own description still wins in their save.
  publishLocation = async (req: Request, res: Response) => {
    const body = req.body as LocationEntity & { force?: boolean };
    const location: OnlineLocation = {
      id: body.id,
      name: body.name,
      lot_type: body.lot_type,
      description: body.description,
    };
    try {
      // Text from this save on its way to everyone: refuse and name the words, as the mapping
      // browser does, unless the publisher has seen them and pressed again
      const names =
        body.force === true ? [] : this.ctx.interactions.namesFromSaveIn(`${location.name}. ${location.description}`);
      if (names.length > 0) {
        log.warn(`[Locations] Refused to publish location ${location.id}: names from this save (${names.join(', ')})`);
        res.status(422).json({ error: InteractionService.NAMES_FROM_SAVE, names });
        return;
      }
      await this.ctx.onlineLocationRepository.setLocation(location);
      // The publisher's own save follows the default from now on, like everyone else's
      if (this.ctx.db.isLoaded()) {
        this.ctx.locationRepository.deleteLocation({ id: location.id });
      }
      notifyLocationChanged();
      res.json({ text: `Published location ${location.id}` });
    } catch (err) {
      log.error('Error publishing location', err);
      res.status(500).json({ error: errorMessage(err) });
    }
  };

  unpublishLocation = async (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      await this.ctx.onlineLocationRepository.deleteLocation(Number(locationId));
      res.json({ text: 'Removed' });
    } catch (err) {
      log.error('Error removing shared location', err);
      res.status(500).json({ error: errorMessage(err) });
    }
  };
}
