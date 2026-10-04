import { vi, describe, it, expect } from 'vitest';
import { ScenePlaybackRegistry } from 'main/sentient-sims/services/ScenePlaybackRegistry';
import { onSceneControl } from 'main/sentient-sims/util/sceneControl';

// scene_control is core (every build ships the mod's scene watch), so this runs without tiers
function registry() {
  return new ScenePlaybackRegistry({
    notifyStop: vi.fn(),
    notifySceneEnded: vi.fn(),
    trimMemory: vi.fn(),
    onSceneClosed: vi.fn(),
  });
}

describe('onSceneControl', () => {
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
  });

  it('ignores a stop without a scene id', () => {
    const playback = registry();
    const stop = vi.spyOn(playback, 'stop');
    const stopAll = vi.spyOn(playback, 'stopAll');
    onSceneControl(playback, { action: 'stop', mode: 'soft', reason: 'walked_away' });
    expect(stop).not.toHaveBeenCalled();
    expect(stopAll).not.toHaveBeenCalled();
  });
});
