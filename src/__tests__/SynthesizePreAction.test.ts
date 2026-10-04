import { synthesizeInteractionDescription } from 'main/sentient-sims/util/synthesizePreAction';
import { isDegeneratePreAction } from 'main/sentient-sims/util/degeneratePreAction';
import { formatAction } from 'main/sentient-sims/formatter/PromptFormatter';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';

const sims = [{ name: 'Audrey Bennett' }, { name: 'Yuki Behr' }] as SentientSim[];

describe('synthesizeInteractionDescription', () => {
  it("uses the game's pie-menu label when the mod sends one", () => {
    const description = synthesizeInteractionDescription(
      'TURBODRIVER:WickedWhims_Archetype_Sage_TalkAboutRecentStudies',
      2,
      'Talk about Recent Studies',
    );
    expect(description?.pre_actions).toEqual(['{actor.0}: Talk about Recent Studies (with {actor.1})']);
  });

  it('does not name the target twice, or at all when the sim is alone', () => {
    expect(synthesizeInteractionDescription('sim_Chat', 2, 'Chat with Yuki')?.pre_actions).toEqual([
      '{actor.0}: Chat with Yuki',
    ]);
    expect(synthesizeInteractionDescription('seating_Sit', 1, 'Sit')?.pre_actions).toEqual(['{actor.0}: Sit']);
  });

  it('renders to a line the degenerate check lets through', () => {
    const description = synthesizeInteractionDescription('seating_Sit', 1, 'Sit');
    const template = description?.pre_actions?.[0] as string;
    const location = { name: 'Home', lot_type: 'Residential', description: '' } as unknown as LocationEntity;
    const rendered = formatAction(template, sims, location);
    expect(rendered).toEqual('Audrey Bennett: Sit');
    expect(isDegeneratePreAction(rendered, template)).toBe(false);
  });

  it("prefers the mod's name-free template over the label the game rendered", () => {
    // The mapping browser offers this line as text to publish to everyone, so the one
    // thing it must not carry is the name of a sim in this save
    const description = synthesizeInteractionDescription(
      'playmat_Socials_PlayWithInfant_PostureProvided',
      2,
      'Play with Elliot Jr',
      'Play with {actor.1}',
    );
    expect(description?.pre_actions).toEqual(['{actor.0}: Play with {actor.1}']);
  });

  it('does not add the target twice when the template already names them', () => {
    expect(
      synthesizeInteractionDescription('mixer_social_Hug', 2, 'Give Yuki a hug', 'Give {actor.1} a hug')?.pre_actions,
    ).toEqual(['{actor.0}: Give {actor.1} a hug']);
  });

  it('renders a template line back to the words the player saw', () => {
    const description = synthesizeInteractionDescription('sim_Chat', 2, 'Chat with Yuki', 'Chat with {actor.1}');
    const template = description?.pre_actions?.[0] as string;
    const location = { name: 'Home', lot_type: 'Residential', description: '' } as unknown as LocationEntity;
    const rendered = formatAction(template, sims, location);
    expect(rendered).toEqual('Audrey Bennett: Chat with Yuki Behr');
    expect(isDegeneratePreAction(rendered, template)).toBe(false);
  });

  it('still ignores scaffolding tunings whatever their label says', () => {
    expect(synthesizeInteractionDescription('sim_Stand_Passive', 1, 'Stand')).toEqual({ ignored: true });
  });

  it('falls back to the tuning name without a label', () => {
    expect(synthesizeInteractionDescription('mixer_social_BabyTalk_targeted', 2)?.pre_actions).toEqual([
      "{actor.0} is busy with 'baby talk' with {actor.1}.",
    ]);
  });
});
