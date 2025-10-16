import fs from 'fs';
import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';

export class AssetsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getAssetsFile = this.getAssetsFile.bind(this);
  }

  async getAssetsFile(req: Request, res: Response) {
    const { filename } = req.params;
    const filePath = this.ctx.getAssetPath(filename);
    res.setHeader('Content-Type', 'image/png');
    res.send(fs.readFileSync(filePath));
  }
}
