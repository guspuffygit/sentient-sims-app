import fs from 'fs';
import path from 'path';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { BasicInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { mockApiContext } from './util';

describe('InteractionRepository', () => {
  let ctx: ApiContext;

  const onlineInteractions = new Map<string, BasicInteraction>(
    Object.entries({
      // Overlaps a built-in description
      mixer_Baby_ShowOff: { name: 'mixer_Baby_ShowOff', action: 'online baby action' },
      // Online-only mapping
      Some_Mod_Interaction: { name: 'Some_Mod_Interaction', action: 'online mod action' },
      // Un-ignores an interaction that is ignored in the built-in descriptions
      mixer_MusicProductionStation_Remix: { name: 'mixer_MusicProductionStation_Remix', action: 'remixing a track' },
    }),
  );

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    vi.spyOn(ctx.interactionRepository, 'fetchInteractions').mockResolvedValue(onlineInteractions);
  });

  it('local override wins over built-in and online descriptions', async () => {
    ctx.interactionRepository.saveLocalInteraction({
      name: 'mixer_Baby_ShowOff',
      action: 'local baby action',
    });

    const description = await ctx.interactions.getInteractionDescription('mixer_Baby_ShowOff');

    expect(description?.pre_actions).toEqual(['local baby action']);
  });

  it('online mapping wins over built-in description', async () => {
    const description = await ctx.interactions.getInteractionDescription('mixer_Baby_ShowOff');

    expect(description?.pre_actions).toEqual(['online baby action']);
  });

  it('falls back to built-in description when no override exists', async () => {
    const description = await ctx.interactions.getInteractionDescription('mixer_ScienceTable_Empty');

    expect(description?.pre_actions).toEqual([
      '{actor.0} is preparing a scientific experiment with {actor.1} using an empty flask.',
    ]);
  });

  it('removing a local override restores the online description', async () => {
    ctx.interactionRepository.saveLocalInteraction({
      name: 'mixer_Baby_ShowOff',
      action: 'local baby action',
    });
    ctx.interactionRepository.deleteLocalInteraction('mixer_Baby_ShowOff');

    const description = await ctx.interactions.getInteractionDescription('mixer_Baby_ShowOff');

    expect(description?.pre_actions).toEqual(['online baby action']);

    const overridesFile = path.join(ctx.directory.getSentientSimsFolder(), 'user_interaction_overrides.json');
    const overrides = JSON.parse(fs.readFileSync(overridesFile, 'utf-8')) as Record<string, BasicInteraction>;
    expect(overrides).toEqual({});
  });

  it('saving a local override without a name throws', () => {
    expect(() => {
      ctx.interactionRepository.saveLocalInteraction({ name: '' });
    }).toThrow();
  });

  it('browsable interactions merge built-in, online, and local sources', async () => {
    ctx.interactionRepository.saveLocalInteraction({
      name: 'mixer_ScienceTable_Empty',
      action: 'local science action',
    });

    const browsable = await ctx.interactionRepository.getBrowsableInteractions();

    expect(browsable.get('mixer_Social_GetToKnow_Friendly_STC')).toEqual({
      name: 'mixer_Social_GetToKnow_Friendly_STC',
      action: '{actor.0} is asking {actor.1} to talk to about themselves.',
      ignored: undefined,
      source: 'built-in',
    });
    expect(browsable.get('mixer_Baby_ShowOff')).toEqual({
      name: 'mixer_Baby_ShowOff',
      action: 'online baby action',
      source: 'online',
    });
    expect(browsable.get('Some_Mod_Interaction')).toEqual({
      name: 'Some_Mod_Interaction',
      action: 'online mod action',
      source: 'online',
    });
    expect(browsable.get('mixer_ScienceTable_Empty')).toEqual({
      name: 'mixer_ScienceTable_Empty',
      action: 'local science action',
      source: 'local',
    });
    // The whole built-in catalog is browsable, not just the online mappings
    expect(browsable.size).toBeGreaterThan(1000);
  });

  it('background sync picks up online changes without a restart', async () => {
    await ctx.interactionRepository.getInteractions();

    const updated = new Map(onlineInteractions);
    updated.set('mixer_Baby_ShowOff', { name: 'mixer_Baby_ShowOff', action: 'updated online action' });
    vi.spyOn(ctx.interactionRepository, 'fetchInteractions').mockResolvedValue(updated);

    await ctx.interactionRepository.syncOnlineInteractions();

    const description = await ctx.interactions.getInteractionDescription('mixer_Baby_ShowOff');
    expect(description?.pre_actions).toEqual(['updated online action']);
  });

  it('background sync keeps the cache when the fetch fails', async () => {
    await ctx.interactionRepository.getInteractions();
    vi.spyOn(ctx.interactionRepository, 'fetchInteractions').mockRejectedValue(new Error('offline'));

    await ctx.interactionRepository.syncOnlineInteractions();

    const description = await ctx.interactions.getInteractionDescription('mixer_Baby_ShowOff');
    expect(description?.pre_actions).toEqual(['online baby action']);
  });

  it('ignored status follows override precedence: local > online > built-in', async () => {
    // Built-in ignores it, but the online mapping replaces the built-in entirely
    let ignored = (await ctx.interactionRepository.getIgnoredInteractions()).ignoredInteractionNames;
    expect(ignored).not.toContain('mixer_MusicProductionStation_Remix');
    expect(ignored).toContain('mixer_MusicProductionStation_Idle');

    // A local override can ignore an interaction
    ctx.interactionRepository.saveLocalInteraction({
      name: 'mixer_MusicProductionStation_Remix',
      action: 'remixing a track',
      ignored: true,
    });
    ignored = (await ctx.interactionRepository.getIgnoredInteractions()).ignoredInteractionNames;
    expect(ignored).toContain('mixer_MusicProductionStation_Remix');

    // And un-ignore one that the built-in descriptions ignore
    ctx.interactionRepository.saveLocalInteraction({
      name: 'mixer_MusicProductionStation_Idle',
      action: 'idling at the music station',
      ignored: false,
    });
    ignored = (await ctx.interactionRepository.getIgnoredInteractions()).ignoredInteractionNames;
    expect(ignored).not.toContain('mixer_MusicProductionStation_Idle');
  });
});
