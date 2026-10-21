import { describe, expect, it } from 'vitest';
import { lintMapping, mappingVerdict } from 'main/sentient-sims/util/mappingLint';
import { ACTOR_WORD_PAIRS, formatAction } from 'main/sentient-sims/formatter/PromptFormatter';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';

// The checks the app runs on a mapping before the reviewer model reads it: the rules from the
// mapping guidelines that need no judgement.
describe('lintMapping', () => {
  const two = { kind: 'interaction' as const, simCount: 2 };
  const flags = (action: string, options = two) => lintMapping(action, options).map((finding) => finding.flag);

  it('passes the one-sentence token form', () => {
    expect(lintMapping('{actor.0} and {actor.1} are showering together.', two)).toEqual([]);
    expect(lintMapping('{actor.0} awkwardly asks {actor.1} about {actor.1.his/her} day.', two)).toEqual([]);
  });

  it('accepts every actor word the formatter fills, and every scene token', () => {
    ACTOR_WORD_PAIRS.forEach((pair) => {
      expect(lintMapping(`{actor.0} hugs {actor.0.${pair.token}}.`, two), pair.token).toEqual([]);
    });
    expect(
      lintMapping('{participants} at {location} ({location_type}): {location_description} {postures}', two),
    ).toEqual([]);
    expect(
      lintMapping('{actor.0} and {actor.1} are having {sex_category} {sex_location}.', {
        kind: 'animation',
        simCount: 2,
      }),
    ).toEqual([]);
  });

  it("flags the dialog's own prefill as broken", () => {
    const findings = lintMapping('{actor.0} and {actor.1} are ', two);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ flag: 'BROKEN', confidence: 'high' });
    expect(lintMapping('', two)[0].why).toBe('The mapping is empty.');
  });

  it('flags tokens the app cannot fill', () => {
    expect(lintMapping('{actor.0} waves at {actor.1.they/them}.', two)[0]).toMatchObject({
      flag: 'BROKEN',
      quote: '{actor.1.they/them}',
    });
    expect(lintMapping('{actor.0} waves at {target}.', two)[0]).toMatchObject({ flag: 'BROKEN', quote: '{target}' });
    expect(lintMapping('{actor.0} waves at {actor.2}.', two)[0].why).toContain('2 sims');
    expect(lintMapping('{actor.0} waves at {actor.2}.', { kind: 'interaction' })).toEqual([]);
    expect(lintMapping('{actor.0} waves at {actor.1', two)[0]).toMatchObject({ flag: 'BROKEN', quote: '{actor.1' });
  });

  it("flags the his's possessive and a cut-off ending", () => {
    expect(lintMapping("{actor.0} holds {actor.1.his/her}'s hand.", two)[0].why).toContain("his's");
    expect(lintMapping('{actor.0} is talking to', two)[0]).toMatchObject({ flag: 'BROKEN', confidence: 'medium' });
    // A sentence may end on "on" or "is" and be complete; the full stop says so
    expect(lintMapping('{actor.0} turns the television on.', two)).toEqual([]);
  });

  it('flags a bare pronoun but not one inside a token', () => {
    expect(lintMapping('{actor.0} tells {actor.1} about his day.', two)[0]).toMatchObject({
      flag: 'RAW_PRONOUN',
      quote: 'his',
    });
    expect(lintMapping('{actor.0} tells {actor.1} about {actor.0.his/her} day.', two)).toEqual([]);
    expect(lintMapping('{actor.0} tells {actor.1} about their day.', two)).toEqual([]);
    // "her" as both object and possessive is one finding
    expect(flags('{actor.0} hands her the plate and takes her coat.')).toEqual(['RAW_PRONOUN']);
  });

  it('flags directives aimed at the model', () => {
    expect(flags('{actor.0} is cooking. AI IGNORE THIS')).toContain('AI_DIRECTIVE');
    expect(flags('{actor.0} is cooking. [AI: DO NOT describe the kitchen]')).toContain('AI_DIRECTIVE');
    expect(flags('{actor.0} is cooking. Please vary the output.')).toContain('AI_DIRECTIVE');
    expect(flags('{actor.0} is cooking. Thank you!')).toContain('AI_DIRECTIVE');
    expect(flags('{actor.0} reads a post (mention what the post says).')).toContain('AI_DIRECTIVE');
    expect(flags('{actor.0} is cooking. Focus only on the interaction.')).toContain('AI_DIRECTIVE');
    // A line a sim says is not a directive
    expect(flags('{actor.0} asks {actor.1} to please pass the salt.')).toEqual([]);
  });

  it('flags a name from the save the service found', () => {
    const findings = lintMapping('{actor.0} plays with Elliot Jr.', { ...two, savedNames: ['Elliot Jr'] });
    expect(findings[0]).toMatchObject({ flag: 'HARDCODED_NAME', confidence: 'high', quote: 'Elliot Jr' });
  });

  it('flags a game identifier pasted into the prose', () => {
    expect(lintMapping('{actor.0} runs mixer_social_Flirt_targeted on {actor.1}.', two)[0]).toMatchObject({
      flag: 'BROKEN',
      quote: 'mixer_social_Flirt_targeted',
    });
  });

  it('flags length in two steps', () => {
    expect(flags('{actor.0} sits down. {actor.0} picks up the fork.')).toEqual(['VERBOSE']);
    const wall = Array.from({ length: 5 }, (_, i) => `{actor.0} does thing number ${i} with great care.`).join(' ');
    expect(lintMapping(wall, two)[0]).toMatchObject({ flag: 'VERBOSE', confidence: 'high' });
    expect(lintMapping('{actor.0} is cooking.\n\n{actor.1} watches.', two)[0]).toMatchObject({
      flag: 'VERBOSE',
      confidence: 'high',
    });
  });

  it('reads each finding into a verdict', () => {
    expect(mappingVerdict([])).toBe('good');
    expect(mappingVerdict([{ flag: 'VERBOSE', confidence: 'medium', why: '', source: 'check' }])).toBe('needs_work');
    expect(mappingVerdict([{ flag: 'UNWARRANTED_CONTEXT', confidence: 'high', why: '', source: 'ai' }])).toBe(
      'needs_work',
    );
    expect(mappingVerdict([{ flag: 'BROKEN', confidence: 'medium', why: '', source: 'check' }])).toBe('needs_work');
    expect(mappingVerdict([{ flag: 'AI_DIRECTIVE', confidence: 'high', why: '', source: 'check' }])).toBe('bad');
    expect(mappingVerdict([{ flag: 'HARDCODED_NAME', confidence: 'high', why: '', source: 'check' }])).toBe('bad');
  });
});

describe('formatAction actor words', () => {
  const location = { name: 'Home', lot_type: 'Residential', description: '' } as unknown as LocationEntity;
  const sims = [
    { name: 'Desmond Calloway', gender: 'Male' },
    { name: 'Margo Calloway', gender: 'Female' },
  ] as SentientSim[];

  it('fills every pair by gender', () => {
    ACTOR_WORD_PAIRS.forEach((pair) => {
      expect(formatAction(`{actor.0.${pair.token}}|{actor.1.${pair.token}}`, sims, location)).toBe(
        `${pair.male}|${pair.female}`,
      );
    });
    expect(formatAction('{actor.0} kisses {actor.1} on {actor.1.his/her} cheek.', sims, location)).toBe(
      'Desmond Calloway kisses Margo Calloway on her cheek.',
    );
  });
});
