import * as fs from 'fs';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { VoiceType } from 'main/sentient-sims/models/VoiceType';
import { mockApiContext, randomString } from './util';

describe('ParticipantRepository', () => {
  it('CRUD', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '9587321',
      saveId: '2',
    });

    const participant: ParticipantDTO = {
      id: '9223372036854775807', // Max 64 bit int
      description: randomString(),
    };
    ctx.participantRepository.updateParticipant(participant);

    const result = ctx.participantRepository.getParticipants([
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

    const noDescriptionResult = ctx.participantRepository.getParticipants([
      {
        id: noDescription.id,
        fullName: 'some name',
      },
    ]);

    expect(noDescriptionResult[0].description).toBeNull();

    noDescription.description = randomString();
    ctx.participantRepository.updateParticipant(noDescription);
    const descriptionChangedResult = ctx.participantRepository.getParticipants([
      { id: noDescription.id, fullName: 'some name' },
    ]);
    expect(descriptionChangedResult[0].description).toEqual(noDescription.description);

    const defaultSimDescription = ctx.participantRepository.getParticipant({
      id: '187263',
      fullName: 'Travis Scott',
    });

    expect(defaultSimDescription.description).toBeTruthy();

    const noDefaultSimDescription = ctx.participantRepository.getParticipant({
      id: '187263123',
      fullName: 'No Name',
    });

    const allParticipants = ctx.participantRepository.getAllParticipants();
    expect(allParticipants.some((item) => item.id === '187263' && item.name === 'Travis Scott')).toBeTruthy();

    expect(noDefaultSimDescription.description).toBeUndefined();
  });

  it('pins, keeps and clears a sim voice', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '9587322',
      saveId: '3',
    });

    const participant: ParticipantDTO = { id: '5551234', name: 'Voiced Sim' };
    ctx.participantRepository.updateParticipant(participant);
    ctx.participantRepository.setParticipantVoice(participant.id, VoiceType.ElevenLabs, {
      voiceId: 'voice-abc',
      voiceName: 'Some Voice',
    });

    expect(ctx.participantRepository.getParticipantVoices([participant.id, '404'], VoiceType.ElevenLabs)).toEqual(
      new Map([[participant.id, 'voice-abc']]),
    );

    const withVoice = ctx.participantRepository
      .getAllParticipants()
      .find((item) => item.id === participant.id) as ParticipantDTO;
    expect(withVoice.voices?.[VoiceType.ElevenLabs]).toEqual({ voiceId: 'voice-abc', voiceName: 'Some Voice' });

    // The mod re-writes participant rows constantly; the voice must survive that
    ctx.participantRepository.updateParticipant({ ...participant, description: 'Updated in game' });
    expect(
      ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.ElevenLabs).get(participant.id),
    ).toEqual('voice-abc');

    ctx.participantRepository.setParticipantVoice(participant.id, VoiceType.ElevenLabs);
    expect(ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.ElevenLabs).size).toEqual(0);
    const cleared = ctx.participantRepository
      .getAllParticipants()
      .find((item) => item.id === participant.id) as ParticipantDTO;
    expect(cleared.voices?.[VoiceType.ElevenLabs]).toBeUndefined();
  });

  it('keeps a separate pinned voice per voice type', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '9587323',
      saveId: '4',
    });

    const participant: ParticipantDTO = { id: '5551235', name: 'Dual Voiced Sim' };
    ctx.participantRepository.updateParticipant(participant);
    ctx.participantRepository.setParticipantVoice(participant.id, VoiceType.ElevenLabs, {
      voiceId: 'eleven-voice',
      voiceName: 'Eleven Voice',
    });
    ctx.participantRepository.setParticipantVoice(participant.id, VoiceType.Kokoro, {
      voiceId: 'af_heart+af_sky',
      voiceName: 'Heart + Sky',
    });

    // Each provider reads only its own pin, so switching back and forth loses nothing
    expect(
      ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.ElevenLabs).get(participant.id),
    ).toEqual('eleven-voice');
    expect(
      ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.Kokoro).get(participant.id),
    ).toEqual('af_heart+af_sky');

    const dto = ctx.participantRepository
      .getAllParticipants()
      .find((item) => item.id === participant.id) as ParticipantDTO;
    expect(dto.voices).toEqual({
      [VoiceType.ElevenLabs]: { voiceId: 'eleven-voice', voiceName: 'Eleven Voice' },
      [VoiceType.Kokoro]: { voiceId: 'af_heart+af_sky', voiceName: 'Heart + Sky' },
    });

    // Clearing one type leaves the other untouched
    ctx.participantRepository.setParticipantVoice(participant.id, VoiceType.Kokoro);
    expect(ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.Kokoro).size).toEqual(0);
    expect(
      ctx.participantRepository.getParticipantVoices([participant.id], VoiceType.ElevenLabs).get(participant.id),
    ).toEqual('eleven-voice');
  });
});
