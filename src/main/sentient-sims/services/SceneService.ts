import log from 'electron-log';
import { SSEvent } from '../models/InteractionEvents';

export type SceneState = {
  sceneId: number;
  locationId: number;
  startedAt: string;
};

export type SceneBoundary = {
  boundary: boolean;
  previousScene?: SceneState;
};

// A "scene" is one continuous stretch of gameplay at a single Sims location. Travelling to a
// different location ends the current scene and starts a new one; the boundary is where the
// AI reflects on what just happened and the raw conversational history resets.
export class SceneService {
  private currentScene?: SceneState;

  private lastSceneId = 0;

  getCurrentScene(): SceneState | undefined {
    return this.currentScene;
  }

  getCurrentSceneId(): number | undefined {
    return this.currentScene?.sceneId;
  }

  private startScene(locationId: number): SceneState {
    // Timestamp-based id, bumped to stay strictly increasing so two scenes started in the same
    // millisecond never share an id.
    const sceneId = Math.max(Date.now(), this.lastSceneId + 1);
    this.lastSceneId = sceneId;
    const scene: SceneState = {
      sceneId,
      locationId,
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, -5),
    };
    this.currentScene = scene;
    log.info(`[Scene] Started scene ${scene.sceneId} at location ${locationId}`);
    return scene;
  }

  // Called for every generation event. Returns boundary: true (with the scene that just ended)
  // when the event's location differs from the active scene, so the caller can run a reflection.
  checkSceneBoundary(event: SSEvent): SceneBoundary {
    const locationId = event.environment.location_id;

    if (!this.currentScene) {
      this.startScene(locationId);
      return { boundary: false };
    }

    if (this.currentScene.locationId === locationId) {
      return { boundary: false };
    }

    const previousScene = this.currentScene;
    log.info(
      `[Scene] Boundary detected: location ${previousScene.locationId} (scene ${previousScene.sceneId}) -> location ${locationId}`,
    );
    this.startScene(locationId);
    return { boundary: true, previousScene };
  }

  // Ends the current scene without a location change (e.g. a sim going to sleep) and starts a
  // fresh one at the same location, so the next boundary only covers what happens afterwards.
  // Returns the scene that just ended, or undefined if none was active.
  endCurrentScene(reason: string): SceneState | undefined {
    if (!this.currentScene) {
      return undefined;
    }
    const previousScene = this.currentScene;
    log.info(`[Scene] Ended scene ${previousScene.sceneId} at location ${previousScene.locationId} (${reason})`);
    this.startScene(previousScene.locationId);
    return previousScene;
  }

  // Loading/unloading a database jumps the game state; there is no coherent scene to reflect on.
  reset() {
    if (this.currentScene) {
      log.info(`[Scene] Reset (was scene ${this.currentScene.sceneId} at location ${this.currentScene.locationId})`);
    }
    this.currentScene = undefined;
  }
}
