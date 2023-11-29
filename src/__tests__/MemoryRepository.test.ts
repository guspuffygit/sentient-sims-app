import '@testing-library/jest-dom';
import * as fs from 'fs';
import { DbService } from 'main/sentient-sims/services/DbService';
import { MemoryRepository } from 'main/sentient-sims/db/MemoryRepository';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { ParticipantEntity } from 'main/sentient-sims/db/entities/ParticipantEntity';
import { mockDirectoryService } from './util';

describe('MemoryRepository', () => {
  it('CRUD', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    await dbService.loadDatabase('7981723');
    const memoryRepository = new MemoryRepository(dbService);
    const participants: ParticipantEntity[] = [
      { id: 128937674 },
      { id: 18276365 },
    ];
    const memory: MemoryEntity = {
      location_id: 90369424,
      pre_action: 'dioawjd',
      content: 'foiwje9if91082u',
      observation: 'joijofi10298',
    };
    const result = await memoryRepository.createMemory({
      memory,
      participants,
    });
    expect(result.id).toBeDefined();
    expect(result.content).toEqual(memory.content);
    expect(result.pre_action).toEqual(memory.pre_action);
    expect(result.observation).toEqual(memory.observation);
    expect(result.location_id).toEqual(memory.location_id);
    expect(result.timestamp).toBeDefined();

    const memoryParticipants = await memoryRepository.getMemoryParticipants({
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

    const updateResult = await memoryRepository.updateMemory(memory);
    expect(memory.id).toEqual(updateResult);

    const updatedMemory = await memoryRepository.getMemory({
      id: updateResult,
    });
    expect(updatedMemory.observation).toEqual(expectedObservation);

    const results = await memoryRepository.getMemories();
    expect(results).toHaveLength(1);
    expect(updatedMemory).toEqual(results[0]);

    const noParticipantMemories =
      await memoryRepository.getParticipantsMemories({
        participant_ids: [9857897436],
      });
    expect(noParticipantMemories).toHaveLength(0);
    const participantMemories = await memoryRepository.getParticipantsMemories({
      participant_ids: [128937674, 18276365],
    });
    expect(participantMemories).toHaveLength(1);

    // Delete item
    await memoryRepository.deleteMemory({ id: updateResult });
    const noResults = await memoryRepository.getMemories();
    expect(noResults).toHaveLength(0);

    // Links rows in memory_participants table should be cascade deleted
    const noMemoryParticipants = await memoryRepository.getMemoryParticipants({
      memory_id: Number(result.id),
    });
    expect(noMemoryParticipants).toHaveLength(0);

    // Test deleteAllMemories
    await memoryRepository.createMemory({
      memory,
      participants,
    });
    await memoryRepository.createMemory({
      memory,
      participants,
    });
    await memoryRepository.deleteAllMemories();
    const noResultsDeleteAll = await memoryRepository.getMemories();
    expect(noResultsDeleteAll).toHaveLength(0);
  });
});
