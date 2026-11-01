import { describe, expect, it } from 'vitest';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

// 2026-10-31 (HANDOFF-CHARACTER-BLOCK 2E): the lean actor's posture line says what each Sim is
// in the middle of, as the mod's pie label, unless it is the scene's own beat. The full
// pipeline's posture line is untouched (its fixture pins it).

function sim(name: string, extra: Partial<SentientSim> = {}): SentientSim {
  return {
    careers: [],
    name,
    age: SimAge.ADULT,
    sim_id: name,
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
    ...extra,
  };
}

describe('formatSimPostures with activities', () => {
  const ctx: ApiContext = mockApiContext();
  const sitting = sim('Augustus St Fleur', { body_posture: 'posture_Sit', doing: 'Use Computer' });
  const standing = sim('Paolo Rocca', { body_posture: 'posture_Stand', doing: 'Cook Garlic Noodles' });

  it('appends what the Sim is doing to the posture clause', () => {
    expect(ctx.promptBuilder.formatSimPostures([sitting, standing], { activities: true })).toBe(
      'Augustus St Fleur is sitting, use computer, Paolo Rocca is standing, cook garlic noodles',
    );
  });

  it("skips the clause when it is the scene's own beat", () => {
    expect(
      ctx.promptBuilder.formatSimPostures([sitting, standing], { activities: true, beatLabel: 'Cook Garlic Noodles' }),
    ).toBe('Augustus St Fleur is sitting, use computer, Paolo Rocca is standing');
  });

  it('says only the doing for a Sim with no posture words, and nothing without activities', () => {
    const bare = sim('Laurie Duckworth', { doing: 'Watch Romance' });
    expect(ctx.promptBuilder.formatSimPostures([bare], { activities: true })).toBe('Laurie Duckworth is watch romance');
    expect(ctx.promptBuilder.formatSimPostures([bare])).toBeUndefined();
    expect(ctx.promptBuilder.formatSimPostures([sitting, standing])).toBe(
      'Augustus St Fleur is sitting, Paolo Rocca is standing',
    );
  });
});
