import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { StageId } from 'main/sentient-sims/pipeline/stages';
import { SceneClosed } from 'main/sentient-sims/services/ScenePlaybackRegistry';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { LLMExchange } from 'main/sentient-sims/models/InteractionEventResult';

const { sendModNotification } = vi.hoisted(() => ({ sendModNotification: vi.fn() }));
vi.mock('main/sentient-sims/websocketServer', () => ({ sendModNotification }));

// Imported after the mock so the service's add_buff goes through the fake socket
const {
  SceneMoodletService,
  parseMoodletVerdicts,
  buildMoodletSystemPrompt,
  buildMoodletUserText,
  toAddBuff,
  trimReason,
  MAX_REASON_CHARS,
} = await import('main/sentient-sims/services/SceneMoodletService');

const CAST = [
  { simId: '11', name: 'Bella Goth', traits: ['Family-Oriented'], moods: ['happy'] },
  { simId: '12', name: 'Mortimer Goth' },
];

function closed(overrides: Partial<SceneClosed> = {}): SceneClosed {
  return {
    sceneId: 'scene-7',
    participantSimIds: ['11', '12'],
    cast: CAST,
    lines: [
      { speaker: 'Mortimer Goth', text: 'I want a divorce.', simId: '12' },
      { speaker: 'Bella Goth', text: 'You cannot mean that.', simId: '11' },
      { speaker: 'Mortimer Goth', text: 'I have never meant anything more.', simId: '12' },
      { speaker: 'Bella Goth', text: 'Then go.', simId: '11' },
    ],
    reason: 'finished',
    ...overrides,
  };
}

// The service touches only ctx.ai.runOneShot and its own setting, so a stub context keeps
// the test off the (Electron-built) sqlite binding
function stubContext(answer: string | Error, conversationMoodletsEnabled = true) {
  const calls: { label: string; system: string; user: string; args: unknown[] }[] = [];
  const ai = {
    runOneShot: (label: string, system: string, user: string, ...args: unknown[]) => {
      calls.push({ label, system, user, args });
      if (answer instanceof Error) {
        return Promise.reject(answer);
      }
      return Promise.resolve({ exchange: {} as LLMExchange, text: answer });
    },
  };
  const ctx = { ai, settings: { conversationMoodletsEnabled } } as unknown as ApiContext;
  return { ctx, calls };
}

const DIVORCE = JSON.stringify({
  'Bella Goth': {
    emotion: 'sad',
    intensity: 3,
    duration_hours: 18,
    reason: 'Mortimer asked for a divorce and meant it.',
  },
  'Mortimer Goth': { emotion: 'none' },
});

describe('parseMoodletVerdicts', () => {
  it('reads a verdict per named sim and skips none', () => {
    const verdicts = parseMoodletVerdicts(`Sure, here it is:\n${DIVORCE}\nDone.`, CAST);
    expect(verdicts).toEqual([
      {
        simId: '11',
        name: 'Bella Goth',
        emotion: 'sad',
        intensity: 3,
        durationMinutes: 1080,
        reason: 'Mortimer asked for a divorce and meant it.',
      },
    ]);
  });

  it('clamps the tier, the hours to the tier band, and takes string numbers', () => {
    const text = JSON.stringify({
      'Bella Goth': { emotion: 'Happy', intensity: '5', duration_hours: '90', reason: 'x' },
      'Mortimer Goth': { emotion: 'bored', intensity: 0, duration_hours: 0.1, reason: 'y' },
    });
    const [bella, mortimer] = parseMoodletVerdicts(text, CAST);
    expect([bella.emotion, bella.intensity, bella.durationMinutes]).toEqual(['happy', 3, 24 * 60]);
    expect([mortimer.emotion, mortimer.intensity, mortimer.durationMinutes]).toEqual(['bored', 1, 30]);
  });

  it('fills a missing tier and hours with the tier defaults, and a missing reason with a sentence', () => {
    const [verdict] = parseMoodletVerdicts(JSON.stringify({ 'Bella Goth': { emotion: 'flirty' } }), CAST);
    expect(verdict.intensity).toBe(1);
    expect(verdict.durationMinutes).toBe(120);
    expect(verdict.reason).toBe('Bella is feeling flirty after talking with Mortimer.');
  });

  it('cuts a long reason at its last full sentence', () => {
    const sentence = 'Mortimer brought up the bills again and would not drop it at all. ';
    const long = sentence.repeat(10).trim();
    const cut = trimReason(long);
    expect(cut.length).toBeLessThanOrEqual(MAX_REASON_CHARS);
    expect(cut.endsWith('at all.')).toBe(true);
    expect(trimReason('x'.repeat(600))).toHaveLength(MAX_REASON_CHARS);
    const short = sentence.repeat(4).trim();
    expect(trimReason(short)).toBe(short);
    const [verdict] = parseMoodletVerdicts(JSON.stringify({ 'Bella Goth': { emotion: 'sad', reason: long } }), CAST);
    expect(verdict.reason).toBe(cut);
  });

  it('drops unknown emotions, unknown names and prose without JSON', () => {
    expect(parseMoodletVerdicts(JSON.stringify({ 'Bella Goth': { emotion: 'ecstatic', intensity: 2 } }), CAST)).toEqual(
      [],
    );
    expect(parseMoodletVerdicts(JSON.stringify({ 'Don Lothario': { emotion: 'flirty' } }), CAST)).toEqual([]);
    expect(parseMoodletVerdicts('Nothing much happened.', CAST)).toEqual([]);
    expect(parseMoodletVerdicts('{not json', CAST)).toEqual([]);
  });

  it('matches names by case and by a unique first name, never an ambiguous one', () => {
    expect(parseMoodletVerdicts(JSON.stringify({ 'bella goth': { emotion: 'sad' } }), CAST)[0]?.simId).toBe('11');
    expect(parseMoodletVerdicts(JSON.stringify({ Mortimer: { emotion: 'angry' } }), CAST)[0]?.simId).toBe('12');
    const twins = [
      { simId: '1', name: 'Elliot Chatman' },
      { simId: '2', name: 'Elliot House' },
    ];
    expect(parseMoodletVerdicts(JSON.stringify({ Elliot: { emotion: 'sad' } }), twins)).toEqual([]);
  });

  it('maps a feeling the game has no mood for onto the nearest one', () => {
    // "frustrated" is not one of the game's moods; without the stand-in the moodlet is lost
    const text = JSON.stringify({
      'Bella Goth': { emotion: 'Frustrated', intensity: 2, duration_hours: 6, reason: 'x' },
      'Mortimer Goth': { emotion: 'anxious', intensity: 1, reason: 'y' },
    });
    expect(parseMoodletVerdicts(text, CAST).map((verdict) => verdict.emotion)).toEqual(['angry', 'stressed']);
    expect(buildMoodletSystemPrompt()).toContain('frustrated or annoyed is angry');
  });

  it('keeps one verdict per sim', () => {
    const text = JSON.stringify({ 'Bella Goth': { emotion: 'sad' }, 'bella': { emotion: 'happy' } });
    expect(parseMoodletVerdicts(text, CAST).map((verdict) => verdict.emotion)).toEqual(['sad']);
  });
});

describe('the prompt', () => {
  it('lists the ladder, the emotions, each sim and the conversation', () => {
    const system = buildMoodletSystemPrompt();
    expect(system).toContain('none: small talk');
    expect(system).toContain('3 (life-altering, 12-24 hours)');
    expect(system).toContain('angry, bored, confident');
    expect(system).toContain('one to three short sentences');
    expect(system).toContain('in the present tense');
    expect(system).not.toContain('twelve words');
    const user = buildMoodletUserText(CAST, closed().lines, 'cut_short');
    expect(user).toContain('- Bella Goth; traits: Family-Oriented; before the talk: happy');
    expect(user).toContain('- Mortimer Goth');
    expect(user).toContain('cut short');
    expect(user).toContain('Mortimer Goth: I want a divorce.');
    expect(buildMoodletUserText(CAST, closed().lines, 'finished')).toContain('ran its course');
  });
});

describe('SceneMoodletService', () => {
  beforeEach(() => {
    sendModNotification.mockClear();
  });

  it('sends the mod one tiered, timed add_buff per moved sim', async () => {
    const { ctx, calls } = stubContext(DIVORCE);
    const verdicts = await new SceneMoodletService(ctx).appraise(closed());

    expect(verdicts).toHaveLength(1);
    expect(sendModNotification).toHaveBeenCalledTimes(1);
    expect(sendModNotification).toHaveBeenCalledWith({
      type: 'add_buff',
      sim_id: '11',
      mood: 'sad',
      buff_description: 'Mortimer asked for a divorce and meant it.',
      intensity: 3,
      duration_minutes: 1080,
      scene_id: 'scene-7',
      source: 'scene',
    });
    expect(calls[0].label).toBe('Scene Moodlets');
    // Routed as the buff stage so the provider config and prompt override for it apply
    expect(calls[0].args[2]).toBe(AIActionType.BUFF);
    expect(calls[0].args[4]).toEqual({ stageId: StageId.BUFF });
  });

  it('judges a thread with the player as a conversation: their lines ride along, only the sim is cast', async () => {
    const { ctx, calls } = stubContext(
      JSON.stringify({
        'Bella Goth': {
          emotion: 'happy',
          intensity: 1,
          duration_hours: 2,
          reason: 'Jaz asked after her day and listened. Bella feels seen.',
        },
      }),
    );
    const thread = closed({
      cast: [CAST[0]],
      lines: [
        { speaker: 'Jaz', text: 'How was your day?' },
        { speaker: 'Bella Goth', text: 'Long. Mortimer again.', simId: '11' },
        { speaker: 'Jaz', text: 'Tell me.' },
        { speaker: 'Bella Goth', text: 'He never listens. You do.', simId: '11' },
      ],
    });
    const verdicts = await new SceneMoodletService(ctx).appraise(thread, 'conversation');
    expect(verdicts).toHaveLength(1);
    expect(calls[0].user).toContain('Jaz: How was your day?');
    expect(calls[0].user).not.toContain('Mortimer Goth');
    expect(sendModNotification).toHaveBeenCalledWith(
      expect.objectContaining({ sim_id: '11', mood: 'happy', source: 'conversation' }),
    );
  });

  it('makes no call and leaves no moodlet when the player has switched it off', async () => {
    const { ctx, calls } = stubContext(DIVORCE, false);
    expect(await new SceneMoodletService(ctx).appraise(closed())).toEqual([]);
    expect(await new SceneMoodletService(ctx).appraise(closed(), 'conversation')).toEqual([]);
    expect(calls).toEqual([]);
    expect(sendModNotification).not.toHaveBeenCalled();
  });

  it('does not bother the model with a greeting', async () => {
    const { ctx, calls } = stubContext(DIVORCE);
    await new SceneMoodletService(ctx).appraise(closed({ lines: closed().lines.slice(0, 3) }));
    expect(calls).toEqual([]);
    expect(sendModNotification).not.toHaveBeenCalled();
  });

  it('does nothing for a conversation with nobody to feel it', async () => {
    const { ctx, calls } = stubContext(DIVORCE);
    await new SceneMoodletService(ctx).appraise(closed({ cast: [] }));
    expect(calls).toEqual([]);
  });

  it('leaves no moodlet when the model answers nonsense or fails', async () => {
    const nonsense = stubContext('Bella seemed upset, I think.');
    expect(await new SceneMoodletService(nonsense.ctx).appraise(closed())).toEqual([]);
    const failing = stubContext(new Error('provider down'));
    expect(await new SceneMoodletService(failing.ctx).appraise(closed())).toEqual([]);
    expect(sendModNotification).not.toHaveBeenCalled();
  });

  it('describes a cut conversation as cut short', async () => {
    const { ctx, calls } = stubContext(DIVORCE);
    await new SceneMoodletService(ctx).appraise(closed({ reason: 'stopped', stopReason: 'walked_away', mode: 'soft' }));
    expect(calls[0].user).toContain('cut short');
  });

  it('keeps the legacy fields on the wire', () => {
    const message = toAddBuff(
      { simId: '3', name: 'X', emotion: 'angry', intensity: 2, durationMinutes: 360, reason: 'Because.' },
      undefined,
      'scene',
    );
    expect(message).toMatchObject({ type: 'add_buff', sim_id: '3', mood: 'angry', buff_description: 'Because.' });
  });
});
