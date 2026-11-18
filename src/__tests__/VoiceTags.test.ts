import { describe, expect, it } from 'vitest';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { hasVoiceTags, isSpeakable, splitVoiceTags, stripVoiceTags } from 'main/sentient-sims/util/voiceTags';
import { splitLineForAiring } from 'main/sentient-sims/util/airingChunks';
import { voiceReadsTags } from 'main/sentient-sims/services/AIService';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { ElevenLabsSpeechModel } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { SentientSimsAISpeechModel } from 'main/sentient-sims/models/SentientSimsAITTSSettings';

// A voice tag like [laughs] is for the voice only. The subtitle, the bubble, the memory row
// and the chat window get the plain words.

describe('stripVoiceTags', () => {
  it('removes a tag at the start, in the middle and at the end', () => {
    expect(stripVoiceTags("[laughs] That's the spirit.")).toEqual("That's the spirit.");
    expect(stripVoiceTags('Well [sighs] fine then.')).toEqual('Well fine then.');
    expect(stripVoiceTags('Fine then. [sighs]')).toEqual('Fine then.');
  });

  it('removes two tags and folds the whitespace they leave', () => {
    expect(stripVoiceTags('[laughs] Oh, [clears throat] sorry.')).toEqual('Oh, sorry.');
    expect(stripVoiceTags('a [x] b')).toEqual('a b');
    expect(stripVoiceTags('a [x] [y] b')).toEqual('a b');
    expect(stripVoiceTags('a [x][y]  b')).toEqual('a b');
  });

  it('keeps two words apart when a tag sat between them with no space', () => {
    expect(stripVoiceTags('word[x]word')).toEqual('word word');
  });

  it('leaves nothing before closing punctuation', () => {
    expect(stripVoiceTags('Fine [sighs].')).toEqual('Fine.');
    expect(stripVoiceTags('Really [laughs]?')).toEqual('Really?');
  });

  it('leaves an unclosed bracket and text with no tags alone', () => {
    expect(stripVoiceTags('Look [over there')).toEqual('Look [over there');
    expect(stripVoiceTags('No tags  here.')).toEqual('No tags  here.');
    expect(hasVoiceTags('Look [over there')).toBe(false);
  });

  it('turns a tag-only line into an empty string', () => {
    expect(stripVoiceTags('[laughs]')).toEqual('');
    expect(stripVoiceTags('  [laughs] [sighs]  ')).toEqual('');
  });

  it('keeps line breaks', () => {
    expect(stripVoiceTags('First. [sighs]\nSecond.')).toEqual('First.\nSecond.');
  });
});

describe('splitVoiceTags', () => {
  it('moves the tags to ttsText and leaves the plain words in text', () => {
    const line: DialogueLine = { speaker: 'Ricky', text: "[laughs] That's the spirit.", simId: '7' };
    expect(splitVoiceTags(line)).toEqual({
      speaker: 'Ricky',
      text: "That's the spirit.",
      ttsText: "[laughs] That's the spirit.",
      simId: '7',
    });
  });

  it('returns the same object for a plain line', () => {
    const line: DialogueLine = { speaker: 'Ricky', text: 'Plain words.' };
    expect(splitVoiceTags(line)).toBe(line);
  });

  it('leaves a line alone when only its ttsText differs', () => {
    const line: DialogueLine = { speaker: 'Ricky', text: 'Hi Jonah.', ttsText: 'Hi Joe-nuh.' };
    expect(splitVoiceTags(line)).toBe(line);
  });
});

describe('a line of sounds alone (a Wicked Whims act)', () => {
  it('airs as itself, unsplit', () => {
    const line: DialogueLine = {
      speaker: 'Margo Calloway',
      text: '',
      ttsText: '[moans] [gasps]',
      voiceOnly: true,
    };
    expect(splitLineForAiring(line)).toEqual([line]);
  });

  it('is speakable while an empty ordinary line is not', () => {
    expect(isSpeakable({ speaker: 'Margo', text: '', ttsText: '[moans]', voiceOnly: true })).toBe(true);
    expect(isSpeakable({ speaker: 'Margo', text: '', ttsText: '[moans]' })).toBe(false);
    expect(isSpeakable({ speaker: 'Margo', text: 'Yes.' })).toBe(true);
  });

  it('is voiced only where the voice performs tags', () => {
    const settings = (ttsApiType: ApiType, model: string, ttsEnabled = true) => ({
      ttsEnabled,
      ttsApiType,
      elevenLabsTtsSettings: { model },
      sentientSimsAITtsSettings: { model },
    });
    expect(voiceReadsTags(settings(ApiType.ElevenLabs, ElevenLabsSpeechModel.ELEVEN_V4))).toBe(true);
    expect(voiceReadsTags(settings(ApiType.ElevenLabs, ElevenLabsSpeechModel.ELEVEN_V3))).toBe(true);
    expect(voiceReadsTags(settings(ApiType.ElevenLabs, ElevenLabsSpeechModel.ELEVEN_FLASH_V2_5))).toBe(false);
    expect(voiceReadsTags(settings(ApiType.Kokoro, ElevenLabsSpeechModel.ELEVEN_V4))).toBe(false);
    expect(voiceReadsTags(settings(ApiType.ElevenLabs, ElevenLabsSpeechModel.ELEVEN_V4, false))).toBe(false);
    // The Sentient Sims AI voice performs tags on its ElevenLabs model, not on Kokoro
    expect(voiceReadsTags(settings(ApiType.SentientSimsAI, SentientSimsAISpeechModel.ELEVEN_V4_TURBO))).toBe(true);
    expect(voiceReadsTags(settings(ApiType.SentientSimsAI, SentientSimsAISpeechModel.KOKORO))).toBe(false);
  });
});
