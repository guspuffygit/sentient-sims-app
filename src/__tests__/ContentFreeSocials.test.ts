import { describe, expect, it } from 'vitest';
import {
  CONTENT_FREE_SOCIAL_HINT,
  contentFreeSocialHint,
  withContentFreeHint,
} from 'main/sentient-sims/pipeline/prompts/scene';

// J6 (the 2026-09-04 playtest handoff, cause 6): mixer_social_InsideJoke gave the model nothing to
// joke about, so Margo produced "Remember that time you got stuck in the snowbank" and it
// replayed into 137 later prompt lines. The pre-action for a content-free social now says
// where the material may come from; every other interaction is untouched.
describe('content-free social hint', () => {
  it('fires for the jokes, stories and gossip the game stages without content', () => {
    for (const name of [
      'mixer_social_InsideJoke_targeted_Friendly_alwaysOn',
      'mixer_socials_TellJoke_group_Funny_alwaysOn',
      'mixer_social_TellFunnyStory_targeted_Friendly',
      'mixer_social_Gossip_targeted_Friendly',
      'mixer_social_Reminisce_targeted_Friendly',
      'mixer_social_TellStory_Group',
    ]) {
      expect(contentFreeSocialHint(name), name).toBe(CONTENT_FREE_SOCIAL_HINT);
    }
  });

  it('stays silent for everything else', () => {
    expect(contentFreeSocialHint('sim_Chat')).toBeUndefined();
    expect(contentFreeSocialHint('mixer_social_AskAboutDay_targeted_Friendly_alwaysOn')).toBeUndefined();
    expect(contentFreeSocialHint('fridge_GrabSnackAutonomously')).toBeUndefined();
    expect(contentFreeSocialHint(undefined)).toBeUndefined();
    expect(contentFreeSocialHint('')).toBeUndefined();
  });

  it('appends the line to the rendered pre-action and leaves other pre-actions byte-identical', () => {
    const rendered = 'Margo Calloway tells Halley an inside joke.';
    expect(withContentFreeHint(rendered, 'mixer_social_InsideJoke_targeted_Friendly_alwaysOn')).toBe(
      `${rendered} ${CONTENT_FREE_SOCIAL_HINT}`,
    );
    const chat = 'Margo Calloway chats with Halley.';
    expect(withContentFreeHint(chat, 'sim_Chat')).toBe(chat);
    expect(withContentFreeHint(undefined, 'mixer_social_InsideJoke')).toBeUndefined();
  });
});
