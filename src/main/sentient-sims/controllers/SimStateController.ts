import { Request, Response } from 'express';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { SimStateReport } from '../models/SimStateReport';

// Core (release 4.5): the state report ships in every build (decision 14). Split out of
// Gus's CognitionController, which keeps his routes (the sleep diary among them).

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class SimStateController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Block 8: the mod's periodic state report — the event stream CognitionService ticks
  // against. Ingestion must stay cheap; deliberation happens in the cache's listeners.
  postState = (req: Request, res: Response) => {
    try {
      const report = req.body as Partial<SimStateReport>;
      if (report.type !== 'state_report' || typeof report.seq !== 'number') {
        return res.status(400).json({ error: 'not a state_report' });
      }
      this.ctx.simStateCache.ingest(report as SimStateReport);
      return res.json({ ok: true, seq: report.seq });
    } catch (err) {
      log.error('Error handling state report', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };
}
