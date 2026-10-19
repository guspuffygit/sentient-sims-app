import { moodDeliveryTag, normalizeMoodKey } from 'main/sentient-sims/util/moodDeliveryTags';

describe('moodDeliveryTag', () => {
  it.each([
    ['Mood_Angry', 'angry'],
    ['Mood_Bored', 'bored, flat'],
    ['Mood_Confident', 'confident'],
    ['Mood_Dazed', 'dazed'],
    ['Mood_Embarrassed', 'embarrassed'],
    ['Mood_Energized', 'energetic'],
    ['Mood_Flirty', 'flirtatious'],
    ['Mood_Focused', 'calm, focused'],
    ['Mood_Happy', 'cheerful'],
    ['Mood_Inspired', 'warm, inspired'],
    ['Mood_Playful', 'playful'],
    ['Mood_Sad', 'quietly sad'],
    ['Mood_Scared', 'nervous'],
    ['Mood_Stressed', 'tense'],
    ['Mood_Uncomfortable', 'uneasy'],
  ])('maps %s to [%s]', (mood, tag) => {
    expect(moodDeliveryTag([mood])).toEqual(tag);
  });

  it.each(['Mood_Fine', 'Mood_Asleep', 'Mood_Possessed', 'mood_Recharging', 'mood_Hyper_Pets'])(
    'has no tag for the bookkeeping mood %s',
    (mood) => {
      expect(moodDeliveryTag([mood])).toBeUndefined();
    },
  );

  it('reads the pet and horse variants whatever their casing', () => {
    expect(moodDeliveryTag(['mood_Angry_Cat'])).toEqual('angry');
    expect(moodDeliveryTag(['mood_Excited_Dog'])).toEqual('excited');
    expect(moodDeliveryTag(['mood_Anxious_Cat'])).toEqual('nervous');
    expect(moodDeliveryTag(['mood_Horse_Tense'])).toEqual('tense');
  });

  it('takes the first tagged mood and copes with none', () => {
    expect(moodDeliveryTag(['Mood_Fine', 'Mood_Happy'])).toEqual('cheerful');
    expect(moodDeliveryTag([])).toBeUndefined();
    expect(moodDeliveryTag(undefined)).toBeUndefined();
  });

  it('never produces a noun tag that v4 would render as a sound effect', () => {
    // every tag is adjectives and commas only
    const tags = [
      'Mood_Angry',
      'Mood_Bored',
      'Mood_Sad',
      'Mood_Inspired',
      'Mood_Focused',
      'mood_Angry_Dog',
      'mood_Mopey_Dog',
      'mood_Drowsy_Cat',
    ].map((mood) => moodDeliveryTag([mood]));
    tags.forEach((tag) => {
      expect(tag).toMatch(/^[a-z]+([, ]+[a-z]+)*$/);
    });
  });
});

describe('normalizeMoodKey', () => {
  it('strips the prefix and the species suffixes', () => {
    expect(normalizeMoodKey('Mood_Angry')).toEqual('angry');
    expect(normalizeMoodKey('mood_Angry_Cat')).toEqual('angry');
    expect(normalizeMoodKey('mood_Horse_Angry')).toEqual('angry');
    expect(normalizeMoodKey('mood_Hyper_Pets')).toEqual('hyper');
  });
});
