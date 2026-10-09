import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { mockApiContext } from './util';

function makeSim(name: string, simId: string): SentientSim {
  return {
    careers: [],
    name,
    age: SimAge.ADULT,
    sim_id: simId,
    gender: 'Female',
    traits: [],
    moods: [],
    is_ghost: false,
    grubby: false,
    in_pool: false,
    is_at_home: false,
    is_dying: false,
    is_human: true,
    is_inside_building: false,
    is_outside: false,
    is_pet: false,
    on_fire: false,
    on_home_lot: false,
    sleeping: false,
    is_pregnant: false,
    is_player_sim: false,
  };
}

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx;
}

function sceneEvent(): InteractionEvent {
  return {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: { location_id: 5 } as InteractionEvent['environment'],
    sentient_sims: [makeSim('Alex Doe', '1'), makeSim('Bella Goth', '2')],
    interaction_name: 'social_Chat',
  };
}

describe('a conversation the game has ended', () => {
  it('spends nothing more on a continuation round', async () => {
    const ctx = loadedContext('scene-stop-gating');
    const oneShot = vi.spyOn(ctx.ai, 'runOneShot');
    const sceneId = 'scene-42';

    // Bella walked out of the room while the next round was queued
    ctx.scenePlayback.roundQueued(sceneId, ['1', '2'], 1, [{ speaker: 'Alex Doe', text: 'Stay a minute.' }]);
    ctx.scenePlayback.stop(sceneId, 'walked_away', 'soft');

    const result = await ctx.ai.runDirectedGeneration(sceneEvent(), {
      continueScene: true,
      sceneId,
      round: 2,
      carriedLines: [{ speaker: 'Alex Doe', text: 'Stay a minute.' }],
    });

    expect(result.status).toEqual(InteractionEventStatus.NOOP);
    // Not one model call: the round is dropped before the director is even briefed
    expect(oneShot).not.toHaveBeenCalled();
  });
});
