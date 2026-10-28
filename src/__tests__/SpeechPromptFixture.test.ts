import { describe, expect, it } from 'vitest';
import { buildSpeechSystemPrompt } from 'main/sentient-sims/pipeline/prompts/scene';
import { SPEECH_FIXTURE_INPUTS } from './fixtures/speechPromptInputs';
import fixture from './fixtures/speechPrompts.json';

// The 4.6 actor prompt, pinned byte for byte before speechRules() was extracted for the lean
// pipeline (2026-10-27). Full mode must keep producing exactly this text.
describe('buildSpeechSystemPrompt (full pipeline) matches the pre-lean fixture', () => {
  Object.entries(SPEECH_FIXTURE_INPUTS).forEach(([key, input]) => {
    it(key, () => {
      expect(buildSpeechSystemPrompt(input)).toBe((fixture as Record<string, string>)[key]);
    });
  });
});
