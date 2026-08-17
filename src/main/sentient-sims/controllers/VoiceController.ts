import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';
import { CatchErrors } from './decorators/CatchError';

export class VoiceController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  @CatchErrors({ statusCode: 400 })
  phonemize = (req: Request, res: Response) => {
    const { text, language } = req.query;

    if (typeof text !== 'string') {
      res.status(400).json({ error: 'text query parameter must be a string' });
      return;
    }
    if (language !== 'a' && language !== 'b') {
      res.status(400).json({ error: 'language query parameter must be "a" or "b"' });
      return;
    }

    res.send('OK');
  };

  @CatchErrors({ statusCode: 400 })
  getElevenLabsVoices = (req: Request, res: Response) => {
    res.json(this.ctx.elevenLabsVoices.getVoices());
  };

  @CatchErrors({ statusCode: 400 })
  refreshElevenLabsVoices = async (req: Request, res: Response) => {
    res.json(await this.ctx.elevenLabsVoices.refreshVoices());
  };
}
