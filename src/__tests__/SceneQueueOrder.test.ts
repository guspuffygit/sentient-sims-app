import { describe, expect, it, vi } from 'vitest';
import { insertScene, OrderedScene } from 'renderer/voice/sceneQueue';

type Scene = OrderedScene & { name: string };

function scene(name: string, seq: number, priority = false, sceneId?: string): Scene {
  return { name, seq, priority, sceneId };
}

function names(queue: Scene[]): string[] {
  return queue.map((s) => s.name);
}

const MAX = 3;

describe('insertScene', () => {
  it('keeps priority scenes FIFO among themselves', () => {
    const queue: Scene[] = [];
    insertScene(queue, scene('reply1', 1, true), MAX, vi.fn());
    insertScene(queue, scene('reply2', 2, true), MAX, vi.fn());
    insertScene(queue, scene('reply3', 3, true), MAX, vi.fn());
    expect(names(queue)).toEqual(['reply1', 'reply2', 'reply3']);
  });

  it('ranks a priority scene ahead of queued non-priority scenes', () => {
    const queue: Scene[] = [scene('auto1', 1), scene('auto2', 2)];
    insertScene(queue, scene('reply', 3, true), MAX, vi.fn());
    expect(names(queue)).toEqual(['reply', 'auto1', 'auto2']);
  });

  it('slots a priority scene behind earlier priority but ahead of non-priority', () => {
    const queue: Scene[] = [scene('reply1', 1, true), scene('auto1', 2)];
    insertScene(queue, scene('reply2', 3, true), MAX, vi.fn());
    expect(names(queue)).toEqual(['reply1', 'reply2', 'auto1']);
  });

  it('never lets a later round jump an earlier round of the same scene', () => {
    // Round N queued non-priority (however it got flagged), round N+1 arrives priority:
    // the same-scene guard keeps N before N+1 whatever the flags say
    const queue: Scene[] = [scene('roundN', 1, false, 'conv-1'), scene('auto', 2)];
    insertScene(queue, scene('roundN1', 3, true, 'conv-1'), MAX, vi.fn());
    expect(names(queue)).toEqual(['roundN', 'roundN1', 'auto']);
  });

  it('appends non-priority scenes in seq order', () => {
    const queue: Scene[] = [scene('auto1', 1)];
    insertScene(queue, scene('auto3', 3), MAX, vi.fn());
    insertScene(queue, scene('auto2', 2), MAX, vi.fn());
    expect(names(queue)).toEqual(['auto1', 'auto2', 'auto3']);
  });

  it('treats a missing seq as an append within its rank', () => {
    const queue: Scene[] = [scene('auto1', 1), scene('auto2', 2)];
    insertScene(queue, scene('noseq', Number.MAX_SAFE_INTEGER), MAX, vi.fn());
    expect(names(queue)).toEqual(['auto1', 'auto2', 'noseq']);
  });

  it('evicts the oldest non-priority scene at the cap, never the incoming one', () => {
    const queue: Scene[] = [scene('auto1', 1), scene('auto2', 2), scene('auto3', 3)];
    const onDrop = vi.fn();
    insertScene(queue, scene('auto4', 4), MAX, onDrop);
    expect(names(queue)).toEqual(['auto2', 'auto3', 'auto4']);
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect((onDrop.mock.calls[0][0] as Scene).name).toBe('auto1');
  });

  it('never evicts a priority scene', () => {
    const queue: Scene[] = [scene('reply1', 1, true), scene('reply2', 2, true), scene('auto1', 3)];
    const onDrop = vi.fn();
    insertScene(queue, scene('reply3', 4, true), MAX, onDrop);
    expect(names(queue)).toEqual(['reply1', 'reply2', 'reply3']);
    expect((onDrop.mock.calls[0][0] as Scene).name).toBe('auto1');
  });

  it('overflows rather than dropping when everything queued is priority', () => {
    const queue: Scene[] = [scene('reply1', 1, true), scene('reply2', 2, true), scene('reply3', 3, true)];
    const onDrop = vi.fn();
    insertScene(queue, scene('reply4', 4, true), MAX, onDrop);
    expect(names(queue)).toEqual(['reply1', 'reply2', 'reply3', 'reply4']);
    expect(onDrop).not.toHaveBeenCalled();
  });
});
