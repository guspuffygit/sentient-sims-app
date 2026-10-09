import { Request, Response } from 'express';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { DossierReport } from '../models/SimDossier';

// Core (release 4.5): the dossier feeds the semantic facts every prompt reads. Split out of
// CognitionController, which keeps the autonomy routes.

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class DossierController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Phase 3.1 H1/H2: ground truth about who each sim IS. The mod hash-gates these, so a
  // report arriving at all usually means something structural changed; ingestion diffs it
  // against the sim's current `game` facts and retires what is no longer true.
  postDossier = (req: Request, res: Response) => {
    try {
      const report = req.body as Partial<DossierReport>;
      const dossiers = Array.isArray(report.dossiers) ? report.dossiers : undefined;
      if (!dossiers) {
        return res.status(400).json({ error: 'dossiers[] is required' });
      }
      // The mod sends the clock with the report; fall back to the state cache for an
      // older mod build that does not.
      const day = report.clock?.absolute_day ?? this.ctx.simStateCache.getReport()?.lot?.clock?.absolute_day;
      let inserted = 0;
      let retired = 0;
      let ingested = 0;
      for (const dossier of dossiers) {
        if (!dossier.sim_id) {
          continue;
        }
        const result = this.ctx.semanticMemory.ingestDossier(dossier, { day });
        inserted += result.inserted;
        retired += result.retired;
        if (!result.skipped) {
          ingested += 1;
        }
        // The sim is not who they were when their description was written: aged up, died,
        // changed form. A generated description is dropped so the next scene writes one
        // from what is true now; anything the player wrote is left alone (Phase 3.1 fix
        // B). Isolated - a description is cosmetic and must never fail a dossier POST.
        if (result.identityChanged.length > 0) {
          try {
            if (this.ctx.participantRepository.clearGeneratedDescription(dossier.sim_id)) {
              this.ctx.defaultDescriptions.forget(dossier.sim_id);
              log.info(
                `[Dossier] ${dossier.name ?? dossier.sim_id} changed ${result.identityChanged.join(', ')}; ` +
                  'cleared the generated description so it is rewritten',
              );
            }
          } catch (error) {
            log.warn(`[Dossier] could not refresh the description for ${dossier.sim_id}`, error);
          }
        }
      }
      log.info(
        `Dossier report seq=${report.seq ?? '?'} reason=${report.reason ?? '?'}: ` +
          `${ingested}/${dossiers.length} ingested, ${inserted} facts added, ${retired} retired`,
      );
      return res.json({ ok: true, seq: report.seq, ingested, inserted, retired });
    } catch (err) {
      log.error('Error handling dossier report', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };
}
