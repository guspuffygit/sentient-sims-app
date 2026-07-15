import { describe, expect, it } from 'vitest';
import { SceneService } from 'main/sentient-sims/services/SceneService';
import { SSEvent } from 'main/sentient-sims/models/InteractionEvents';

function eventAt(locationId: number): SSEvent {
  return {
    environment: { location_id: locationId },
  } as SSEvent;
}

describe('SceneService', () => {
  it('starts a scene on the first event without reporting a boundary', () => {
    const scene = new SceneService();
    const result = scene.checkSceneBoundary(eventAt(100));

    expect(result.boundary).toBe(false);
    expect(result.previousScene).toBeUndefined();
    expect(scene.getCurrentScene()?.locationId).toBe(100);
    expect(scene.getCurrentSceneId()).toBeDefined();
  });

  it('does not report a boundary while staying at the same location', () => {
    const scene = new SceneService();
    scene.checkSceneBoundary(eventAt(100));
    const sceneId = scene.getCurrentSceneId();

    const result = scene.checkSceneBoundary(eventAt(100));

    expect(result.boundary).toBe(false);
    expect(scene.getCurrentSceneId()).toBe(sceneId);
  });

  it('reports a boundary and rolls to a new scene when the location changes', () => {
    const scene = new SceneService();
    scene.checkSceneBoundary(eventAt(100));
    const firstSceneId = scene.getCurrentSceneId();

    const result = scene.checkSceneBoundary(eventAt(200));

    expect(result.boundary).toBe(true);
    expect(result.previousScene?.sceneId).toBe(firstSceneId);
    expect(result.previousScene?.locationId).toBe(100);
    expect(scene.getCurrentScene()?.locationId).toBe(200);
    expect(scene.getCurrentSceneId()).not.toBe(firstSceneId);
  });

  it('resets scene state', () => {
    const scene = new SceneService();
    scene.checkSceneBoundary(eventAt(100));

    scene.reset();

    expect(scene.getCurrentScene()).toBeUndefined();
    expect(scene.getCurrentSceneId()).toBeUndefined();

    // A fresh event after reset starts a new scene, not a boundary
    const result = scene.checkSceneBoundary(eventAt(200));
    expect(result.boundary).toBe(false);
    expect(scene.getCurrentScene()?.locationId).toBe(200);
  });
});
