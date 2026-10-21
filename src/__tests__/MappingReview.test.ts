import { Server } from 'http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { MappingReview, MappingReviewRequest } from 'main/sentient-sims/models/MappingReview';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { mergeFindings, parseMappingReview } from 'main/sentient-sims/services/MappingReviewService';
import { mockApiContext } from './util';

// After Test in the mapping dialogs: POST /mappings/review reads the template and the narrated samples
// against the mapping guidelines. The app's own checks always answer; the reviewer model adds what
// they cannot see, and its absence is reported, not thrown.
describe('POST /mappings/review', () => {
  const ctx = mockApiContext({ port: 25211 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;
  let reviewer: MockInstance<typeof ctx.ai.runOneShot>;
  const prompts: Array<{ system: string; user: string }> = [];

  function answer(text: string) {
    reviewer.mockImplementation((label, system, user) => {
      prompts.push({ system, user });
      return Promise.resolve({
        exchange: { label, request: { messages: [], maxResponseTokens: 0 }, responseText: text },
        text,
      });
    });
  }

  async function review(request: Partial<MappingReviewRequest>) {
    const response = await fetch(`${apiUrl}/mappings/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'interaction', name: 'mixer_social_Flirt', sims: [], ...request }),
    });
    return { status: response.status, body: (await response.json()) as MappingReview & { error?: string } };
  }

  const sims = [
    { name: 'Bella Goth', gender: 'Female' },
    { name: 'Don Lothario', gender: 'Male' },
  ];

  beforeAll(() => {
    reviewer = vi.spyOn(ctx.ai, 'runOneShot');
    vi.spyOn(ctx.db, 'isLoaded').mockReturnValue(true);
    vi.spyOn(ctx.participantRepository, 'getAllNames').mockReturnValue(['Bella Goth', 'Don Lothario', 'Elliot Jr']);
    server = runApi(ctx);
  });

  beforeEach(() => {
    prompts.length = 0;
    reviewer.mockReset();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  it('hands the reviewer the template, the cast and the samples, and reads its answer back', async () => {
    answer(
      '{"summary": "The template decides the mood for the AI.", "findings": [{"flag": "UNWARRANTED_CONTEXT", "confidence": "high", "quote": "still blushing", "why": "The mood comes from the game."}], "suggestion": "{actor.0} flirts with {actor.1}."}',
    );
    const { status, body } = await review({
      action: '{actor.0}, still blushing, flirts with {actor.1}.',
      samples: ['Bella Goth blushes and leans in.', 'Still blushing, Bella Goth winks.'],
      sims,
    });
    expect(status).toBe(200);
    expect(body.verdict).toBe('needs_work');
    expect(body.aiReviewed).toBe(true);
    expect(body.summary).toBe('The template decides the mood for the AI.');
    expect(body.findings).toEqual([
      {
        flag: 'UNWARRANTED_CONTEXT',
        confidence: 'high',
        quote: 'still blushing',
        why: 'The mood comes from the game.',
        source: 'ai',
      },
    ]);
    expect(body.suggestion).toBe('{actor.0} flirts with {actor.1}.');

    expect(prompts[0].user).toContain('Interaction: mixer_social_Flirt');
    expect(prompts[0].user).toContain('{actor.0} = Bella Goth (female), {actor.1} = Don Lothario (male)');
    expect(prompts[0].user).toContain('Mapping:\n{actor.0}, still blushing, flirts with {actor.1}.');
    expect(prompts[0].user).toContain('1. Bella Goth blushes and leans in.');
    expect(prompts[0].system).toContain('{actor.N.he/she}');
  });

  it('runs as a button press, outside provider health, on its own stage', async () => {
    answer('{"summary": "Reads clean.", "findings": [], "suggestion": ""}');
    const { body } = await review({ action: '{actor.0} flirts with {actor.1}.', sims });
    expect(body.verdict).toBe('good');
    expect(body.suggestion).toBeUndefined();
    expect(reviewer.mock.calls[0][5]).toBe(AIActionType.MAPPING_REVIEW);
    expect(reviewer.mock.calls[0][7]).toMatchObject({ interactive: true, stageId: 'mapping_review' });
  });

  it("keeps the app's checks when the reviewer cannot be asked, and says why in plain words", async () => {
    reviewer.mockRejectedValue(new Error('401 Incorrect API key provided: sk-abc'));
    const { status, body } = await review({ action: '{actor.0} flirts with Elliot Jr, thank you', sims });
    expect(status).toBe(200);
    expect(body.aiReviewed).toBe(false);
    expect(body.verdict).toBe('bad');
    expect(body.findings.map((finding) => finding.flag).sort()).toEqual(['AI_DIRECTIVE', 'HARDCODED_NAME']);
    expect(body.aiError).toContain("didn't accept your API key");
    expect(body.aiError).not.toContain('sk-abc');
    expect(body.inSettings).toBe(true);
  });

  it('does not repeat a check as a reviewer finding, and keeps the check first', async () => {
    answer(
      '{"summary": "A bare pronoun and extra context.", "findings": [{"flag": "RAW_PRONOUN", "confidence": "high", "quote": "his", "why": "Use the token."}, {"flag": "UNWARRANTED_CONTEXT", "confidence": "low", "quote": "nervously", "why": "Mood."}], "suggestion": ""}',
    );
    const { body } = await review({ action: '{actor.0} nervously tells {actor.1} about his day.', sims });
    expect(body.findings.map((finding) => [finding.flag, finding.source])).toEqual([
      ['RAW_PRONOUN', 'check'],
      ['UNWARRANTED_CONTEXT', 'ai'],
    ]);
  });

  it('drops a suggestion that fails the checks itself', async () => {
    answer(
      '{"summary": "Use tokens.", "findings": [{"flag": "HARDCODED_NAME", "confidence": "high", "quote": "Bella", "why": "A name."}], "suggestion": "{actor.0} flirts with {actor.1} and she smiles."}',
    );
    const { body } = await review({ action: '{actor.0} flirts with {actor.1}', sims });
    expect(body.suggestion).toBeUndefined();
  });

  it('answers with the checks alone when the reviewer did not write JSON', async () => {
    answer('Sure! This mapping looks fine to me.');
    const { body } = await review({ action: '{actor.0} flirts with {actor.1}.', sims });
    expect(body.aiReviewed).toBe(false);
    expect(body.verdict).toBe('good');
    expect(body.aiError).toContain('no readable answer');
  });

  it('does not ask the reviewer about an empty mapping', async () => {
    const { body } = await review({ action: '   ', sims });
    expect(body.verdict).toBe('bad');
    expect(reviewer).not.toHaveBeenCalled();
  });

  it('names an animation as the dialog does', async () => {
    answer('{"summary": "Reads clean.", "findings": [], "suggestion": ""}');
    await review({
      kind: 'animation',
      name: 'Author: Shower Kiss - author:shower_kiss',
      action: '{actor.0} and {actor.1} are kissing {sex_location}.',
      sims,
    });
    expect(prompts[0].user).toContain('WickedWhims animation: Author: Shower Kiss - author:shower_kiss');
  });

  it('is a 400 without a kind or an action', async () => {
    const response = await fetch(`${apiUrl}/mappings/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x' }),
    });
    expect(response.status).toBe(400);
  });
});

describe('parseMappingReview', () => {
  it('reads a fenced answer, unknown flags dropped and confidences clamped', () => {
    const parsed = parseMappingReview(
      '```json\n{"summary": "Two things.", "findings": [{"flag": "verbose", "confidence": "very high", "why": "Long."}, {"flag": "SPELLING", "why": "x"}, {"flag": "BROKEN"}], "suggestion": " {actor.0} waves. "}\n```',
    );
    expect(parsed?.summary).toBe('Two things.');
    expect(parsed?.findings).toEqual([
      { flag: 'VERBOSE', confidence: 'medium', quote: undefined, why: 'Long.', source: 'ai' },
    ]);
    expect(parsed?.suggestion).toBe('{actor.0} waves.');
  });

  it('is undefined for prose', () => {
    expect(parseMappingReview('Looks good!')).toBeUndefined();
  });
});

describe('mergeFindings', () => {
  it('sorts by confidence after the checks', () => {
    const merged = mergeFindings(
      [{ flag: 'VERBOSE', confidence: 'medium', why: 'a', source: 'check' }],
      [
        { flag: 'UNWARRANTED_CONTEXT', confidence: 'low', why: 'b', source: 'ai' },
        { flag: 'HARDCODED_NAME', confidence: 'high', why: 'c', source: 'ai' },
      ],
    );
    expect(merged.map((finding) => finding.flag)).toEqual(['HARDCODED_NAME', 'VERBOSE', 'UNWARRANTED_CONTEXT']);
  });
});
