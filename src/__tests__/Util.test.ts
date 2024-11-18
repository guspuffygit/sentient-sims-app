import {
  ContinueInteractionEvent,
  SSEventType,
} from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { containsPlayerSim } from 'main/sentient-sims/util/eventContainsPlayerSim';
import {
  filterNullAndUndefined,
  removeEmojis,
} from 'main/sentient-sims/util/filter';
import { getRandomItem } from 'main/sentient-sims/util/getRandomItem';
import { stringType } from 'main/sentient-sims/util/typeChecks';

describe('Util', () => {
  it('filterNullAndUndefined removes null and undefined values from list', () => {
    expect(filterNullAndUndefined([null, '1', undefined, '2'])).toEqual([
      '1',
      '2',
    ]);
  });

  it('removeEmojis removes emojis correctly', () => {
    expect(removeEmojis('😀🤹🏾test')).toEqual('test');
  });

  it('get random item', () => {
    const result = getRandomItem([1, 2]);
    const actualResult = result === 1 || result === 2;
    expect(actualResult).toBeTruthy();
  });

  it('type check string', () => {
    expect(stringType('yes')).toBeTruthy();
    expect(stringType(2)).toBeFalsy();
  });
});

describe('containsPlayerSim', () => {
  it('list containing player sim return true', () => {
    const sim: SentientSim = {
      careers: [
        {
          name: 'career_Adult_Criminal',
          level: 3,
          track_name: 'Criminal_Track1',
        },
      ],
      name: 'Ricky Rickerson',
      age: SimAge.ADULT,
      sim_id: '772948625141858300',
      gender: 'Male',
      likes: ['Activities_RocketScience', 'Activities_Fitness'],
      dislikes: [],
      aspirations: ['Muser'],
      moods: ['Mood_Flirty'],
      motives: [],
      personality_traits: ['Evil', 'Glutton', 'CommitmentIssues'],
      is_ghost: false,
      grubby: false,
      in_pool: false,
      is_at_home: true,
      is_dying: false,
      is_human: true,
      is_inside_building: false,
      is_outside: true,
      is_pet: false,
      on_fire: false,
      on_home_lot: true,
      sleeping: false,
      is_pregnant: false,
      is_player_sim: true,
    };

    const event: ContinueInteractionEvent = {
      event_id: 'ioj',
      event_type: SSEventType.INTERACTION,
      location_id: 0,
      sentient_sims: [sim],
      environment: {
        location_id: 871623123,
        world_id: 0,
        time: {
          second: 0,
          minute: 0,
          hour: 0,
          day: 0,
          week: 0,
        },
      },
    };
    expect(containsPlayerSim(event)).toBeTruthy();

    sim.is_player_sim = false;
    expect(containsPlayerSim(event)).toBeFalsy();
  });
});
