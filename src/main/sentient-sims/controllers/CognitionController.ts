import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { SceneState } from '../services/SceneService';
import { ActionIntent, InteractionOutcomeEvent } from '../models/ActionIntent';
import { ModRequestPerception, ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { PerceptionSnapshot } from '../models/PerceptionSnapshot';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { formatPerception } from '../util/formatPerception';
import { isBelowChild, lifeStageOf } from '../util/simLifeStage';

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

// The mod forwards cancel reasons as raw game reprs like
// "<EnqueueResult: Bills: Interaction requires a utility that is shut off. <ExecuteResult: False: (None)>>".
// Keep the human sentence, drop the machine wrappers — this text lands in a permanent memory
// row, and raw angle brackets also read as tags in the mod's Flash memories window.
export function humanizeOutcomeReason(reason: string): string {
  let text = reason.trim();
  // Unwrap <Label: ...> repr shells wherever they sit, innermost first — a prefixed
  // reason like "clean push refused: <EnqueueResult: states do not match...>" must keep
  // the inner explanation (observed live 2026-08-07: the whole-string-only unwrap never
  // fired past the prefix, so the repr-strip below deleted the entire why and the
  // memory read just "clean push refused:")
  let previous;
  do {
    previous = text;
    text = text.replace(/<\w+:\s*([^<>]*)>/g, '$1');
  } while (text !== previous);
  // Drop any leftover angle-bracket noise and the bare result plumbing the unwrap
  // exposes (ExecuteResult bodies like "False: (None)" carry no reason)
  text = text
    .replace(/<[^<>]*>/g, '')
    // An UNTERMINATED shell: the mod truncates long reasons, so "<EnqueueResult: True
    // <ExecuteResult: Interaction finished during app..." arrives with no closing '>'
    // and neither unwrap above can match it. That exact shape reached permanent memory
    // rows (live 2026-08-16, memories 2036 and 2124, stored with the leading guillemet).
    // The mod strips reprs before truncating now; this catches older and other shapes.
    .replace(/<\w+:\s*/g, '')
    .replace(/[<>]/g, '')
    .replace(/\b(?:True|False|None)\b:?\s*\(None\)/g, '')
    .replace(/\(None\)/g, '')
    .replace(/\(\s*\)/g, '');
  // Final guard against slots the unwrap emptied (P-9): "between and ." / "Sim []" /
  // dangling ':' — the mod fills names it knows; this keeps whatever slips through
  // readable rather than a permanent memory reading "between and ."
  text = text
    .replace(/\bbetween\s+and\b/gi, 'between the two of them')
    .replace(/\bSim\s*\[\s*\]/g, 'the sim')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/[.:]+\s*:\s*$/g, '.')
    .replace(/:\s*$/g, '');
  return text.replace(/\s{2,}/g, ' ').trim();
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

  // Did this sim actually take part in the scene? Judged by memory ownership, which is
  // what the reflection's transcript is built from. An empty scene (no memories yet)
  // counts as theirs — there is nothing to misattribute.
  private simIsInScene(simId: string, scene: SceneState): boolean {
    try {
      const participantIds = this.ctx.memoryRepository.getSceneParticipantIds(scene.locationId, scene.startedAt);
      return participantIds.length === 0 || participantIds.includes(simId);
    } catch {
      // No DB loaded / query failed: fall back to the old behaviour rather than
      // silently dropping every sleep boundary
      return true;
    }
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
      const reason = event.reason ? humanizeOutcomeReason(event.reason) : '';
      const because = reason ? ` (${reason})` : '';
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
      return res.json({ ok: true, correlated: pending !== undefined, memory_id: memory?.id });
    } catch (err) {
      log.error('Error handling cognition outcome', err);
      return res.status(500).json({ error: errorMessage(err) });
    }
  };

  // The mod reports a household sim falling asleep. Sleep closes out the sim's stretch of
  // activity the way travel does: reflect on the current scene, then start a fresh scene at
  // the same location so the next boundary only covers what happens after the nap.
  postSleepBoundary = async (req: Request, res: Response) => {
    try {
      const {
        sim_id: simId,
        sim_name: simName,
        clock,
        passed_out: passedOut,
      } = req.body as {
        sim_id?: string;
        sim_name?: string;
        // Game clock at the moment of falling asleep (newer mods) — keys the overnight
        // daily plan to the day the sim wakes into
        clock?: { hour?: number; absolute_day?: number };
        // The mod also fires the boundary when a sim passes out from exhaustion
        passed_out?: boolean;
      };
      if (!simId) {
        return res.status(400).json({ error: 'sim_id is required' });
      }
      const who = simName || this.lookupParticipantName(simId) || `Sim ${simId}`;
      // J8: an infant naps several times a day and has no diary to write; ending the
      // household's scene at every nap chopped everyone else's evening into fragments and
      // wrote first-person entries for a Sim who cannot talk (the 2026-09-04 playtest handoff, cause 8).
      // Below CHILD the boundary is a no-op and the scene keeps running.
      const stage = lifeStageOf(this.ctx, simId);
      if (isBelowChild(stage)) {
        log.info(`[Cognition] sleep boundary for ${who}: ${stage} writes no diary; leaving the scene running`);
        return res.json({
          ok: true,
          reflected: false,
          reason: `sleeper is ${stage?.toLowerCase()}: no diary below child`,
        });
      }
      // A sleeper who took no part in the active scene must not end it: the scene belongs
      // to the sims who are in it, and closing it here both loses THEIR reflection and
      // hands the sleeper a first-person diary of an evening they never attended (live
      // 2026-08-16 — Ariel slept at home while the app's active scene was still the bar
      // Mackenzie had travelled to). The sleeper's own next boundary writes their diary.
      const activeScene = this.ctx.sceneService.getCurrentScene();
      if (activeScene && !this.simIsInScene(simId, activeScene)) {
        log.info(
          `[Cognition] sleep boundary for ${who}: not a participant of scene ${activeScene.sceneId} ` +
            `(location ${activeScene.locationId}); leaving the scene running`,
        );
        return res.json({ ok: true, reflected: false, reason: 'sleeper was not in the active scene' });
      }
      const previousScene = this.ctx.sceneService.endCurrentScene(
        passedOut ? `${who} passed out from exhaustion` : `${who} fell asleep`,
      );
      if (!previousScene) {
        return res.json({ ok: true, reflected: false, reason: 'no active scene' });
      }
      log.info(`[Cognition] sleep boundary for ${who}: reflecting on scene ${previousScene.sceneId}`);
      // The sleeper is the reflecting mind — their day closes as a diary entry in their voice
      await this.ctx.ai.runSceneReflection(previousScene, { simId, simName: who }, 'sleep', clock);
      return res.json({ ok: true, reflected: true, scene_id: previousScene.sceneId });
    } catch (err) {
      log.error('Error handling sleep boundary', err);
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
