import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenerationQueueService } from 'main/sentient-sims/services/GenerationQueueService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { InteractionEventResult, InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { backgroundIdleDelayMs, postAnimationGraceMs, prefetchTtlMs } from 'main/sentient-sims/constants';

function event(id: string): InteractionEvent {
  return {
    event_id: id,
    event_type: SSEventType.INTERACTION,
    location_id: 7,
    environment: { location_id: 7 } as InteractionEvent['environment'],
    sentient_sims: [],
    interaction_name: 'Chat',
  };
}

function generated(text = 'dialogue'): InteractionEventResult {
  return { status: InteractionEventStatus.GENERATED, text };
}

function makeContext(overrides: Record<string, unknown> = {}) {
  const play = vi.fn();
  const ai = {
    resolveInteractionPreAction: vi.fn(() => Promise.resolve({ preAction: 'Alex waves' })),
    interactionEventDeferred: vi.fn(() => Promise.resolve({ result: generated(), play })),
    interactionEvent: vi.fn(() => Promise.resolve(generated('sync'))),
    createInteractionPreActionFallback: vi.fn((_event: InteractionEvent, preAction: string) => ({
      status: InteractionEventStatus.GENERATED,
      text: preAction,
    })),
    ...overrides,
  };
  const ctx = {
    settings: { generationConcurrency: 1, prefetchMaxQueueDepth: 2 },
    ai,
  } as unknown as ApiContext;
  return { ctx, ai, play };
}

describe('GenerationQueueService', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('deduplicates correlation ids and plays a completed result once when claimed', async () => {
    const { ctx, ai, play } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };

    expect((await queue.prefetch(request)).status).toBe('queued');
    expect((await queue.prefetch(request)).status).toBe('duplicate');
    await vi.waitFor(() => {
      expect(ai.interactionEventDeferred).toHaveBeenCalledOnce();
    });

    const claim = await queue.claim(request);
    expect(claim.result.result_source).toBe('prefetch');
    claim.play();
    claim.play();
    expect(play).toHaveBeenCalledOnce();
  });

  it('admission-rejects a prefetch when queued plus running reaches the depth', async () => {
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    ctx.settings.prefetchMaxQueueDepth = 1;
    const queue = new GenerationQueueService(ctx);

    expect((await queue.prefetch({ correlation_id: 'sim:1', event: event('one') })).status).toBe('queued');
    expect((await queue.prefetch({ correlation_id: 'sim:2', event: event('two') })).status).toBe('fallback');

    finish({ result: generated(), play: () => {} });
  });

  it('resolves a claim that arrives while generation is running', async () => {
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);

    const claimed = queue.claim(request);
    finish({ result: generated(), play: () => {} });

    expect((await claimed).result.result_source).toBe('prefetch');
  });

  it('falls back once the post-animation grace expires while generation is still running', async () => {
    vi.useFakeTimers();
    const never = new Promise<never>(() => {});
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => never) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    const claimed = queue.claim(request);

    expect(queue.finalize(request.correlation_id)).toBe(true);
    await vi.advanceTimersByTimeAsync(postAnimationGraceMs);

    expect((await claimed).result.result_source).toBe('preaction_fallback');
  });

  it('honors finalize that arrives before claim', async () => {
    vi.useFakeTimers();
    const never = new Promise<never>(() => {});
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => never) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    queue.finalize(request.correlation_id);

    const claimed = queue.claim(request);
    await vi.advanceTimersByTimeAsync(postAnimationGraceMs);

    expect((await claimed).result.result_source).toBe('preaction_fallback');
  });

  it('returns the generated result when it lands inside the finalize grace period', async () => {
    vi.useFakeTimers();
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    const claimed = queue.claim(request);
    queue.finalize(request.correlation_id);

    await vi.advanceTimersByTimeAsync(1000);
    finish({ result: generated(), play: () => {} });

    expect((await claimed).result.result_source).toBe('prefetch');
  });

  it('flushes pending work to fallback and discards a late completion', async () => {
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx, play } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    const claimed = queue.claim(request);

    queue.flushToFallback();
    expect((await claimed).result.result_source).toBe('preaction_fallback');
    finish({ result: generated(), play });
    await Promise.resolve();
    expect(play).not.toHaveBeenCalled();
  });

  it('spares entries at the boundary location when flushing to fallback', async () => {
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    const claimed = queue.claim(request);

    // A scene boundary detected by this very generation flushes everything except its own location
    queue.flushToFallback(request.event.environment.location_id);
    finish({ result: generated(), play: () => {} });

    expect((await claimed).result.result_source).toBe('prefetch');
  });

  it('uses the synchronous compatibility path when no prefetch entry exists', async () => {
    const { ctx, ai } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'missing', event: event('one') };

    const claimed = await queue.claim(request);

    expect(ai.interactionEvent).toHaveBeenCalledWith(request.event);
    expect(claimed.result.result_source).toBe('synchronous');
  });

  it('cancels an unclaimed completed result without playing it', async () => {
    const { ctx, ai, play } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    await vi.waitFor(() => {
      expect(ai.interactionEventDeferred).toHaveBeenCalledOnce();
    });

    expect(queue.cancel(request.correlation_id)).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it('starts idle work only after a full quiet period', async () => {
    vi.useFakeTimers();
    const { ctx } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const task = vi.fn(() => Promise.resolve('rated'));

    const result = queue.runWhenIdle(task);
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs - 1);
    expect(task).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(task).toHaveBeenCalledOnce();
    expect(await result).toBe('rated');
  });

  it('holds idle work while foreground generation runs, then resumes after quiet', async () => {
    vi.useFakeTimers();
    let finish!: (value: { result: InteractionEventResult; play: () => void }) => void;
    const pending = new Promise<{ result: InteractionEventResult; play: () => void }>((resolve) => {
      finish = (value) => {
        resolve(value);
      };
    });
    const { ctx } = makeContext({ interactionEventDeferred: vi.fn(() => pending) });
    const queue = new GenerationQueueService(ctx);
    const task = vi.fn(() => Promise.resolve());

    void queue.runWhenIdle(task);
    await queue.prefetch({ correlation_id: 'sim:1', event: event('one') });
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs * 3);
    expect(task).not.toHaveBeenCalled();

    finish({ result: generated(), play: () => {} });
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs);
    expect(task).toHaveBeenCalledOnce();
  });

  it('restarts the quiet period when foreground work interrupts the countdown', async () => {
    vi.useFakeTimers();
    const { ctx } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const task = vi.fn(() => Promise.resolve());

    void queue.runWhenIdle(task);
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs - 1);
    await queue.runExclusive(() => Promise.resolve());
    await vi.advanceTimersByTimeAsync(1);
    expect(task).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs);
    expect(task).toHaveBeenCalledOnce();
  });

  it('chains queued idle work without re-waiting, and lets foreground work cut in', async () => {
    vi.useFakeTimers();
    const { ctx } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const order: string[] = [];
    let finishFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });

    void queue.runWhenIdle(async () => {
      order.push('idle1');
      await firstGate;
    });
    void queue.runWhenIdle(() => {
      order.push('idle2');
      return Promise.resolve();
    });
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs);
    expect(order).toEqual(['idle1']);

    // Foreground arrives mid-task: it waits behind only the in-flight idle task, then runs
    // before any further idle work
    const foreground = queue.runExclusive(() => {
      order.push('foreground');
      return Promise.resolve();
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(order).toEqual(['idle1']);

    finishFirst();
    await foreground;
    expect(order).toEqual(['idle1', 'foreground']);

    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs);
    expect(order).toEqual(['idle1', 'foreground', 'idle2']);
  });

  it('rejects the idle caller when its task fails without disturbing later idle work', async () => {
    vi.useFakeTimers();
    const { ctx } = makeContext();
    const queue = new GenerationQueueService(ctx);

    // The rejection lands mid-timer-advance, so the handler must be attached up front
    const failed = expect(queue.runWhenIdle(() => Promise.reject(new Error('rating failed')))).rejects.toThrow(
      'rating failed',
    );
    const succeeded = queue.runWhenIdle(() => Promise.resolve('ok'));
    await vi.advanceTimersByTimeAsync(backgroundIdleDelayMs);

    await failed;
    expect(await succeeded).toBe('ok');
  });

  it('evicts stale entries and uses synchronous compatibility on a later claim', async () => {
    vi.useFakeTimers();
    const { ctx, ai } = makeContext();
    const queue = new GenerationQueueService(ctx);
    const request = { correlation_id: 'sim:1', event: event('one') };
    await queue.prefetch(request);
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(prefetchTtlMs + 1);
    const claimed = await queue.claim(request);

    expect(ai.interactionEvent).toHaveBeenCalledOnce();
    expect(claimed.result.result_source).toBe('synchronous');
  });
});
