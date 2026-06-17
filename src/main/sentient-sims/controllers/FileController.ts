import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';

export class FileController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    // Bind the methods to the current instance in the constructor
    this.getLastExceptionFiles = this.getLastExceptionFiles.bind(this);
    this.deleteLastExceptionFiles = this.deleteLastExceptionFiles.bind(this);
  }

  getLastExceptionFiles(req: Request, res: Response) {
    res.json(this.ctx.lastException.getParsedLastExceptionFiles());
  }

  deleteLastExceptionFiles(req: Request, res: Response) {
    this.ctx.lastException.deleteLastExceptionFiles();
    res.json({ done: 'done' });
  }
}
