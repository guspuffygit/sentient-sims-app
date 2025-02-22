import { Request, Response } from 'express';
import { MappingService } from '../services/MappingService';

export class MappingController {
  private readonly mappingService: MappingService;

  constructor(mappingService: MappingService) {
    this.mappingService = mappingService;

    this.getTraits = this.getTraits.bind(this);
    this.getUnmappedTraits = this.getUnmappedTraits.bind(this);
    this.getMoods = this.getMoods.bind(this);
    this.getUnmappedMoods = this.getUnmappedMoods.bind(this);
  }

  async getTraits(req: Request, res: Response) {
    const searchClass: string | undefined = req.query.searchClass as
      | string
      | undefined;

    res.json(await this.mappingService.getTraits(searchClass));
  }

  async getUnmappedTraits(req: Request, res: Response) {
    res.json(await this.mappingService.getUnmappedTraits());
  }

  async getMoods(req: Request, res: Response) {
    res.json(await this.mappingService.getMoods());
  }

  async getUnmappedMoods(req: Request, res: Response) {
    res.json(await this.mappingService.getUnmappedMoods());
  }
}
