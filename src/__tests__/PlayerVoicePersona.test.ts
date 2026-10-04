import { describe, expect, it } from 'vitest';
import {
  playerPersonaFlavor,
  playerSpeakerLabel,
  sanitizePlayerVoiceName,
} from 'main/sentient-sims/models/PlayerVoicePersona';

describe('player voice persona', () => {
  it('strips what would break the mod speaker tag', () => {
    // A colon splits the "speaker: line" prefix; parens nest inside the display tag, and
    // a tag over 40 chars fails the mod's regex, demoting the line to narration
    expect(sanitizePlayerVoiceName('Robin: (streamer)')).toBe('Robin streamer');
    expect(sanitizePlayerVoiceName('  The   Watcher  ')).toBe('The Watcher');
    expect(sanitizePlayerVoiceName('J'.repeat(60))).toHaveLength(40);
    expect(sanitizePlayerVoiceName('   ')).toBe('');
    expect(sanitizePlayerVoiceName(undefined)).toBe('');
  });

  it('speaks under the custom name when there is one, the persona label otherwise', () => {
    expect(playerSpeakerLabel('voice')).toBe('The Voice');
    expect(playerSpeakerLabel('voice', 'Robin')).toBe('Robin');
    expect(playerSpeakerLabel('guardian_angel', 'Robin')).toBe('Robin');
    expect(playerSpeakerLabel('player', '   ')).toBe('Player');
  });

  it('appends the bio to any persona flavor', () => {
    const bio = 'Robin is the creator of this world.';
    expect(playerPersonaFlavor('guardian_angel', bio)).toBe(
      'their guardian angel: warm, protective, on their side no matter what — Robin is the creator of this world.',
    );
    expect(playerPersonaFlavor('voice')).toBe(
      'a disembodied voice only they can hear — calm, familiar, impossible to place',
    );
    expect(playerPersonaFlavor('voice', '  ')).toBe(
      'a disembodied voice only they can hear — calm, familiar, impossible to place',
    );
  });
});
