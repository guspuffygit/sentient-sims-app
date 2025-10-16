import '@testing-library/jest-dom';
import * as fs from 'fs';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { mockApiContext, randomString } from './util';

describe('ParticipantRepository', () => {
  it('CRUD', async () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    await ctx.db.loadDatabase({
      sessionId: '9587321',
      saveId: '2',
    });

    const participant: ParticipantDTO = {
      id: '9223372036854775807', // Max 64 bit int
      description: randomString(),
    };
    ctx.participantRepository.updateParticipant(participant);

    const result = await ctx.participantRepository.getParticipants([
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

    ctx.participantRepository.deleteParticipant(participant);

    const noDescription: ParticipantDTO = { id: '91283' };
    ctx.participantRepository.updateParticipant(noDescription);

    const noDescriptionResult = await ctx.participantRepository.getParticipants([
      {
        id: noDescription.id,
        fullName: 'some name',
      },
    ]);

    expect(noDescriptionResult[0].description).toBeNull();

    noDescription.description = randomString();
    ctx.participantRepository.updateParticipant(noDescription);
    const descriptionChangedResult = await ctx.participantRepository.getParticipants([
      { id: noDescription.id, fullName: 'some name' },
    ]);
    expect(descriptionChangedResult[0].description).toEqual(noDescription.description);

    const defaultSimDescription = await ctx.participantRepository.getParticipant({
      id: '187263',
      fullName: 'Travis Scott',
    });

    expect(defaultSimDescription.description).toBeTruthy();

    const noDefaultSimDescription = await ctx.participantRepository.getParticipant({
      id: '187263123',
      fullName: 'No Name',
    });

    const allParticipants = ctx.participantRepository.getAllParticipants();
    expect(allParticipants.some((item) => item.id === '187263' && item.name === 'Travis Scott')).toBeTruthy();

    expect(noDefaultSimDescription.description).toBeUndefined();
  });
});
