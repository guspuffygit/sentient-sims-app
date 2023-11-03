/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { ParticipantRepository } from 'main/sentient-sims/db/ParticipantRepository';
import { DbService } from 'main/sentient-sims/services/DbService';
import { ParticipantEntity } from 'main/sentient-sims/db/entities/ParticipantEntity';
import * as fs from 'fs';
import { mockDirectoryService, randomString } from './util';

describe('ParticipantRepository', () => {
  it('CRUD', async () => {
    const directoryService = mockDirectoryService();
    fs.mkdirSync(directoryService.getSentientSimsFolder(), {
      recursive: true,
    });
    const dbService = new DbService(directoryService);
    const participantRepository = new ParticipantRepository(dbService);

    const participant: ParticipantEntity = {
      id: 1029376491723,
      description: randomString(),
    };
    await participantRepository.updateParticipant(participant);

    const result = await participantRepository.getParticipants([
      {
        id: participant.id,
        fullName: 'Some name',
      },
      {
        id: 198273129837,
        fullName: 'Some other name',
      },
    ]);

    console.log(JSON.stringify(result));
    expect(result[0].id).toEqual(participant.id);
    expect(result[0].description).toEqual(participant.description);
    expect(result[1].id).toEqual(198273129837);
    expect(result[1].description).toBeFalsy();
    expect(result.length).toEqual(2);

    await participantRepository.deleteParticipant(participant);

    const noDescription: ParticipantEntity = { id: 91283 };
    await participantRepository.updateParticipant(noDescription);

    const noDescriptionResult = await participantRepository.getParticipants([
      {
        id: noDescription.id,
        fullName: 'some name',
      },
    ]);

    expect(noDescriptionResult[0].description).toBeNull();

    noDescription.description = randomString();
    await participantRepository.updateParticipant(noDescription);
    const descriptionChangedResult =
      await participantRepository.getParticipants([
        { id: noDescription.id, fullName: 'some name' },
      ]);
    expect(descriptionChangedResult[0].description).toEqual(
      noDescription.description
    );

    const defaultSimDescription = await participantRepository.getParticipant({
      id: 187263,
      fullName: 'Travis Scott',
    });

    expect(defaultSimDescription.description).toBeTruthy();

    const noDefaultSimDescription = await participantRepository.getParticipant({
      id: 187263,
      fullName: 'No Name',
    });

    expect(noDefaultSimDescription.description).toBeUndefined();
  });
});
