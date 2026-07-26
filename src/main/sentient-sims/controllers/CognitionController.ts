import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { ActionIntent, InteractionOutcomeEvent } from '../models/ActionIntent';
import { ModRequestPerception, ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { PerceptionSnapshot } from '../models/PerceptionSnapshot';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { formatPerception } from '../util/formatPerception';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function outcomeVerb(outcome: InteractionOutcomeEvent['outcome']): string {
  if (outcome === 'success') {
    return 'succeeded';
  }
  if (outcome === 'failure') {
    return 'failed';
  }
  return 'was canceled';
}

export class CognitionController {
  private readonly ctx: ApiContext;

  // Latest snapshot per sim, kept ephemeral (never persisted as memories). Block 8's
  // SimStateCache supersedes this once snapshots arrive with every state report.
  private readonly latestPerception = new Map<string, PerceptionSnapshot>();

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getPerception(simId: string): PerceptionSnapshot | undefined {
    return this.latestPerception.get(simId);
  }

  private lookupParticipantName(simId?: string): string | undefined {
    if (!simId) {
      return undefined;
    }
    try {
      return this.ctx.participantRepository.getParticipantNames([simId])[0];
    } catch {
      // No DB loaded (or unknown id) — caller falls back to the raw id
      return undefined;
    }
  }

  // The mod reports what actually happened to a dispatched interaction. The result becomes an
  // 'outcome' memory row so retrieval and future cognition ticks can see the consequences of
  // acting — this closes the act -> observe loop.
  postOutcome = (req: Request, res: Response) => {
    try {
      const event = req.body as Partial<InteractionOutcomeEvent>;
      if (!event.sim_id || !event.outcome) {
        return res.status(400).json({ error: 'sim_id and outcome are required' });
      }

      const pending = this.ctx.actionDispatcher.resolve(event.request_id);
      const action = pending?.intent.action ?? event.action ?? event.interaction_name ?? 'an interaction';
      // The mod can't always resolve names (the sim may already be gone); fall back to the
      // participant DB before writing a raw id into a permanent memory row
      const actor = event.sim_name || this.lookupParticipantName(event.sim_id) || `Sim ${event.sim_id}`;
      const target =
        event.target_sim_name ||
        this.lookupParticipantName(event.target_sim_id) ||
        (event.target_sim_id ? `Sim ${event.target_sim_id}` : undefined);
      const attempt = target ? `${actor} tried '${action}' with ${target}` : `${actor} tried '${action}'`;
      const because = event.reason ? ` (${event.reason})` : '';
      const observation = `${attempt} and it ${outcomeVerb(event.outcome)}${because}.`;

      const participants: ParticipantDTO[] = [{ id: event.sim_id }];
      if (event.target_sim_id) {
        participants.push({ id: event.target_sim_id });
      }

      // Outcome rows are bookkeeping for retrieval/cognition; notifyMod false keeps them from
      // being subtitled and pausing the game like dialogue memories
      const memory = this.ctx.memoryRepository.createMemory(
        {
          memory: {
            observation,
            // The motivating thought (when the dispatch is still known) heads the memory the
            // same way a pre_action heads an interaction memory
            pre_action: pending?.intent.motivation,
            location_id: event.location_id ?? this.ctx.sceneService.getCurrentScene()?.locationId ?? 0,
            event_type: 'outcome',
            action,
            interaction_name: event.interaction_name,
          },
          participants,
        },
        { notifyMod: false },
      );

      log.info(`[Cognition] outcome ${event.request_id ?? '(uncorrelated)'}: ${observation}`);
      return res.json({ ok: true, correlated: pending !== undefined, memory_id: memory.id });
    } catch (err) {
      log.error('Error handling cognition outcome', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };

  // The mod's reply to a REQUEST_PERCEPTION message: one sim's scene snapshot. Ephemeral
  // by design — cached for the next cognition tick, never written as a memory.
  postPerception = (req: Request, res: Response) => {
    try {
      const snapshot = req.body as Partial<PerceptionSnapshot>;
      if (!snapshot.sim_id) {
        return res.status(400).json({ error: 'sim_id is required' });
      }
      if (snapshot.error) {
        // The mod couldn't build the snapshot; don't cache a hollow one over real data
        log.warn(
          `[Cognition] perception ${snapshot.request_id ?? ''} failed for sim ${snapshot.sim_id}: ${snapshot.error}`,
        );
        return res.json({ ok: false, error: snapshot.error });
      }
      const full: PerceptionSnapshot = { sims: [], objects: [], ...snapshot, sim_id: snapshot.sim_id };
      this.latestPerception.set(full.sim_id, full);
      const formatted = formatPerception(full);
      log.info(`[Cognition] perception ${full.request_id ?? ''} for sim ${full.sim_id}:\n${formatted}`);
      return res.json({ ok: true, formatted });
    } catch (err) {
      log.error('Error handling perception snapshot', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };

  // Dev seam: ask the mod for a sim's perception snapshot; the mod replies by POSTing
  // it back to /cognition/perception with the same request_id
  debugRequestPerception = (req: Request, res: Response) => {
    try {
      const { sim_id: simId } = req.body as { sim_id?: string };
      if (!simId) {
        return res.status(400).json({ error: 'sim_id is required' });
      }
      const message: ModRequestPerception = {
        type: ModWebsocketMessageType.REQUEST_PERCEPTION,
        request_id: randomUUID(),
        sim_id: simId,
      };
      this.ctx.actionDispatcher.sendToMod(message);
      return res.json({ request_id: message.request_id });
    } catch (err) {
      log.error('Error dispatching perception request', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };

  // Dev seam: curl an ActionIntent at the app and watch the sim act in-game
  debugEnqueue = (req: Request, res: Response) => {
    try {
      const intent = req.body as ActionIntent;
      if (!intent.sim_id || !intent.action) {
        return res.status(400).json({ error: 'sim_id and action are required' });
      }

      const requestId = this.ctx.actionDispatcher.dispatch(intent);
      return res.json({ request_id: requestId });
    } catch (err) {
      log.error('Error dispatching debug enqueue', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };
}
