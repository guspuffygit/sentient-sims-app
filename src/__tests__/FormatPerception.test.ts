import { describe, expect, it } from 'vitest';
import { formatPerception } from 'main/sentient-sims/util/formatPerception';
import { PerceptionSnapshot } from 'main/sentient-sims/models/PerceptionSnapshot';

describe('formatPerception', () => {
  it('renders a full snapshot as prose', () => {
    const snapshot: PerceptionSnapshot = {
      sim_id: '1',
      sim_name: 'Marisol Vega',
      room_id: 5,
      location: { zone_id: 9, outdoors: false },
      sims: [
        { sim_id: '2', tier: 'same_room', distance: 3.2, name: 'Peyton Puckerman', doing: 'browse_web' },
        { sim_id: '3', tier: 'audible', distance: 10.5 },
      ],
      objects: [
        {
          object_id: '100',
          action_keys: ['cook_meal', 'grab_snack'],
          name: 'object_fridgeLOW_01',
          tier: 'same_room',
          distance: 4.1,
        },
      ],
      ambient: { sim_mood: 'Happy', motives_low: ['bladder'] },
    };

    expect(formatPerception(snapshot)).toBe(
      [
        '<PERCEPTION>',
        'You are indoors.',
        'You are feeling Happy. Your bladder is running low.',
        'You can see: Peyton Puckerman (browse web, 3m away); a fridge (could cook meal or grab snack, 4m away).',
        'You hear someone in another room.',
        '</PERCEPTION>',
      ].join('\n'),
    );
  });

  it('renders an empty outdoor snapshot without ambient', () => {
    const snapshot: PerceptionSnapshot = {
      sim_id: '1',
      location: { outdoors: true },
      sims: [],
      objects: [],
    };

    expect(formatPerception(snapshot)).toBe(
      ['<PERCEPTION>', 'You are outdoors.', 'You see nothing and no one of note here.', '</PERCEPTION>'].join('\n'),
    );
  });

  it('counts multiple audible sims and keeps them anonymous', () => {
    const snapshot: PerceptionSnapshot = {
      sim_id: '1',
      sims: [
        { sim_id: '2', tier: 'audible' },
        { sim_id: '3', tier: 'audible' },
      ],
      objects: [],
    };

    const formatted = formatPerception(snapshot);
    expect(formatted).toContain('You hear 2 people elsewhere in the building.');
    expect(formatted).not.toContain('sim_id');
  });
});
