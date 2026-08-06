import { interactionDisplayName } from 'main/sentient-sims/util/interactionDisplayName';

describe('interactionDisplayName', () => {
  it('strips structural noise and splits camelCase into pie-menu-style words', () => {
    expect(interactionDisplayName('mixer_social_PassionateKiss_targeted_romance_emotionSpecific')).toEqual(
      'Passionate Kiss',
    );
    expect(interactionDisplayName('mixer_social_HeartfeltCompliment_targeted_friendly_alwaysOn')).toEqual(
      'Heartfelt Compliment',
    );
    expect(interactionDisplayName('mixer_Social_GetToKnow_Friendly_STC')).toEqual('Get To Know');
    expect(interactionDisplayName('mixer_social_Insult_Mean_STC')).toEqual('Insult');
  });

  it('handles non-mixer tuning names', () => {
    expect(interactionDisplayName('fridge_GrabSnackAutonomously')).toEqual('Fridge Grab Snack Autonomously');
    expect(interactionDisplayName('socialMixer_Greetings_BowGreeting')).toEqual('Greetings Bow Greeting');
  });

  it('falls back to the full name when every token is noise', () => {
    expect(interactionDisplayName('mixer_social_targeted')).toEqual('Mixer Social Targeted');
  });

  it('never returns an empty string', () => {
    expect(interactionDisplayName('___')).toEqual('___');
  });
});
