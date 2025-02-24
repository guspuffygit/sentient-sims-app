import { TraitDescription } from '../models/TraitDescription';

export type MoodMapping = TraitDescription & {
  class: string;
  xml?: string;
};

export const moodDescriptions: Record<string, TraitDescription> = {
  Mood_Angry: {
    ignored: false,
    description: 'is feeling angry',
    name: 'Mood_Angry',
  },
  mood_Angry_Cat: {
    ignored: false,
    description: 'is feeling angry',
    name: 'mood_Angry_Cat',
  },
  mood_Angry_Dog: {
    ignored: false,
    description: 'is feeling angry',
    name: 'mood_Angry_Dog',
  },
  mood_Anxious_Cat: {
    ignored: false,
    description: 'is feeling anxious',
    name: 'mood_Anxious_Cat',
  },
  mood_Anxious_Dog: {
    ignored: false,
    description: 'is feeling anxious',
    name: 'mood_Anxious_Dog',
  },
  mood_Ashamed_Dog: {
    ignored: false,
    description: 'is feeling ashamed',
    name: 'mood_Ashamed_Dog',
  },
  Mood_Asleep: {
    ignored: false,
    description: 'is feeling asleep',
    name: 'Mood_Asleep',
  },
  mood_Asleep_Cat: {
    ignored: false,
    description: 'is feeling asleep',
    name: 'mood_Asleep_Cat',
  },
  mood_Asleep_Dog: {
    ignored: false,
    description: 'is feeling asleep',
    name: 'mood_Asleep_Dog',
  },
  Mood_Bored: {
    ignored: false,
    description: 'is feeling bored',
    name: 'Mood_Bored',
  },
  Mood_Confident: {
    ignored: false,
    description: 'is feeling confident',
    name: 'Mood_Confident',
  },
  Mood_Dazed: {
    ignored: false,
    description: 'is feeling dazed',
    name: 'Mood_Dazed',
  },
  mood_Drowsy_Cat: {
    ignored: false,
    description: 'is feeling drowsy',
    name: 'mood_Drowsy_Cat',
  },
  Mood_Embarrassed: {
    ignored: false,
    description: 'is feeling embarrassed',
    name: 'Mood_Embarrassed',
  },
  Mood_Energized: {
    ignored: false,
    description: 'is feeling energized',
    name: 'Mood_Energized',
  },
  mood_Excited_Dog: {
    ignored: false,
    description: 'is feeling excited',
    name: 'mood_Excited_Dog',
  },
  Mood_Fine: {
    ignored: false,
    description: 'is feeling fine',
    name: 'Mood_Fine',
  },
  mood_Fine_Cat: {
    ignored: false,
    description: 'is feeling fine',
    name: 'mood_Fine_Cat',
  },
  mood_Fine_Dog: {
    ignored: false,
    description: 'is feeling fine',
    name: 'mood_Fine_Dog',
  },
  Mood_Flirty: {
    ignored: false,
    description: 'is feeling flirty',
    name: 'Mood_Flirty',
  },
  mood_Flirty_Cat: {
    ignored: false,
    description: 'is feeling flirty',
    name: 'mood_Flirty_Cat',
  },
  mood_Flirty_Dog: {
    ignored: false,
    description: 'is feeling flirty',
    name: 'mood_Flirty_Dog',
  },
  Mood_Focused: {
    ignored: false,
    description: 'is feeling focused',
    name: 'Mood_Focused',
  },
  Mood_Happy: {
    ignored: false,
    description: 'is feeling happy',
    name: 'Mood_Happy',
  },
  mood_Happy_Cat: {
    ignored: false,
    description: 'is feeling happy',
    name: 'mood_Happy_Cat',
  },
  mood_Happy_Dog: {
    ignored: false,
    description: 'is feeling happy',
    name: 'mood_Happy_Dog',
  },
  mood_Horse_Angry: {
    ignored: false,
    description: 'is feeling angry',
    name: 'mood_Horse_Angry',
  },
  mood_Horse_Asleep: {
    ignored: false,
    description: 'is feeling asleep',
    name: 'mood_Horse_Asleep',
  },
  mood_Horse_Confident: {
    ignored: false,
    description: 'is feeling confident',
    name: 'mood_Horse_Confident',
  },
  mood_Horse_Dazed: {
    ignored: false,
    description: 'is feeling dazed',
    name: 'mood_Horse_Dazed',
  },
  mood_Horse_Fine: {
    ignored: false,
    description: 'is feeling fine',
    name: 'mood_Horse_Fine',
  },
  Mood_Horse_Happy: {
    ignored: false,
    description: 'is feeling happy',
    name: 'Mood_Horse_Happy',
  },
  mood_Horse_Sad: {
    ignored: false,
    description: 'is feeling sad',
    name: 'mood_Horse_Sad',
  },
  mood_Horse_Scared: {
    ignored: false,
    description: 'is feeling scared',
    name: 'mood_Horse_Scared',
  },
  mood_Horse_Tense: {
    ignored: false,
    description: 'is feeling tense',
    name: 'mood_Horse_Tense',
  },
  mood_Horse_Uncomfortable: {
    ignored: false,
    description: 'is feeling uncomfortable',
    name: 'mood_Horse_Uncomfortable',
  },
  mood_Hyper_Pets: {
    ignored: false,
    description: 'is feeling hyper',
    name: 'mood_Hyper_Pets',
  },
  Mood_Inspired: {
    ignored: false,
    description: 'is feeling inspired',
    name: 'Mood_Inspired',
  },
  mood_Mopey_Dog: {
    ignored: false,
    description: 'is feeling mopey',
    name: 'mood_Mopey_Dog',
  },
  Mood_Playful: {
    ignored: false,
    description: 'is feeling playful',
    name: 'Mood_Playful',
  },
  Mood_Possessed: {
    ignored: false,
    description: 'is currently possessed',
    name: 'Mood_Possessed',
  },
  mood_Recharging: {
    ignored: false,
    description: 'is low on energy and is recharging',
    name: 'mood_Recharging',
  },
  Mood_Sad: {
    ignored: false,
    description: 'is feeling sad',
    name: 'Mood_Sad',
  },
  mood_Sad_Dog: {
    ignored: false,
    description: 'is feeling sad',
    name: 'mood_Sad_Dog',
  },
  Mood_Scared: {
    ignored: false,
    description: 'is feeling scared',
    name: 'Mood_Scared',
  },
  mood_Scared_Cat: {
    ignored: false,
    description: 'is feeling scared',
    name: 'mood_Scared_Cat',
  },
  mood_Scared_Dog: {
    ignored: false,
    description: 'is feeling scared',
    name: 'mood_Scared_Dog',
  },
  Mood_Stressed: {
    ignored: false,
    description: 'is feeling stressed',
    name: 'Mood_Stressed',
  },
  Mood_Uncomfortable: {
    ignored: false,
    description: 'is feeling uncomfortable',
    name: 'Mood_Uncomfortable',
  },
};
