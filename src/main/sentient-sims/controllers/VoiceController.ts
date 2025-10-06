import { Request, Response } from 'express';
// import { phonemize } from '../voice/phonemize';
import { CatchErrors } from './decorators/CatchError';

export class VoiceController {
  constructor() {
    this.phonemize = this.phonemize.bind(this);
  }

  @CatchErrors({ statusCode: 400 })
  async phonemize(req: Request, res: Response) {
    const { text, language } = req.query;

    if (typeof text !== 'string') {
      res.status(400).json({ error: 'text query parameter must be a string' });
      return;
    }
    if (language !== 'a' && language !== 'b') {
      res.status(400).json({ error: 'language query parameter must be "a" or "b"' });
      return;
    }

    // res.send(await phonemize(text, language));
    res.send('OK');
  }
}
