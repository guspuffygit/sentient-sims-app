import log from 'electron-log';
import {
  backgroundIdleDelayMs,
  claimMaxWaitMs,
  postAnimationGraceMs,
  prefetchMaxAttempts,
  prefetchRetryBaseMs,
  prefetchTtlMs,
} from '../constants';
import { InteractionEvent } from '../models/InteractionEvents';
import { InteractionEventResult, InteractionEventStatus } from '../models/InteractionEventResult';
import { ApiContext } from './ApiContext';
import { DeferredInteractionResult, toPrimaryInteractionEvent } from './AIService';

export type InteractionPrefetchRequest = {
  correlation_id: string;
  event: InteractionEvent;
};

export type InteractionClaimRequest = InteractionPrefetchRequest;

export type InteractionFinalizeRequest = {
  correlation_id: string;
};

export type PrefetchStatus = 'queued' | 'fallback' | 'duplicate' | 'noop';

export type PrefetchAck = {
  status: PrefetchStatus;
  pre_action_text?: string;
};

type EntryState = 'queued' | 'running' | 'done' | 'fallback' | 'cancelled' | 'abandoned';

type ClaimWaiter = (result: DeferredInteractionResult) => void;

type PrefetchEntry = {
  correlationId: string;
  event: InteractionEvent;
  preActionText: string;
  state: EntryState;
  createdAt: number;
  result?: InteractionEventResult;
  play?: () => void;
  finalizeDeadline?: number;
  waiters: ClaimWaiter[];
};

function noopResult(): InteractionEventResult {
  return { status: InteractionEventStatus.NOOP };
}

function once(callback: () => void): () => void {
  let called = false;
  return () => {
    if (!called) {
      called = true;
      callback();
    }
  };
}

export class GenerationQueueService {
  private readonly ctx: ApiContext;

  private readonly entries = new Map<string, PrefetchEntry>();

  private readonly jobs: Array<() => Promise<void>> = [];

  private readonly backgroundJobs: Array<() => Promise<void>> = [];

  private idleTimer?: ReturnType<typeof setTimeout>;

  private activeCount = 0;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async prefetch(request: InteractionPrefetchRequest): Promise<PrefetchAck> {
    this.pruneExpired();
    const existing = this.entries.get(request.correlation_id);
    if (existing) {
      return {
        status: 'duplicate',
        pre_action_text: existing.preActionText,
      };
    }

    const event = toPrimaryInteractionEvent(request.event);
    const resolved = await this.ctx.ai.resolveInteractionPreAction(event);
    if (resolved.result) {
      return { status: 'noop' };
    }

    const entry: PrefetchEntry = {
      correlationId: request.correlation_id,
      event,
      preActionText: resolved.preAction,
      state: 'queued',
      createdAt: Date.now(),
      waiters: [],
    };
    this.entries.set(entry.correlationId, entry);

    if (this.activeCount + this.jobs.length >= this.ctx.settings.prefetchMaxQueueDepth) {
      entry.state = 'fallback';
      return { status: 'fallback', pre_action_text: entry.preActionText };
    }

    void this.enqueue(() => this.generatePrefetch(entry)).catch((error: unknown) => {
      log.error(`Prefetch queue failure for ${entry.correlationId}`, error);
    });
    return { status: 'queued', pre_action_text: entry.preActionText };
  }

  async claim(request: InteractionClaimRequest): Promise<DeferredInteractionResult> {
    this.pruneExpired();
    const entry = this.entries.get(request.correlation_id);
    if (!entry) {
      const result = await this.enqueue(() => this.ctx.ai.interactionEvent(request.event));
      result.result_source = 'synchronous';
      return { result, play: () => {} };
    }

    if (entry.state === 'done' || entry.state === 'fallback' || entry.state === 'abandoned') {
      return this.consume(entry);
    }
    if (entry.state === 'cancelled') {
      this.entries.delete(entry.correlationId);
      return { result: noopResult(), play: () => {} };
    }

    return new Promise<DeferredInteractionResult>((resolve) => {
      entry.waiters.push(resolve);
      const safetyTimer = setTimeout(() => {
        if (
          this.entries.get(entry.correlationId) === entry &&
          (entry.state === 'queued' || entry.state === 'running')
        ) {
          entry.state = 'abandoned';
          this.resolveWaiters(entry);
        }
      }, claimMaxWaitMs);
      safetyTimer.unref();
      this.scheduleFinalizeDeadline(entry);
    });
  }

  finalize(correlationId: string): boolean {
    this.pruneExpired();
    const entry = this.entries.get(correlationId);
    if (!entry) {
      return false;
    }
    entry.finalizeDeadline = Date.now() + postAnimationGraceMs;
    this.scheduleFinalizeDeadline(entry);
    return true;
  }

  cancel(correlationId: string): boolean {
    this.pruneExpired();
    const entry = this.entries.get(correlationId);
    if (!entry) {
      return false;
    }
    entry.state = 'cancelled';
    this.entries.delete(correlationId);
    entry.waiters.splice(0).forEach((resolve) => {
      resolve({ result: noopResult(), play: () => {} });
    });
    return true;
  }

  // A scene/location change makes pending work from the old scene stale. Entries whose event
  // already belongs to exceptLocationId are the new scene's own prefetches (including the one
  // whose generation just detected the boundary) and must survive the flush.
  flushToFallback(exceptLocationId?: number) {
    this.pruneExpired();
    this.entries.forEach((entry) => {
      if (exceptLocationId !== undefined && entry.event.environment.location_id === exceptLocationId) {
        return;
      }
      if (entry.state === 'queued' || entry.state === 'done') {
        entry.state = 'fallback';
      } else if (entry.state === 'running') {
        entry.state = 'abandoned';
      }
      this.resolveWaiters(entry);
    });
  }

  // Runs a generation under the same concurrency gate as prefetches, so legacy synchronous
  // requests (old mods, autonomous outcome events) never add a concurrent LLM pipeline on
  // top of a prefetched one.
  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    return this.enqueue(task);
  }

  // Idle lane for low-priority work (memory annotation, embedding backfill): tasks start
  // only after the queue has been fully quiet for backgroundIdleDelayMs, and run one at a
  // time under the same concurrency gate — so an interaction arriving mid-task waits behind
  // at most that one task, and provider access stays serialized. Once the queue is quiet,
  // pending idle tasks chain back-to-back without re-waiting the delay.
  runWhenIdle<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.backgroundJobs.push(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
      this.scheduleBackground();
    });
  }

  private async generatePrefetch(entry: PrefetchEntry, attempt = 0): Promise<void> {
    if (entry.state !== 'queued') {
      return;
    }
    entry.state = 'running';
    try {
      const deferred = await this.ctx.ai.interactionEventDeferred(entry.event, {
        preAction: entry.preActionText,
      });
      if (!this.hasState(entry, 'running')) {
        return;
      }
      if (deferred.result.status === InteractionEventStatus.GENERATED) {
        entry.state = 'done';
        entry.result = deferred.result;
        entry.play = deferred.play;
      } else {
        entry.state = 'fallback';
      }
    } catch (error) {
      // Transient provider errors (429, network blip) get retried with backoff while the
      // entry is still unclaimed; a claim arriving mid-backoff resolves via the normal
      // abandon path, so waiting on a retry never blocks the game longer than usual.
      if (this.hasState(entry, 'running') && attempt + 1 < prefetchMaxAttempts) {
        const delay = prefetchRetryBaseMs * 2 ** attempt;
        log.warn(
          `Interaction prefetch attempt ${attempt + 1}/${prefetchMaxAttempts} failed for ${entry.correlationId}, retrying in ${delay}ms`,
          error,
        );
        entry.state = 'queued';
        const timer = setTimeout(() => {
          if (this.entries.get(entry.correlationId) === entry) {
            void this.enqueue(() => this.generatePrefetch(entry, attempt + 1)).catch((retryError: unknown) => {
              log.error(`Prefetch retry queue failure for ${entry.correlationId}`, retryError);
            });
          }
        }, delay);
        timer.unref();
        return;
      }
      log.error(
        `Interaction prefetch failed for ${entry.correlationId} after ${attempt + 1} attempt(s), falling back to pre-action`,
        error,
      );
      if (this.hasState(entry, 'running')) {
        entry.state = 'fallback';
      }
    }
    this.resolveWaiters(entry);
  }

  private consume(entry: PrefetchEntry): DeferredInteractionResult {
    this.entries.delete(entry.correlationId);
    if (entry.state === 'done' && entry.result && entry.play) {
      entry.result.result_source = 'prefetch';
      return { result: entry.result, play: once(entry.play) };
    }
    const result = this.ctx.ai.createInteractionPreActionFallback(entry.event, entry.preActionText);
    result.result_source = 'preaction_fallback';
    return { result, play: () => {} };
  }

  private resolveWaiters(entry: PrefetchEntry) {
    if (entry.waiters.length === 0) {
      return;
    }
    if (entry.state !== 'done' && entry.state !== 'fallback' && entry.state !== 'abandoned') {
      return;
    }
    const waiters = entry.waiters.splice(0);
    const claimed = this.consume(entry);
    waiters[0](claimed);
    waiters.slice(1).forEach((resolve) => {
      resolve({ result: noopResult(), play: () => {} });
    });
  }

  private scheduleFinalizeDeadline(entry: PrefetchEntry) {
    if (
      !entry.finalizeDeadline ||
      entry.state === 'done' ||
      entry.state === 'fallback' ||
      entry.state === 'abandoned'
    ) {
      this.resolveWaiters(entry);
      return;
    }
    const delay = Math.max(0, entry.finalizeDeadline - Date.now());
    const timer = setTimeout(() => {
      if (this.entries.get(entry.correlationId) !== entry) {
        return;
      }
      if (entry.state === 'queued' || entry.state === 'running') {
        entry.state = 'abandoned';
        this.resolveWaiters(entry);
      }
    }, delay);
    timer.unref();
  }

  private pruneExpired() {
    const oldestAllowed = Date.now() - prefetchTtlMs;
    this.entries.forEach((entry, correlationId) => {
      if (entry.createdAt < oldestAllowed) {
        entry.state = 'cancelled';
        this.entries.delete(correlationId);
        entry.waiters.splice(0).forEach((resolve) => {
          resolve({ result: noopResult(), play: () => {} });
        });
      }
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.jobs.push(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
      this.drain();
    });
  }

  private drain() {
    const concurrency = Math.max(1, this.ctx.settings.generationConcurrency);
    while (this.activeCount < concurrency && this.jobs.length > 0) {
      const job = this.jobs.shift();
      if (!job) {
        return;
      }
      this.activeCount += 1;
      void job().finally(() => {
        this.activeCount -= 1;
        this.drain();
      });
    }
    this.scheduleBackground();
  }

  // (Re)starts the idle countdown. Called on every drain, so any foreground activity pushes
  // pending background work another full quiet period out. A timer that fires while the
  // queue turned busy again is a no-op; the drain after that work reschedules it.
  private scheduleBackground() {
    if (this.backgroundJobs.length === 0 || this.activeCount > 0 || this.jobs.length > 0) {
      return;
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => {
      this.idleTimer = undefined;
      this.startBackground();
    }, backgroundIdleDelayMs);
    this.idleTimer.unref();
  }

  private startBackground() {
    if (this.activeCount > 0 || this.jobs.length > 0) {
      return;
    }
    const job = this.backgroundJobs.shift();
    if (!job) {
      return;
    }
    this.activeCount += 1;
    void job().finally(() => {
      this.activeCount -= 1;
      if (this.jobs.length > 0) {
        // Foreground work arrived while this task ran — it goes first; its drain
        // restarts the idle countdown for whatever background work remains
        this.drain();
      } else {
        this.startBackground();
      }
    });
  }

  private hasState(entry: PrefetchEntry, state: EntryState): boolean {
    return entry.state === state;
  }
}
