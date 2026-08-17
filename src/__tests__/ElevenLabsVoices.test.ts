import {
  emptyElevenLabsVoicesCache,
  sanitizeElevenLabsVoicesCache,
  toElevenLabsVoices,
} from 'main/sentient-sims/models/ElevenLabsVoice';

describe('ElevenLabs voices', () => {
  it('maps the API response, skipping entries without an id', () => {
    const voices = toElevenLabsVoices({
      voices: [
        { voice_id: 'zzz', name: 'Zoe', category: 'cloned' },
        { voice_id: 'aaa', name: 'Aaron', category: 'premade' },
        { name: 'No id' },
        { voice_id: 'nnn' },
      ],
    });

    expect(voices).toEqual([
      { voiceId: 'aaa', name: 'Aaron', category: 'premade' },
      { voiceId: 'nnn', name: 'nnn', category: undefined },
      { voiceId: 'zzz', name: 'Zoe', category: 'cloned' },
    ]);
  });

  it('returns nothing for unexpected response shapes', () => {
    expect(toElevenLabsVoices(undefined)).toEqual([]);
    expect(toElevenLabsVoices({ voices: 'nope' })).toEqual([]);
  });

  it('drops malformed cache entries stored by older versions', () => {
    expect(sanitizeElevenLabsVoicesCache(null)).toEqual(emptyElevenLabsVoicesCache);
    expect(sanitizeElevenLabsVoicesCache({ voices: [{ voiceId: 'aaa' }, { voiceId: 'bbb', name: 'Bee' }] })).toEqual({
      voices: [{ voiceId: 'bbb', name: 'Bee', category: undefined }],
      updatedAt: undefined,
    });
  });
});
