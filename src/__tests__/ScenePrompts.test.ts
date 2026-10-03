import { describe, expect, it } from 'vitest';
import {
  buildBriefingSystemPrompt,
  buildSceneReviewSystemPrompt,
  buildSpeechSystemPrompt,
  deceptionFraming,
  performersAlreadyTalking,
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

// Pets with speech switched off (2026-10-15): the director briefs them for their inner life
// only, and the reviewer no longer demands a line from both characters when one is silent.
describe('scene prompts with a silent performer', () => {
  const performerNames = ['Anker Solheim', 'Bosun Solheim'];

  it('tells the director who cannot speak and that the others carry the dialogue', () => {
    const prompt = buildBriefingSystemPrompt({
      simNames: performerNames,
      performerNames,
      sceneContext: '',
      monologueOnly: false,
      silentNames: ['Bosun Solheim'],
    });
    expect(prompt).toContain('Bosun Solheim cannot speak');
    expect(prompt).toContain('the other actors carry the dialogue');
    expect(prompt).not.toContain('SOLO beat');
  });

  it('calls a beat where nobody can speak a silent beat', () => {
    const prompt = buildBriefingSystemPrompt({
      simNames: performerNames,
      performerNames,
      sceneContext: '',
      monologueOnly: true,
      silentNames: performerNames,
    });
    expect(prompt).toContain('SILENT beat');
    expect(prompt).not.toContain('SOLO beat');
  });

  it('is byte-identical without silent names', () => {
    const base = { simNames: performerNames, performerNames, sceneContext: '', monologueOnly: false };
    expect(buildBriefingSystemPrompt({ ...base, silentNames: [] })).toBe(buildBriefingSystemPrompt(base));
  });

  it('asks the reviewer for both voices only when two can speak', () => {
    const base = {
      simNames: performerNames,
      performerNames,
      hasPlayerLine: false,
      performerNamesList: 'Anker Solheim',
    };
    expect(buildSceneReviewSystemPrompt(base)).toContain('Both characters must speak');
    const oneSpeaker = buildSceneReviewSystemPrompt({ ...base, speakerNames: ['Anker Solheim'] });
    expect(oneSpeaker).not.toContain('Both characters must speak');
    expect(oneSpeaker).toContain('one to three lines');
  });
});

// Live 2026-09-30: Paolo's "I know you're not a CEO" aired as "I know you're not a Tech Guru
// CEO" - the reviewer read Paolo's line against Elliot's facts and "repaired" it by adding them.
describe('scene review fact check scope', () => {
  it('checks each line against its own speaker only and never adds detail', () => {
    const prompt = buildSceneReviewSystemPrompt({
      simNames: ['Elliot Chatman', 'Paolo Rocca'],
      performerNames: ['Elliot Chatman', 'Paolo Rocca'],
      hasPlayerLine: false,
      performerNamesList: 'Elliot Chatman and Paolo Rocca',
      factsBySim: new Map([
        ['Elliot Chatman', '<KNOWN_FACTS>\n- you work in the Tech Guru career, level 5\n</KNOWN_FACTS>'],
      ]),
    });
    expect(prompt).toContain("Check a line only against ITS OWN speaker's facts");
    expect(prompt).toContain('it never adds a name, job, title or detail the line did not already contain');
    expect(prompt.indexOf('ITS OWN speaker')).toBeLessThan(prompt.indexOf('Respond with the final scene'));
  });
});

describe('deception framing', () => {
  it('gives the target an innocent view and the liar the material', () => {
    const framing = deceptionFraming('mixer_social_LieAboutCareer_group_mischief_skills', 'Elliot', 'Paolo');
    expect(framing?.targetView).toBe('Elliot is telling Paolo how work is going.');
    expect(framing?.targetView).not.toMatch(/false|lie|fake|made up/i);
    expect(framing?.liarHint).toContain('makes the story up out loud');
  });

  it('covers the verbal lies and leaves physical pranks and ordinary socials alone', () => {
    ['GiveFakeBadNews_targeted', 'InstillWithFalseConfidence_targeted', 'InviteToFakeParty_targeted'].forEach(
      (name) => {
        const framing = deceptionFraming(`mixer_social_${name}`, 'A', 'B');
        expect(framing?.targetView).not.toMatch(/false|lie|fake|made up|prank/i);
      },
    );
    expect(deceptionFraming('mixer_social_AttemptToScare_targeted_mischief_skills', 'A', 'B')).toBeUndefined();
    expect(deceptionFraming('mixer_social_Chat', 'A', 'B')).toBeUndefined();
    expect(deceptionFraming(undefined, 'A', 'B')).toBeUndefined();
  });
});

// Live 2026-09-30: Elliot started on Paolo right after a conversation with Lillie, and both
// actors were told to jump in mid-flow because "Previously in this scene" was not empty.
describe('performersAlreadyTalking', () => {
  const lillieScene = [
    'Elliot Chatman is asking Lillie Cason about their day.',
    'Elliot Chatman: How was your day though',
    'Lillie Cason: It was amazing, thanks for asking',
    'Elliot Chatman is flirting with Lillie Cason.',
    'Elliot Chatman: You light up when you talk about things you love',
    "Lillie Cason: That's what makes life worth living, right?",
  ].join('\n');

  it("is false for a new pair after someone else's conversation", () => {
    expect(performersAlreadyTalking(lillieScene, ['Elliot Chatman', 'Paolo Rocca'])).toBe(false);
  });

  it('is true when the pair spoke in one beat', () => {
    expect(performersAlreadyTalking(lillieScene, ['Elliot Chatman', 'Lillie Cason'])).toBe(true);
  });

  it('does not join two separate beats that each had one of them', () => {
    const text = [
      'Elliot Chatman is chatting with Lillie Cason.',
      'Elliot Chatman: Hey',
      'Lillie Cason: Hi',
      'Paolo Rocca is chatting with Adrian House.',
      'Paolo Rocca: Yo',
      'Adrian House: Hey man',
    ].join('\n');
    expect(performersAlreadyTalking(text, ['Elliot Chatman', 'Paolo Rocca'])).toBe(false);
  });

  it('is false with no history', () => {
    expect(performersAlreadyTalking('', ['Elliot Chatman', 'Paolo Rocca'])).toBe(false);
  });
});
