import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';

export class FileController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getLastExceptionFiles = (req: Request, res: Response) => {
    res.json(this.ctx.lastException.getParsedLastExceptionFiles());
  };

  deleteLastExceptionFiles = (req: Request, res: Response) => {
    this.ctx.lastException.deleteLastExceptionFiles();
    res.json({ done: 'done' });
  };
}
