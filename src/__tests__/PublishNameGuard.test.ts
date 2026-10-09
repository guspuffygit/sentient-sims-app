import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { InteractionService } from 'main/sentient-sims/services/InteractionService';
import { mockApiContext } from './util';

// A mapping published online is shared with everyone who uses the mod, so the last thing
// between a sim's name and the whole user base is this check.
describe('publishing an online mapping', () => {
  let ctx: ApiContext;
  let published: string[];

  beforeEach(() => {
    ctx = mockApiContext();
    published = [];
    vi.spyOn(ctx.db, 'isLoaded').mockReturnValue(true);
    vi.spyOn(ctx.participantRepository, 'getAllNames').mockReturnValue(['Audrey Bennett', 'Elliot Jr']);
    vi.spyOn(ctx.interactionRepository, 'setInteraction').mockImplementation((interaction) => {
      published.push(interaction.action ?? '');
      return Promise.resolve({ [interaction.name]: interaction });
    });
  });

  it('refuses text that names a sim from the save, and publishes nothing', async () => {
    await expect(
      ctx.interactions.updateUnmappedInteraction({
        name: 'playmat_Socials_PlayWithInfant_PostureProvided',
        action: '{actor.0}: Play with Elliot Jr',
      }),
    ).rejects.toThrow(InteractionService.NAMES_FROM_SAVE);

    expect(published).toEqual([]);
  });

  it('publishes the same mapping once the name is a token', async () => {
    await ctx.interactions.updateUnmappedInteraction({
      name: 'playmat_Socials_PlayWithInfant_PostureProvided',
      action: '{actor.0}: Play with {actor.1}',
    });

    expect(published).toEqual(['{actor.0}: Play with {actor.1}']);
  });

  it('publishes anyway when the player insists', async () => {
    await ctx.interactions.updateUnmappedInteraction(
      { name: 'some_Interaction', action: '{actor.0}: Play with Elliot Jr' },
      true,
    );

    expect(published).toEqual(['{actor.0}: Play with Elliot Jr']);
  });

  it('has nothing to check against with no save loaded, and lets it through', async () => {
    vi.spyOn(ctx.db, 'isLoaded').mockReturnValue(false);

    await ctx.interactions.updateUnmappedInteraction({
      name: 'some_Interaction',
      action: '{actor.0}: Play with Elliot Jr',
    });

    expect(published).toEqual(['{actor.0}: Play with Elliot Jr']);
  });

  it('reports the names rather than just refusing, so the player can fix them', () => {
    expect(ctx.interactions.namesFromSaveIn('{actor.0}: Audrey Bennett waves at Elliot Jr')).toEqual([
      'Audrey Bennett',
      'Elliot Jr',
    ]);
  });
});
