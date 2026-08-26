import { vi } from 'vitest';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { VoiceType } from 'main/sentient-sims/models/VoiceType';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('main/sentient-sims/util/browserWindows', () => ({
  getAllBrowserWindows: () => [{ webContents: { isDestroyed: () => false, send } }],
}));

// Imported after the mock so notifyRenderer picks up the fake window
const { playTTS, playTTSLines } = await import('main/sentient-sims/util/notifyRenderer');

function makeSim(overrides: Partial<SentientSim>): SentientSim {
  return {
    careers: [],
    name: 'Test Sim',
    age: SimAge.ADULT,
    sim_id: '1',
    gender: 'Male',
    traits: [],
    moods: [],
    is_ghost: false,
    grubby: false,
    in_pool: false,
    is_at_home: false,
    is_dying: false,
    is_human: true,
    is_inside_building: false,
    is_outside: false,
    is_pet: false,
    on_fire: false,
    on_home_lot: false,
    sleeping: false,
    is_pregnant: false,
    is_player_sim: true,
    ...overrides,
  };
}

const ricky = makeSim({ name: 'Ricky Rickerson', sim_id: '1', gender: 'Male', traits: ['trait_Evil'] });
const bella = makeSim({ name: 'Bella Goth', sim_id: '2', gender: 'Female', traits: ['trait_Romantic'] });

function sentVoiceLines(): DialogueLine[] {
  const call = send.mock.calls.find(([channel]) => channel === 'on-voice');
  if (!call) {
    throw new Error('No on-voice message was sent');
  }
  return call[1] as DialogueLine[];
}

describe('playTTS', () => {
  beforeEach(() => {
    send.mockClear();
  });

  it('casts a voice per speaker for screenplay output', () => {
    playTTS('Ricky Rickerson: "Been fishing here for years."\nBella Goth: "Maybe next weekend."', [ricky, bella], {
      voiceType: VoiceType.ElevenLabs,
    });

    const lines = sentVoiceLines();
    expect(lines).toHaveLength(2);
    expect(lines[0].speaker).toEqual('Ricky Rickerson');
    expect(lines[1].speaker).toEqual('Bella Goth');
    expect(lines[0].voiceId).toBeTruthy();
    expect(lines[1].voiceId).toBeTruthy();
    expect(lines[0].voiceId).not.toEqual(lines[1].voiceId);
  });

  it('casts a voice for a single sim speaking in screenplay format', () => {
    playTTS('Ricky Rickerson: "Been fishing here for years."', [ricky], { voiceType: VoiceType.ElevenLabs });

    const lines = sentVoiceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].voiceId).toBeTruthy();
  });

  it('carries the delivery note through to the renderer', () => {
    playTTS('Ricky Rickerson: (nervous) "Been fishing here for years."', [ricky], { voiceType: VoiceType.ElevenLabs });

    expect(sentVoiceLines()[0].deliveryNote).toEqual('nervous');
  });

  it('speaks the whole response when only part of it parses as dialogue', () => {
    const mixed = 'Ricky smirks, leaning back.\nRicky Rickerson: "Been fishing here for years."';
    playTTS(mixed, [ricky], { voiceType: VoiceType.ElevenLabs });

    const lines = sentVoiceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].speaker).toEqual('Narrator');
    expect(lines[0].text).toContain('Ricky smirks, leaning back.');
    expect(lines[0].text).toContain('Been fishing here for years.');
  });

  it('speaks plain prose narration as one narrator line', () => {
    const prose = 'The house is quiet late at night, warm and lived-in.';
    playTTS(prose, [ricky], { voiceType: VoiceType.ElevenLabs });

    const lines = sentVoiceLines();
    expect(lines).toEqual([{ speaker: 'Narrator', text: prose }]);
  });

  it('leaves multi-paragraph prose intact', () => {
    const prose = 'Ricky casts his line into the water.\n\nThe afternoon stretches on, quiet and slow.';
    playTTS(prose, [ricky], { voiceType: VoiceType.ElevenLabs });

    const lines = sentVoiceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toContain('Ricky casts his line into the water.');
    expect(lines[0].text).toContain('The afternoon stretches on, quiet and slow.');
  });

  it('works with no sims at all', () => {
    playTTS('Ricky Rickerson: "Been fishing here for years."');

    const lines = sentVoiceLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].voiceId).toBeUndefined();
  });
});

describe('playTTSLines', () => {
  beforeEach(() => {
    send.mockClear();
  });

  it('casts voices onto already-parsed lines', () => {
    playTTSLines([{ speaker: 'Ricky Rickerson', text: 'Been fishing here for years.' }], [ricky], {
      voiceType: VoiceType.ElevenLabs,
    });

    expect(sentVoiceLines()[0].voiceId).toBeTruthy();
  });

  it('leaves lines uncast when no sims are supplied', () => {
    playTTSLines([{ speaker: 'Narrator', text: 'The house is quiet.' }]);

    expect(sentVoiceLines()).toEqual([{ speaker: 'Narrator', text: 'The house is quiet.' }]);
  });

  it('leaves lines uncast when the active TTS setup has no voice type', () => {
    playTTSLines([{ speaker: 'Ricky Rickerson', text: 'Been fishing here for years.' }], [ricky]);

    expect(sentVoiceLines()[0].voiceId).toBeUndefined();
  });

  it('casts a kokoro blend per speaker when the kokoro voice type is active', () => {
    playTTSLines(
      [
        { speaker: 'Ricky Rickerson', text: 'Been fishing here for years.' },
        { speaker: 'Bella Goth', text: 'Maybe next weekend.' },
      ],
      [ricky, bella],
      { voiceType: VoiceType.Kokoro },
    );

    const lines = sentVoiceLines();
    expect(lines[0].voiceId).toContain('+');
    expect(lines[1].voiceId).toContain('+');
    expect(lines[0].voiceId).not.toEqual(lines[1].voiceId);
  });

  it('prefers a pinned kokoro blend over the automatic cast', () => {
    playTTSLines([{ speaker: 'Ricky Rickerson', text: 'Been fishing here for years.' }], [ricky], {
      voiceType: VoiceType.Kokoro,
      voiceOverrides: new Map([['1', 'am_michael+am_puck']]),
    });

    expect(sentVoiceLines()[0].voiceId).toEqual('am_michael+am_puck');
  });
});
