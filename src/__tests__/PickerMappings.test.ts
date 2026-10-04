import { interactionDescriptions } from 'main/sentient-sims/descriptions/interactionDescriptions';

// Night watch 2026-08-18: `autonomousSimPicker_SocialObservation_FamiliarChat` was mapped
// with a `{actor.1}` pre_action, but picker super-interactions fire with the ACTOR ONLY —
// the target is chosen after the event is sent — so the token never resolved and every one
// of the 127 renders that night was flagged degenerate ("… chat with {actor.1}, a familiar
// face."). Every other picker row is `ignored: true`; the picked social's own mixers carry
// the real memory. This lint keeps a two-participant template from ever being attached to a
// picker again.
const PICKER_PREFIXES = ['autonomousSimPicker_', 'autonomous_ObjectPicker_'];

describe('picker interaction mappings', () => {
  it('never reference a second participant (pickers fire with the actor only)', () => {
    const offenders: string[] = [];
    interactionDescriptions.forEach((description, name) => {
      if (!PICKER_PREFIXES.some((p) => name.startsWith(p))) {
        return;
      }
      if (description.ignored) {
        return;
      }
      const preActions = description.pre_actions ?? [];
      if (preActions.some((line) => /\{actor\.[1-9]\d*\}/.test(line))) {
        offenders.push(name);
      }
    });
    expect(offenders).toEqual([]);
  });
});
