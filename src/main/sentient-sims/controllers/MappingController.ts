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

  async getTraits(req: Request, res: Response) {
    log.debug(`params: ${req.query}`);
    const searchClass: string | undefined = req.query.searchClass as string | undefined;
    const extractedPath: string = req.query.extractedPath as string;

    res.json(
      await this.ctx.mappingService.getTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  async getUnmappedTraits(req: Request, res: Response) {
    const searchClass: string | undefined = req.query.searchClass as string | undefined;
    const extractedPath: string = req.query.extractedPath as string;
    res.json(
      await this.ctx.mappingService.getUnmappedTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  async getMoods(req: Request, res: Response) {
    res.json(await this.ctx.mappingService.getMoods());
  }

  async getUnmappedMoods(req: Request, res: Response) {
    res.json(await this.ctx.mappingService.getUnmappedMoods());
  }

  async exportTraits(req: Request, res: Response) {
    const exportTraitsRequest: ExportTraitsRequest = req.body;
    log.debug(`ExtractedPath: ${exportTraitsRequest.extractedPath}`);
    log.debug(`Length of Traits: ${Object.keys(exportTraitsRequest.traits).length}`);
    res.json(await this.ctx.mappingService.exportTraits(req.body));
  }
}
