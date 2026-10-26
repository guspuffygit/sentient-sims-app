import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ScenePlaybackRegistry } from 'main/sentient-sims/services/ScenePlaybackRegistry';
import { onSceneControl } from 'main/sentient-sims/util/sceneControl';

const notify = vi.hoisted(() => ({ notifySceneStopAll: vi.fn() }));
vi.mock('main/sentient-sims/util/notifyRenderer', () => notify);

// scene_control is core (every build ships the mod's scene watch), so this runs without tiers
function registry() {
  return new ScenePlaybackRegistry({
    notifyStop: vi.fn(),
    notifySceneEnded: vi.fn(),
    rewriteMemory: vi.fn(),
    onSceneClosed: vi.fn(),
  });
}

describe('onSceneControl', () => {
  beforeEach(() => {
    notify.notifySceneStopAll.mockClear();
  });

  it('stops the named scene with the mode the game asked for', () => {
    const playback = registry();
    const stop = vi.spyOn(playback, 'stop');
    onSceneControl(playback, {
      action: 'stop',
      mode: 'soft',
      scene_id: 'scene-1',
      reason: 'walked_away',
      distance_m: 7.2,
    });
    expect(stop).toHaveBeenCalledWith('scene-1', 'walked_away', 'soft');
  });

  it('stops everything when the lot is going away', () => {
    const playback = registry();
    const stopAll = vi.spyOn(playback, 'stopAll');
    onSceneControl(playback, { action: 'stop_all', mode: 'hard', reason: 'zone_unload' });
    expect(stopAll).toHaveBeenCalledWith('zone_unload');
    expect(notify.notifySceneStopAll).toHaveBeenCalledTimes(1);
  });

  it('leaves the renderer alone when only one scene stops', () => {
    const playback = registry();
    vi.spyOn(playback, 'stop');
    onSceneControl(playback, { action: 'stop', mode: 'hard', reason: 'walked_away', scene_id: 'scene-1' });
    expect(notify.notifySceneStopAll).not.toHaveBeenCalled();
  });

  it('ignores a stop without a scene id', () => {
    const playback = registry();
    const stop = vi.spyOn(playback, 'stop');
    const stopAll = vi.spyOn(playback, 'stopAll');
    onSceneControl(playback, { action: 'stop', mode: 'soft', reason: 'walked_away' });
    expect(stop).not.toHaveBeenCalled();
    expect(stopAll).not.toHaveBeenCalled();
    expect(notify.notifySceneStopAll).not.toHaveBeenCalled();
  });
});
