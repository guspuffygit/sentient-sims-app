import { Request, Response } from 'express';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { ActionIntent, InteractionOutcomeEvent } from '../models/ActionIntent';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';

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

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
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
      const actor = event.sim_name || `Sim ${event.sim_id}`;
      const target = event.target_sim_name || (event.target_sim_id ? `Sim ${event.target_sim_id}` : undefined);
      const attempt = target ? `${actor} tried '${action}' with ${target}` : `${actor} tried '${action}'`;
      const observation = `${attempt} and it ${outcomeVerb(event.outcome)}.`;

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
