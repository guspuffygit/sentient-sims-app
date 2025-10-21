import '@testing-library/jest-dom';
import * as fs from 'fs';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { mockApiContext } from './util';

describe('MemoryRepository', () => {
  it('CRUD', async () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    await ctx.db.loadDatabase({
      sessionId: '7981723',
      saveId: '2',
    });
    const participants: ParticipantDTO[] = [{ id: '128937674' }, { id: '18276365' }];
    const memory: MemoryEntity = {
      location_id: 90369424,
      pre_action: 'dioawjd',
      content: 'foiwje9if91082u',
      observation: 'joijofi10298',
      action: 'ojf0192830hkljh12',
    };
    const result = ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    expect(result.id).toBeGreaterThanOrEqual(0);
    expect(result.content).toEqual(memory.content);
    expect(result.pre_action).toEqual(memory.pre_action);
    expect(result.observation).toEqual(memory.observation);
    expect(result.location_id).toEqual(memory.location_id);
    expect(result.timestamp).toBeTruthy();
    expect(result.action).toEqual(memory.action);

    // Check createMemory also created memory_participants rows
    const memoryParticipants = ctx.memoryRepository.getMemoryParticipants({
      memory_id: Number(result.id),
    });
    expect(memoryParticipants).toHaveLength(2);

    const participantIds = participants.map((participant) => participant.id);
    memoryParticipants.forEach((memoryParticipant) => {
      expect(memoryParticipant.memory_id).toEqual(result.id);
      expect(participantIds).toContain(memoryParticipant.participant_id);
    });

    const expectedObservation = '10982730j1lj';
    memory.id = result.id;
    memory.observation = expectedObservation;

    ctx.memoryRepository.updateMemory(memory);

    const updatedMemory = ctx.memoryRepository.getMemory({
      id: Number(memory.id),
    });
    expect(updatedMemory.observation).toEqual(expectedObservation);

    const results = ctx.memoryRepository.getMemories();
    expect(results).toHaveLength(1);
    expect(updatedMemory).toEqual(results[0]);

    const noParticipantMemories = ctx.memoryRepository.getParticipantsMemories({
      participant_ids: ['9857897436'],
    });
    expect(noParticipantMemories).toHaveLength(0);

    const participantMemories = ctx.memoryRepository.getParticipantsMemories({
      participant_ids: ['128937674', '18276365'],
    });
    expect(participantMemories).toHaveLength(1);

    // Delete item
    ctx.memoryRepository.deleteMemory({ id: Number(memory.id) });
    const noResults = ctx.memoryRepository.getMemories();
    expect(noResults).toHaveLength(0);

    // Links rows in memory_participants table should be cascade deleted
    const noMemoryParticipants = ctx.memoryRepository.getMemoryParticipants({
      memory_id: Number(result.id),
    });
    expect(noMemoryParticipants).toHaveLength(0);

    // Test deleteAllMemories
    ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    ctx.memoryRepository.deleteAllMemories();
    const noResultsDeleteAll = ctx.memoryRepository.getMemories();
    expect(noResultsDeleteAll).toHaveLength(0);

    const throwsError = jest.fn(() => {
      ctx.memoryRepository.getMemory({ id: 99999 });
    });
    expect(throwsError).toThrow();
  });
});
