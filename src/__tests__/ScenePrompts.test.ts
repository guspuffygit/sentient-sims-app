import { describe, expect, it } from 'vitest';
import {
  buildBriefingSystemPrompt,
  buildSceneReviewSystemPrompt,
  buildSpeechSystemPrompt,
} from 'main/sentient-sims/pipeline/prompts/scene';

// Fix B2: cheap insurance for a save whose stored description predates an age-up. Live
// 2026-09-03, the director's briefing for Mackenzie called him "a teenage boy ... navigating
// the challenges of high school" one line below a facts block saying elder, and asked how
// old he was he answered "almost seventeen". The description cannot be regenerated for
// prose the player wrote, so the prompts say which source wins.
describe('scene prompts', () => {
  const briefing = (monologueOnly = false) =>
    buildBriefingSystemPrompt({
      simNames: ['Travis Scott', 'Mackenzie Scott'],
      performerNames: ['Travis Scott', 'Mackenzie Scott'],
      sceneContext: '<CHARACTER_IN_INTERACTION>Mackenzie Scott is a Male elder</CHARACTER_IN_INTERACTION>',
      monologueOnly,
    });

  it('tells the director that the facts outrank a stale description', () => {
    const prompt = briefing();
    expect(prompt).toContain('<KNOWN_FACTS>');
    expect(prompt).toContain('the FACTS are right');
    expect(prompt).toContain('out of date');
  });

  it('tells the actor the same thing, and only when it has facts', () => {
    const withFacts = buildSpeechSystemPrompt({
      simName: 'Mackenzie Scott',
      actorPrompt: 'You are playing Mackenzie Scott.',
      monologueOnly: false,
      factsBlock: '<KNOWN_FACTS>\nAbout you:\n- you are an elder (retirement age)\n</KNOWN_FACTS>',
    });
    expect(withFacts).toContain('the facts are right');
    // The facts come first, before the briefing that may contradict them
    expect(withFacts.indexOf('<KNOWN_FACTS>')).toBeLessThan(withFacts.indexOf('You are playing'));

    // With no facts block the prompt is byte-identical to the pre-3.1 one, which is what
    // keeps a store-less context (tests, an empty save) working exactly as it did
    const withoutFacts = buildSpeechSystemPrompt({
      simName: 'Mackenzie Scott',
      actorPrompt: 'You are playing Mackenzie Scott.',
      monologueOnly: false,
    });
    expect(withoutFacts).not.toContain('the facts are right');
    expect(withoutFacts.startsWith('You are playing Mackenzie Scott.')).toBe(true);
  });

  it('carries the rule into a solo beat too', () => {
    const solo = buildSpeechSystemPrompt({
      simName: 'Mackenzie Scott',
      actorPrompt: 'You are playing Mackenzie Scott.',
      monologueOnly: true,
      factsBlock: '<KNOWN_FACTS>\nAbout you:\n- you are an elder (retirement age)\n</KNOWN_FACTS>',
    });
    expect(solo).toContain('the facts are right');
    expect(solo).toContain('THINK:');
  });
});

// Fix D: the review stage read the delivered lines with no ground truth, one stage below
// the facts. Live 2026-09-03, Mackenzie's "I live with my parents, Travis and Ariel"
// (father and sister) and Summer's "I'm seeing someone" (no partner on record) both went
// to air untouched. The reviewer now sees each speaker's own facts and one rule for them.
describe('scene review prompt', () => {
  const base = {
    simNames: ['Travis Scott', 'Mackenzie Scott'],
    performerNames: ['Travis Scott', 'Mackenzie Scott'],
    hasPlayerLine: false,
    performerNamesList: 'Travis Scott and Mackenzie Scott',
  };
  const mackenzieFacts = `<KNOWN_FACTS>
About you:
- you are an elder (retirement age)
About Travis Scott: your father
</KNOWN_FACTS>`;

  it('shows the reviewer each speaker facts, labelled, with a contradiction rule', () => {
    const prompt = buildSceneReviewSystemPrompt({
      ...base,
      factsBySim: new Map([
        ['Mackenzie Scott', mackenzieFacts],
        ['Travis Scott', ''],
      ]),
    });
    expect(prompt).toContain('Fact check, before anything else. What the game records about each speaker:');
    // The check sits after the rewrite rules and right before the answer format, where the
    // first cut (prepended, one bullet) was skimmed past: gpt-4.1-mini aired "I focus on
    // fitness coaching" under "you have no job"
    expect(prompt.indexOf('Fact check, before anything else')).toBeGreaterThan(prompt.indexOf('When you do rewrite'));
    expect(prompt.indexOf('Fact check, before anything else')).toBeLessThan(
      prompt.indexOf('Respond with the final scene'),
    );
    expect(prompt).toContain('does not protect it');
    expect(prompt).toContain('<KNOWN_FACTS speaker="Mackenzie Scott">');
    expect(prompt).toContain('your father');
    // An empty block is not a speaker with facts
    expect(prompt).not.toContain('speaker="Travis Scott"');
    expect(prompt).toContain("Contradicts the speaker's own <KNOWN_FACTS>");
    // The rule sits inside the "Only rewrite a line if it:" list, before the closing sentence
    expect(prompt.indexOf('Contradicts the speaker')).toBeLessThan(prompt.indexOf('When you do rewrite'));
    expect(prompt.indexOf('Only rewrite a line if it:')).toBeLessThan(prompt.indexOf('Contradicts the speaker'));
  });

  it('is byte-identical to the pre-D prompt when nobody has facts', () => {
    const without = buildSceneReviewSystemPrompt(base);
    expect(buildSceneReviewSystemPrompt({ ...base, factsBySim: new Map() })).toBe(without);
    expect(buildSceneReviewSystemPrompt({ ...base, factsBySim: new Map([['Travis Scott', '']]) })).toBe(without);
    expect(without.startsWith('You are the director of a show')).toBe(true);
    expect(without).not.toContain('Contradicts the speaker');
    expect(without).not.toContain('Fact check');
  });
});
