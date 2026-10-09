import { StageId } from '../stages';

// Every system prompt the pipeline sends, in one place and addressed by stage id.
//
// They were inline template literals in nine service files, which made them impossible to
// diff between runs, impossible to override without a rebuild, and impossible for the
// bench to enumerate. The text here is verbatim: this module moved the strings, it did not
// edit them. Stages whose prompt is built from live scene context export a builder
// function instead of a constant, and the context they need is an explicit parameter
// rather than whatever happened to be in scope.

// The autonomy stages' prompts (cognition, action, ask, plan) are not re-exported here:
// they are stripped from the core build (release 4.5) and their callers import them directly.
export * from './scene';
export * from './consolidation';
export * from './utility';

// A player-set override for one stage's system prompt, keyed by stage id.
export type StagePromptOverrides = Partial<Record<StageId, string>>;

/**
 * The system prompt a stage should send: the player's override when one is set for that
 * stage, otherwise the prompt the pipeline built.
 *
 * An override replaces the built text wholesale. For a stage whose prompt interpolates
 * live scene context (the briefing, the actor, the reviewer), that means the override has
 * to carry its own instructions and gives up that context — which is the point of
 * overriding it, but it is a sharp edge worth knowing about.
 */
export function promptFor(stageId: StageId, builtPrompt: string, overrides?: StagePromptOverrides): string {
  const override = overrides?.[stageId];
  if (typeof override === 'string' && override.trim().length > 0) {
    return override;
  }
  return builtPrompt;
}

export function sanitizeStagePromptOverrides(value: unknown): StagePromptOverrides {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const overrides: StagePromptOverrides = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, text]) => {
    if (typeof text === 'string' && text.trim().length > 0 && Object.values(StageId).includes(key as StageId)) {
      overrides[key as StageId] = text;
    }
  });
  return overrides;
}
