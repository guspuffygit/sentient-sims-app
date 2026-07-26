import { describe, expect, it } from 'vitest';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { formatPreviouslyInScene, toPrimaryInteractionEvent } from 'main/sentient-sims/services/AIService';
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

  it('narrows a group interaction to the initiator plus one rotating partner', () => {
    const event = {
      sentient_sims: [
        { sim_id: '1', name: 'Initiator' },
        { sim_id: '2', name: 'Target' },
        { sim_id: '3', name: 'Bystander' },
      ],
    } as unknown as InteractionEvent;

    for (let i = 0; i < 10; i += 1) {
      const primaryEvent = toPrimaryInteractionEvent(event);
      const names = primaryEvent.sentient_sims.map((sim) => sim.name);
      expect(names).toHaveLength(2);
      expect(names[0]).toBe('Initiator');
      expect(['Target', 'Bystander']).toContain(names[1]);
    }
    expect(event.sentient_sims).toHaveLength(3);
  });

  it('rotates through different partners across narrowings', () => {
    const event = {
      sentient_sims: [
        { sim_id: '1', name: 'Initiator' },
        { sim_id: '2', name: 'Target' },
        { sim_id: '3', name: 'Bystander' },
      ],
    } as unknown as InteractionEvent;

    const partners = new Set<string>();
    for (let i = 0; i < 200 && partners.size < 2; i += 1) {
      partners.add(toPrimaryInteractionEvent(event).sentient_sims[1].name);
    }
    expect(partners).toEqual(new Set(['Target', 'Bystander']));
  });

  it('favors the player sim as partner when an NPC initiates a group beat', () => {
    const event = {
      sentient_sims: [
        { sim_id: '1', name: 'NpcActor' },
        { sim_id: '2', name: 'OtherNpc' },
        { sim_id: '3', name: 'Player', is_player_sim: true },
      ],
    } as unknown as InteractionEvent;

    let playerPicks = 0;
    let npcPicks = 0;
    for (let i = 0; i < 400; i += 1) {
      const partner = toPrimaryInteractionEvent(event).sentient_sims[1];
      if (partner.name === 'Player') {
        playerPicks += 1;
      } else {
        npcPicks += 1;
      }
    }
    // Weighted pick lands on the player ~80% of the time; NPC-NPC still occurs
    expect(playerPicks).toBeGreaterThan(npcPicks);
    expect(npcPicks).toBeGreaterThan(0);
  });

  it('trims relationship bits to the narrowed pair', () => {
    const event = {
      sentient_sims: [
        { sim_id: '1', name: 'Initiator' },
        { sim_id: '2', name: 'Target' },
        { sim_id: '3', name: 'Bystander' },
      ],
      relationships: {
        relationship_bits: [
          { sim_one_id: '1', sim_two_id: '2', name: 'has_met' },
          { sim_one_id: '1', sim_two_id: '3', name: 'has_met' },
          { sim_one_id: '2', sim_two_id: '3', name: 'romantic-Married' },
        ],
      },
    } as unknown as InteractionEvent;

    const primaryEvent = toPrimaryInteractionEvent(event);
    const pairIds = new Set(primaryEvent.sentient_sims.map((sim) => sim.sim_id));
    primaryEvent.relationships?.relationship_bits?.forEach((bit) => {
      expect(pairIds.has(bit.sim_one_id)).toBe(true);
      expect(pairIds.has(bit.sim_two_id)).toBe(true);
    });
    expect(event.relationships?.relationship_bits).toHaveLength(3);
  });

  it('formatSims skips relationship bits whose sims are not in the event', () => {
    const ctx = {
      participantRepository: {
        getParticipants: () => [],
      },
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
