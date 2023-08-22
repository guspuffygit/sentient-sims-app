import fs from 'fs';
import { Request, Response } from 'express';

export class AssetsController {
  private readonly getAssetPath: (...paths: string[]) => string;

  constructor(getAssetPath: (...paths: string[]) => string) {
    this.getAssetPath = getAssetPath;

    this.getAssetsFile = this.getAssetsFile.bind(this);
  }

  async getAssetsFile(req: Request, res: Response) {
    const { filename } = req.params;
    const filePath = this.getAssetPath(filename);
    res.setHeader('Content-Type', 'image/png');
    res.send(fs.readFileSync(filePath));
  }
}
