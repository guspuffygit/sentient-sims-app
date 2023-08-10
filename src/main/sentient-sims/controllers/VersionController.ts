/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import { VersionService } from '../services/VersionService';

export class VersionController {
  private versionService: VersionService;

  constructor(versionService: VersionService) {
    this.versionService = versionService;

    // Bind the methods to the current instance in the constructor
    this.getModVersion = this.getModVersion.bind(this);
    this.getAppVersion = this.getAppVersion.bind(this);
  }

  getModVersion(req: Request, res: Response) {
    res.json(this.versionService.getModVersion());
  }

  getAppVersion(req: Request, res: Response) {
    res.json(this.versionService.getAppVerson());
  }
}
