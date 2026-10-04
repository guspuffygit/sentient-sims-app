import { describe, expect, it } from 'vitest';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import {
  MAX_SCENE_PERFORMERS,
  formatPreviouslyInScene,
  toPrimaryInteractionEvent,
} from 'main/sentient-sims/services/AIService';
import { InteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';

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

  it('keeps every member of a small group as a performer', () => {
    const event = {
      sentient_sims: [
        { sim_id: '1', name: 'Initiator' },
        { sim_id: '2', name: 'Target' },
        { sim_id: '3', name: 'Bystander' },
      ],
      relationships: {
        relationship_bits: [
          { sim_one_id: '1', sim_two_id: '2', name: 'has_met' },
          { sim_one_id: '2', sim_two_id: '3', name: 'romantic-Married' },
        ],
      },
    } as unknown as InteractionEvent;

    const primaryEvent = toPrimaryInteractionEvent(event);
    expect(primaryEvent).toBe(event);
    expect(primaryEvent.sentient_sims.map((sim) => sim.name)).toEqual(['Initiator', 'Target', 'Bystander']);
    expect(primaryEvent.relationships?.relationship_bits).toHaveLength(2);
  });

  const bigGroup = (playerIndex?: number) =>
    ({
      sentient_sims: Array.from({ length: MAX_SCENE_PERFORMERS + 3 }, (_, i) => ({
        sim_id: String(i + 1),
        name: `Sim${i + 1}`,
        is_player_sim: i === playerIndex,
      })),
      relationships: {
        relationship_bits: [
          { sim_one_id: '1', sim_two_id: '2', name: 'has_met' },
          { sim_one_id: '1', sim_two_id: String(MAX_SCENE_PERFORMERS + 3), name: 'has_met' },
        ],
      },
    }) as unknown as InteractionEvent;

  it('caps an oversized group at the performer limit, actor first', () => {
    for (let i = 0; i < 10; i += 1) {
      const primaryEvent = toPrimaryInteractionEvent(bigGroup());
      const names = primaryEvent.sentient_sims.map((sim) => sim.name);
      expect(names).toHaveLength(MAX_SCENE_PERFORMERS);
      expect(names[0]).toBe('Sim1');
      expect(new Set(names).size).toBe(MAX_SCENE_PERFORMERS);
    }
  });

  it('always keeps the player sim when capping an NPC-initiated group', () => {
    for (let i = 0; i < 20; i += 1) {
      const primaryEvent = toPrimaryInteractionEvent(bigGroup(MAX_SCENE_PERFORMERS + 2));
      const names = primaryEvent.sentient_sims.map((sim) => sim.name);
      expect(names[0]).toBe('Sim1');
      expect(names).toContain(`Sim${MAX_SCENE_PERFORMERS + 3}`);
    }
  });

  it('trims relationship bits to the kept performers when capping', () => {
    const event = bigGroup();
    const primaryEvent = toPrimaryInteractionEvent(event);
    const keptIds = new Set(primaryEvent.sentient_sims.map((sim) => sim.sim_id));
    primaryEvent.relationships?.relationship_bits?.forEach((bit) => {
      expect(keptIds.has(bit.sim_one_id)).toBe(true);
      expect(keptIds.has(bit.sim_two_id)).toBe(true);
    });
    expect(event.relationships?.relationship_bits).toHaveLength(2);
  });

  it('formatSims skips relationship bits whose sims are not in the event', () => {
    const ctx = {
      participantRepository: {
        getParticipants: () => [],
      },
      // V-6: formatSims offers every undescribed sim to the default-description generator
      defaultDescriptions: { considerSim: () => undefined },
      settings: { directedScenesEnabled: true },
    } as unknown as ApiContext;
    const builder = new PromptRequestBuilderService(ctx);

    const sims = [
      { sim_id: '1', name: 'Bella Goth', gender: 'Female', age: 32, traits: [], moods: [], careers: [] },
      { sim_id: '2', name: 'Liberty Lee', gender: 'Female', age: 32, traits: [], moods: [], careers: [] },
    ] as unknown as SentientSim[];
    const location = { id: 7, name: 'The Blue Velvet', lot_type: 'Lounge', description: '' } as LocationEntity;

    const formatted = builder.formatSims(sims, location, {
      relationship_bits: [
        // References a sim (e.g. an off-lot spouse) who is not part of the event
        { sim_one_id: '1', sim_two_id: '999', name: 'family_Target_IsHusbandWifeOf_Actor' },
        { sim_one_id: '1', sim_two_id: '2', name: 'family_Target_IsBrotherSisterOf_Actor' },
      ],
    });

    const relationshipBlock = formatted.find((part) => part.includes('<RELATIONSHIPS>'));
    expect(relationshipBlock).toContain('Liberty Lee is the');
    expect(relationshipBlock).not.toContain('married');
  });
});
