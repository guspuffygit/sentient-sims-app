/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { ParticipantRepository } from 'main/sentient-sims/db/ParticipantRepository';
import { DbService } from 'main/sentient-sims/services/DbService';
import * as fs from 'fs';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { mockDirectoryService, randomString } from './util';

describe('ParticipantRepository', () => {
  it('CRUD', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    await dbService.loadDatabase({
      sessionId: '9587321',
      saveId: '2',
    });
    const participantRepository = new ParticipantRepository(dbService);

    const participant: ParticipantDTO = {
      id: '9223372036854775807', // Max 64 bit int
      description: randomString(),
    };
    participantRepository.updateParticipant(participant);

    const result = await participantRepository.getParticipants([
      {
        id: participant.id,
        fullName: 'Some name',
      },
      {
        id: '198273129837',
        fullName: 'Some other name',
      },
    ]);

    console.log(JSON.stringify(result));
    expect(result[0].id).toEqual(participant.id);
    expect(result[0].description).toEqual(participant.description);
    expect(result[1].id).toEqual('198273129837');
    expect(result[1].description).toBeFalsy();
    expect(result.length).toEqual(2);

    participantRepository.deleteParticipant(participant);

    const noDescription: ParticipantDTO = { id: '91283' };
    participantRepository.updateParticipant(noDescription);

    const noDescriptionResult = await participantRepository.getParticipants([
      {
        id: noDescription.id,
        fullName: 'some name',
      },
    ]);

    expect(noDescriptionResult[0].description).toBeNull();

    noDescription.description = randomString();
    participantRepository.updateParticipant(noDescription);
    const descriptionChangedResult =
      await participantRepository.getParticipants([
        { id: noDescription.id, fullName: 'some name' },
      ]);
    expect(descriptionChangedResult[0].description).toEqual(
      noDescription.description
    );

    const defaultSimDescription = await participantRepository.getParticipant({
      id: '187263',
      fullName: 'Travis Scott',
    });

    expect(defaultSimDescription.description).toBeTruthy();

    const noDefaultSimDescription = await participantRepository.getParticipant({
      id: '187263123',
      fullName: 'No Name',
    });

    const allParticipants = participantRepository.getAllParticipants();
    expect(
      allParticipants.some(
        (item) => item.id === '187263' && item.name === 'Travis Scott'
      )
    ).toBeTruthy();

    expect(noDefaultSimDescription.description).toBeUndefined();
  });
});
