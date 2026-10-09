import { describe, expect, it } from 'vitest';
import {
  buildBriefingSystemPrompt,
  buildSceneReviewSystemPrompt,
  buildSceneSalienceSystemPrompt,
  buildSpeechSystemPrompt,
} from 'main/sentient-sims/pipeline/prompts/scene';
import { parseActorPerformance, parseSceneScores } from 'main/sentient-sims/services/AIService';
import { splitLinesForAiring, splitTextForAiring } from 'main/sentient-sims/util/airingChunks';
import { formatSelfStatus } from 'main/sentient-sims/util/formatSelfStatus';

// 2026-09-21: a reply to the player (chat window, voice, conscience, Twitch) is a full,
// straight answer that may wrap the conversation up; sim-to-sim banter keeps its ten-word
// lines. Measured over the 09-19..21 logs, 264 player-facing replies ran ten words each
// and dodged direct questions because the same brevity rules drove both.
describe('player-facing reply prompts', () => {
  const speech = (playerFacing: boolean, statusBlock?: string) =>
    buildSpeechSystemPrompt({
      simName: 'Jonah Alder',
      actorPrompt: 'You are playing Jonah Alder.',
      monologueOnly: false,
      playerFacing,
      statusBlock,
    });

  it('drops the ten-word rule for a reply to the player and asks for a straight answer', () => {
    const prompt = speech(true);
    expect(prompt).not.toContain('ten words or so');
    expect(prompt).toContain('Say as much as you actually have to say');
    expect(prompt).toContain('answer it first, plainly and specifically');
    expect(prompt).toContain('Never answer a question with a question');
    expect(prompt).toContain('wrap the conversation up naturally');
    // THINK stays one short line (inner voice pacing, 2026-09-17)
    expect(prompt).toContain('One short line. No physical actions');
  });

  it('keeps sim-to-sim speech byte-identical to before', () => {
    const before = buildSpeechSystemPrompt({
      simName: 'Jonah Alder',
      actorPrompt: 'You are playing Jonah Alder.',
      monologueOnly: false,
    });
    expect(speech(false)).toBe(before);
    expect(before).toContain('ONE short line, ten words or so');
    expect(before).not.toContain('wrap the conversation up');
  });

  it('puts the status block above the briefing, player-facing only', () => {
    const status = '<STATUS>\nCurrent wants: go on a date\n</STATUS>';
    const prompt = speech(true, status);
    expect(prompt.indexOf('<STATUS>')).toBeLessThan(prompt.indexOf('You are playing'));
    expect(prompt).toContain('When asked what you want, answer from it');
    // A sim-to-sim actor never sees it, even when handed one
    expect(speech(false, status)).not.toContain('<STATUS>');
  });

  it('tells the director to demand full answers and real wants', () => {
    const base = {
      simNames: ['Jonah Alder'],
      performerNames: ['Jonah Alder'],
      sceneContext: '<LOCATION>home</LOCATION>',
      monologueOnly: false,
    };
    const playerFacing = buildBriefingSystemPrompt({
      ...base,
      playerFacing: true,
      statusBlock: 'Jonah Alder right now:\n<STATUS>\nCurrent wants: go on a date\n</STATUS>',
    });
    expect(playerFacing).toContain('answer FULLY and PLAINLY');
    expect(playerFacing).toContain('never invented');
    expect(playerFacing).toContain('Current wants: go on a date');
    expect(playerFacing).not.toContain('Direct them to be BRIEF');

    const simToSim = buildBriefingSystemPrompt(base);
    expect(simToSim).toContain('Direct them to be BRIEF');
    expect(simToSim).not.toContain('answer FULLY');
  });

  it('has the reviewer repair a dodge instead of trimming a full answer', () => {
    const review = (hasPlayerLine: boolean) =>
      buildSceneReviewSystemPrompt({
        simNames: ['Jonah Alder'],
        performerNames: ['Jonah Alder'],
        hasPlayerLine,
        playerLineSpeaker: hasPlayerLine ? 'Conscience' : undefined,
        performerNamesList: 'Jonah Alder',
      });
    const player = review(true);
    expect(player).toContain('Dodges the question asked');
    expect(player).toContain('never shorten a full answer');
    expect(player).not.toContain('Runs long');
    expect(player).not.toContain('each one short');

    const scene = review(false);
    expect(scene).toContain('Runs long');
    expect(scene).not.toContain('Dodges the question asked');
  });
});

describe('the scorer on a player-facing beat', () => {
  it('asks whether the sim has said their piece, and only then', () => {
    const player = buildSceneSalienceSystemPrompt({ names: ['Jonah Alder'], playerFacing: { speaker: 'Conscience' } });
    expect(player).toContain('"done": true if that character has said their piece to Conscience');
    expect(player).toContain('"done": <true|false>');
    const scene = buildSceneSalienceSystemPrompt({ names: ['Jonah Alder', 'Alex Moyer'] });
    expect(scene).not.toContain('"done"');
  });

  it('parses the verdict, tolerating a string', () => {
    const scores = parseSceneScores(
      '{"Jonah Alder": {"memory": 7, "action": 6, "action_reason": "Zoe", "unfinished": false, "continue": 2, "done": "true"}}',
      ['Jonah Alder'],
    );
    expect(scores.get('Jonah Alder')?.done).toBe(true);
    const without = parseSceneScores('{"Jonah Alder": {"memory": 7, "action": 6}}', ['Jonah Alder']);
    expect(without.get('Jonah Alder')?.done).toBeUndefined();
  });
});

describe('a multi-paragraph SAY', () => {
  const raw = [
    'SAY: No. Not yet, and here is why.',
    '',
    'I saw her kiss Jonah and it is eating at me, but leaving would be about being scared of ending up alone.',
    'THINK: Am I holding on out of love or habit?',
  ].join('\n');

  it('is kept whole for a reply to the player', () => {
    const parsed = parseActorPerformance(raw, ['Jake Flores'], { multiLineSay: true });
    expect(parsed.say).toBe(
      'No. Not yet, and here is why. I saw her kiss Jonah and it is eating at me, but leaving would be about being scared of ending up alone.',
    );
    expect(parsed.think).toBe('Am I holding on out of love or habit?');
  });

  it('still airs only its first paragraph in a sim-to-sim scene', () => {
    const parsed = parseActorPerformance(raw, ['Jake Flores']);
    expect(parsed.say).toBe('No. Not yet, and here is why.');
    expect(parsed.think).toBe('Am I holding on out of love or habit?');
  });
});

describe('airing a long reply in chunks', () => {
  const reply =
    'No, not yet. I saw her kiss Jonah and it has been eating at me every day since, but walking away now would ' +
    'be about being scared of ending up alone, not about her. What would change my mind is her lying to me again. ' +
    'I need to talk to her tonight.';

  it('splits on sentence boundaries under the cap and flags every chunk but the last', () => {
    const chunks = splitLinesForAiring([{ speaker: 'Jake Flores', text: reply, simId: '7' }], 120);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, index) => {
      expect(chunk.text.length).toBeLessThanOrEqual(120);
      expect(chunk.speaker).toBe('Jake Flores');
      expect(chunk.simId).toBe('7');
      expect(Boolean(chunk.continues)).toBe(index < chunks.length - 1);
    });
    // Nothing lost, nothing invented
    expect(chunks.map((chunk) => chunk.text).join(' ')).toBe(reply);
  });

  it('leaves a short line alone', () => {
    const line = { speaker: 'Jake Flores', text: 'It has been eating at me.' };
    expect(splitLinesForAiring([line])).toEqual([line]);
  });

  it('folds a tiny tail into the chunk before it', () => {
    const chunks = splitTextForAiring('A first sentence that is long enough to stand on its own here. Okay.', 60);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].endsWith('Okay.')).toBe(true);
  });

  it('never splits a line whose subtitle already went out', () => {
    const question = { speaker: 'Chat', text: `${reply} ${reply}`, skipSceneLine: true };
    expect(splitLinesForAiring([question], 80)).toEqual([question]);
  });
});

describe('the status block a reply is answered from', () => {
  it('renders wants, needs, plan and activity like the tick prompt', () => {
    const block = formatSelfStatus(
      {
        sim_id: '1',
        sim_name: 'Jonah Alder',
        location: { zone_id: 1 },
        sims: [],
        objects: [],
        self: { mood: 'Sad', needs: { fun: -20, hunger: 40 }, wants: ['go_on_date'], age: 'ADULT' },
        activity: { queue: [], running: 'practice_in_mirror', in_social: false },
      },
      { goals: [{ label: 'Call Zoe' }], persona: 'Someone who follows through' },
    );
    expect(block).toContain('Current wants: go on date');
    expect(block).toContain('Needs, WORST FIRST (-100 to 100): fun -20 (low), hunger 40');
    expect(block).toContain("Today's goals: Call Zoe");
    expect(block).toContain('You are currently: practice in mirror.');
  });
});
