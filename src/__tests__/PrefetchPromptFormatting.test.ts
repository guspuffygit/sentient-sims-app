import { describe, expect, it } from 'vitest';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { formatPreviouslyInScene, toPrimaryInteractionEvent } from 'main/sentient-sims/services/AIService';
import { InteractionEvent } from 'main/sentient-sims/models/InteractionEvents';

describe('prefetch prompt formatting', () => {
  it('renders pre-actions parenthesized without a location prefix', () => {
    const ctx = {
      locationRepository: {
        getLocation: () => ({ id: 7, name: 'The Blue Velvet', lot_type: 'Lounge' }),
      },
    } as unknown as ApiContext;
    const builder = new PromptRequestBuilderService(ctx);

    const messages = builder.groupMemories([
      { location_id: 7, event_type: 'interaction', pre_action: 'Alex waves', content: 'Alex: Hi.' },
      { location_id: 7, event_type: 'interaction', action: 'Morgan smiles' },
    ]);

    expect(messages[0]).toEqual({ role: 'user', content: '(Alex waves)' });
    expect(messages[1]).toEqual({ role: 'assistant', content: 'Alex: Hi.' });
    expect(messages[2]).toEqual({ role: 'user', content: 'At The Blue Velvet (Lounge), Morgan smiles' });
  });

  it('puts a blank line before a pre-action that follows dialogue', () => {
    expect(
      formatPreviouslyInScene([
        { role: 'assistant', content: 'Alex: Hi.' },
        { role: 'user', content: '(Morgan waves)' },
        { role: 'assistant', content: 'Morgan: Hey.' },
      ]),
    ).toBe('Alex: Hi.\n\n(Morgan waves)\nMorgan: Hey.');
  });

  it('limits ordinary interaction generation to the initiator and target', () => {
    const event = {
      sentient_sims: [{ name: 'Initiator' }, { name: 'Target' }, { name: 'Bystander' }],
    } as unknown as InteractionEvent;

    const primaryEvent = toPrimaryInteractionEvent(event);

    expect(primaryEvent.sentient_sims.map((sim) => sim.name)).toEqual(['Initiator', 'Target']);
    expect(event.sentient_sims).toHaveLength(3);
  });
});
