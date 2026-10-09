import { describe, expect, it } from 'vitest';
import { GenerationQueueService } from 'main/sentient-sims/services/GenerationQueueService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';

function makeQueue() {
  const ctx = {
    settings: { generationConcurrency: 1, prefetchMaxQueueDepth: 2 },
    ai: {},
  } as unknown as ApiContext;
  return new GenerationQueueService(ctx);
}

function gate() {
  let open!: () => void;
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open };
}

describe('GenerationQueueService ordering', () => {
  it('runs priority tasks in submission order at concurrency 1', async () => {
    const queue = makeQueue();
    const order: string[] = [];
    const blocker = gate();

    // Occupy the single slot so the priority tasks actually queue
    const running = queue.runExclusive(() => blocker.promise);
    const first = queue.runExclusive(
      () => {
        order.push('priority1');
        return Promise.resolve();
      },
      { priority: true },
    );
    const second = queue.runExclusive(
      () => {
        order.push('priority2');
        return Promise.resolve();
      },
      { priority: true },
    );

    blocker.open();
    await Promise.all([running, first, second]);
    expect(order).toEqual(['priority1', 'priority2']);
  });

  it('still runs a priority task before earlier-queued non-priority work', async () => {
    const queue = makeQueue();
    const order: string[] = [];
    const blocker = gate();

    const running = queue.runExclusive(() => blocker.promise);
    const plain = queue.runExclusive(() => {
      order.push('plain');
      return Promise.resolve();
    });
    const priority = queue.runExclusive(
      () => {
        order.push('priority');
        return Promise.resolve();
      },
      { priority: true },
    );

    blocker.open();
    await Promise.all([running, plain, priority]);
    expect(order).toEqual(['priority', 'plain']);
  });

  it('drains the speech lane before queued priority work', async () => {
    const queue = makeQueue();
    const order: string[] = [];
    const blocker = gate();

    const running = queue.runExclusive(() => blocker.promise);
    const priority = queue.runExclusive(
      () => {
        order.push('priority');
        return Promise.resolve();
      },
      { priority: true },
    );
    const speech = queue.runSpeech(() => {
      order.push('speech');
      return Promise.resolve();
    });

    blocker.open();
    await Promise.all([running, priority, speech]);
    expect(order).toEqual(['speech', 'priority']);
  });
});
