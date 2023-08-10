/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import { LastExceptionService } from '../services/LastExceptionService';

export class FileController {
  private lastExceptionService: LastExceptionService;

  constructor(lastExceptionService: LastExceptionService) {
    this.lastExceptionService = lastExceptionService;

    // Bind the methods to the current instance in the constructor
    this.getLastExceptionFiles = this.getLastExceptionFiles.bind(this);
    this.deleteLastExceptionFiles = this.deleteLastExceptionFiles.bind(this);
  }

  async getLastExceptionFiles(req: Request, res: Response) {
    res.json(await this.lastExceptionService.getParsedLastExceptionFiles());
  }

  async deleteLastExceptionFiles(req: Request, res: Response) {
    await this.lastExceptionService.deleteLastExceptionFiles();
    res.json({ done: 'done' });
  }
}
