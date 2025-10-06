import { Request, Response } from 'express';
import log from 'electron-log';
import { ExportTraitsRequest, MappingService } from '../services/MappingService';

export class MappingController {
  private readonly mappingService: MappingService;

  constructor(mappingService: MappingService) {
    this.mappingService = mappingService;

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
      await this.mappingService.getTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  async getUnmappedTraits(req: Request, res: Response) {
    const searchClass: string | undefined = req.query.searchClass as string | undefined;
    const extractedPath: string = req.query.extractedPath as string;
    res.json(
      await this.mappingService.getUnmappedTraits({
        searchClass,
        extractedPath,
      }),
    );
  }

  async getMoods(req: Request, res: Response) {
    res.json(await this.mappingService.getMoods());
  }

  async getUnmappedMoods(req: Request, res: Response) {
    res.json(await this.mappingService.getUnmappedMoods());
  }

  async exportTraits(req: Request, res: Response) {
    const exportTraitsRequest: ExportTraitsRequest = req.body;
    log.debug(`ExtractedPath: ${exportTraitsRequest.extractedPath}`);
    log.debug(`Length of Traits: ${Object.keys(exportTraitsRequest.traits).length}`);
    res.json(await this.mappingService.exportTraits(req.body));
  }
}
