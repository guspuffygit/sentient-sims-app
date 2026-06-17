import { Request, Response } from 'express';
import log from 'electron-log';
import { ExportTraitsRequest } from '../services/MappingService';
import { ApiContext } from '../services/ApiContext';

export class MappingController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getTraits = this.getTraits.bind(this);
    this.getUnmappedTraits = this.getUnmappedTraits.bind(this);
    this.getMoods = this.getMoods.bind(this);
    this.getUnmappedMoods = this.getUnmappedMoods.bind(this);
    this.exportTraits = this.exportTraits.bind(this);
  }

  getTraits(req: Request, res: Response) {
    log.debug(`params: ${JSON.stringify(req.query)}`);
    const searchClass: string | undefined = req.query.searchClass as string | undefined;
    const extractedPath: string = req.query.extractedPath as string;

    res.json(
      this.ctx.mapping.getTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  getUnmappedTraits(req: Request, res: Response) {
    const searchClass: string | undefined = req.query.searchClass as string | undefined;
    const extractedPath: string = req.query.extractedPath as string;
    res.json(
      this.ctx.mapping.getUnmappedTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  getMoods(req: Request, res: Response) {
    res.json(this.ctx.mapping.getMoods());
  }

  getUnmappedMoods(req: Request, res: Response) {
    res.json(this.ctx.mapping.getUnmappedMoods());
  }

  exportTraits(req: Request, res: Response) {
    const exportTraitsRequest = req.body as ExportTraitsRequest;
    log.debug(`ExtractedPath: ${exportTraitsRequest.extractedPath}`);
    log.debug(`Length of Traits: ${Object.keys(exportTraitsRequest.traits).length}`);
    this.ctx.mapping.exportTraits(exportTraitsRequest);
    res.json({ done: 'done' });
  }
}
