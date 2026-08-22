import { Request, Response } from 'express';
import log from 'electron-log';
import { DatabaseNotLoadedError } from '../exceptions/DatabaseNotLoadedError';
import { ApiContext } from '../services/ApiContext';
import { pngToPaintingDds } from '../image/paintingDds';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class PaintingsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getPaintingsManifest = (req: Request, res: Response) => {
    try {
      const result = this.ctx.paintingRepository.getManifest();
      return res.json(result);
    } catch (err) {
      if (err instanceof DatabaseNotLoadedError) {
        log.debug('Database isnt loaded yet, returning empty list');
        return res.json([]);
      }

      log.error('Error getting paintings manifest', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getPaintingTexture = async (req: Request<{ instanceId: string }>, res: Response) => {
    try {
      const { instanceId } = req.params;
      const painting = this.ctx.paintingRepository.getPaintingByInstanceId(instanceId);
      if (!painting || !painting.image) {
        return res.status(404).json({
          error: `Painting with instance id ${instanceId} not found.`,
        });
      }

      const dds = await pngToPaintingDds(painting.image);
      return res.json({ imageBase64: dds.toString('base64') });
    } catch (err) {
      log.error('Error getting painting texture', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getPaintingPng = (req: Request<{ instanceId: string }>, res: Response) => {
    try {
      const { instanceId } = req.params;
      const painting = this.ctx.paintingRepository.getPaintingByInstanceId(instanceId);
      if (!painting || !painting.image) {
        return res.status(404).json({
          error: `Painting with instance id ${instanceId} not found.`,
        });
      }
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(painting.image);
    } catch (err) {
      log.error('Error getting painting png', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };
}
