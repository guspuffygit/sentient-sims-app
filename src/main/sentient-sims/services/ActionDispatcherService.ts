import log from 'electron-log';
import { randomUUID } from 'crypto';
import { ActionIntent } from '../models/ActionIntent';
import { ModEnqueueInteraction, ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { sendModNotification } from '../websocketServer';

export type PendingDispatch = {
  requestId: string;
  intent: ActionIntent;
  dispatchedAt: number;
};

// Interactions that get canceled before ever running produce no outcome from the mod, so
// pending dispatches are dropped after this long rather than accumulating forever
const PENDING_TTL_MS = 10 * 60 * 1000;

export class ActionDispatcherService {
  private readonly pending = new Map<string, PendingDispatch>();

  dispatch(intent: ActionIntent): string {
    this.prune();
    const requestId = randomUUID();
    const message: ModEnqueueInteraction = {
      type: ModWebsocketMessageType.ENQUEUE_INTERACTION,
      request_id: requestId,
      sim_id: intent.sim_id,
      action: intent.action,
      target_sim_id: intent.target_sim_id,
      target_object_id: intent.target_object_id,
      priority: intent.priority,
      insert_strategy: intent.insert_strategy,
      clear_queue: intent.clear_queue,
      source: intent.source ?? 'cognition',
    };
    this.pending.set(requestId, { requestId, intent, dispatchedAt: Date.now() });
    this.sendToMod(message);
    log.debug(`[ActionDispatcher] dispatched ${requestId}: sim ${intent.sim_id} -> ${intent.action}`);
    return requestId;
  }

  // Seam for tests; production sends over the mod websocket
  sendToMod(message: ModEnqueueInteraction) {
    sendModNotification(message);
  }

  // Claims the pending dispatch for an arriving outcome. Removes it, so a duplicate outcome
  // report for the same request_id comes back undefined.
  resolve(requestId: string | undefined): PendingDispatch | undefined {
    if (!requestId) {
      return undefined;
    }
    const entry = this.pending.get(requestId);
    if (entry) {
      this.pending.delete(requestId);
    }
    return entry;
  }

  get pendingCount(): number {
    this.prune();
    return this.pending.size;
  }

  private prune() {
    const cutoff = Date.now() - PENDING_TTL_MS;
    this.pending.forEach((entry, id) => {
      if (entry.dispatchedAt < cutoff) {
        log.debug(`[ActionDispatcher] expiring dispatch ${id} (${entry.intent.action}) with no outcome`);
        this.pending.delete(id);
      }
    });
  }
}
