import { describe, expect, it } from 'vitest';
import { AIActionType, AllAIActionTypes } from 'main/sentient-sims/models/AIActionType';
import {
  isKnownStage,
  legacyForStage,
  StageId,
  stageDefinition,
  stageForLegacy,
  STAGES,
} from 'main/sentient-sims/pipeline/stages';
import { promptFor, sanitizeStagePromptOverrides } from 'main/sentient-sims/pipeline/prompts';

describe('pipeline stage registry', () => {
  it('declares every StageId exactly once', () => {
    const ids = STAGES.map((stage) => stage.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set(Object.values(StageId)));
  });

  it('gives every stage a brain name and a job', () => {
    STAGES.forEach((stage) => {
      expect(stage.brainName.length, stage.id).toBeGreaterThan(0);
      expect(stage.job.length, stage.id).toBeGreaterThan(0);
    });
  });

  it('only gives a response budget to stages that make an LLM call', () => {
    STAGES.filter((stage) => !stage.usesLLM).forEach((stage) => {
      expect(stage.defaultMaxResponseTokens, stage.id).toBeUndefined();
      expect(stage.legacyActionType, stage.id).toBeUndefined();
    });
  });

  it('only aliases action types that actually exist', () => {
    STAGES.forEach((stage) => {
      if (stage.legacyActionType) {
        expect(AllAIActionTypes, stage.id).toContain(stage.legacyActionType);
      }
    });
  });

  it('maps every pipeline action type back to a stage', () => {
    // The action types that are event kinds rather than pipeline stages keep no stage:
    // they name what the player did, not what the mind was doing.
    const eventKinds = [
      AIActionType.INTERACTION,
      AIActionType.DO_SOMETHING,
      AIActionType.CHAT,
      AIActionType.CHAT_CONTINUE,
      AIActionType.CONTINUE,
      AIActionType.WANTS,
      AIActionType.WICKED_WHIMS,
      AIActionType.GENERATE,
    ];

    AllAIActionTypes.filter((actionType) => !eventKinds.includes(actionType)).forEach((actionType) => {
      expect(stageForLegacy(actionType), actionType).toBeDefined();
    });
    eventKinds.forEach((actionType) => {
      expect(stageForLegacy(actionType), actionType).toBeUndefined();
    });
  });

  it('round-trips a stage through its legacy alias', () => {
    expect(legacyForStage(StageId.PLANNING_BRIEF)).toBe(AIActionType.DIRECTED_SCENE_DIRECTOR);
    expect(stageForLegacy(AIActionType.DIRECTED_SCENE_DIRECTOR)?.id).toBe(StageId.PLANNING_BRIEF);
    expect(legacyForStage(StageId.HIPPOCAMPUS_RECALL)).toBeUndefined();
  });

  it('routes memory importance to its own action type instead of the chat slot', () => {
    // It used to fall through to GENERATE, so the chat tab's provider override silently
    // decided which model rated every stored memory.
    expect(legacyForStage(StageId.HIPPOCAMPUS_IMPORTANCE)).toBe(AIActionType.MEMORY_IMPORTANCE);
    expect(stageForLegacy(AIActionType.GENERATE)).toBeUndefined();
  });

  it('gives call sites with different output contracts different stage ids', () => {
    // One override replaces one stage's whole system prompt, so the {"choice": N} action
    // review, the `name: line` scene review and the free-text scene repair cannot share an
    // id; nor can the five-field sleep plan and the three-field mid-day plan.
    expect(legacyForStage(StageId.BASAL_GANGLIA_REVIEW)).toBe(AIActionType.ACTION_SCENE);
    expect(legacyForStage(StageId.PREFRONTAL_REVIEW)).toBe(AIActionType.DIRECTED_SCENE_REVIEWER);
    expect(legacyForStage(StageId.PREFRONTAL_REVIEW_TEXT)).toBe(AIActionType.DIRECTED_SCENE_REVIEWER);
    expect(legacyForStage(StageId.CONSOLIDATION_PLAN_MIDDAY)).toBe(AIActionType.DAILY_PLAN);
    // The reverse map still resolves a legacy type to the stage its call site used first
    expect(stageForLegacy(AIActionType.ACTION_SCENE)?.id).toBe(StageId.BASAL_GANGLIA_OPTIONS);
    expect(stageForLegacy(AIActionType.DAILY_PLAN)?.id).toBe(StageId.CONSOLIDATION_PLAN);
  });

  it('resolves a definition by id and rejects an unknown one', () => {
    expect(stageDefinition(StageId.BROCA_SPEECH).brainName).toBe("Broca's area");
    expect(() => stageDefinition('amygdala_hijack' as StageId)).toThrow('Unknown pipeline stage');
    expect(isKnownStage('broca_speech')).toBe(true);
    expect(isKnownStage('amygdala_hijack')).toBe(false);
  });
});

describe('stage prompt overrides', () => {
  it('returns the built prompt when nothing is overridden', () => {
    expect(promptFor(StageId.BROCA_SPEECH, 'built')).toBe('built');
    expect(promptFor(StageId.BROCA_SPEECH, 'built', {})).toBe('built');
    expect(promptFor(StageId.BROCA_SPEECH, 'built', { [StageId.PLANNING_BRIEF]: 'other' })).toBe('built');
  });

  it('returns the override when one is set for that stage', () => {
    expect(promptFor(StageId.BROCA_SPEECH, 'built', { [StageId.BROCA_SPEECH]: 'mine' })).toBe('mine');
  });

  it('ignores a blank override rather than sending an empty system prompt', () => {
    expect(promptFor(StageId.BROCA_SPEECH, 'built', { [StageId.BROCA_SPEECH]: '   ' })).toBe('built');
  });

  it('drops unknown stage ids and non-string values when sanitizing', () => {
    const sanitized = sanitizeStagePromptOverrides({
      broca_speech: 'keep me',
      amygdala_hijack: 'not a stage',
      planning_brief: '',
      limbic_salience: 42,
    });

    expect(sanitized).toEqual({ [StageId.BROCA_SPEECH]: 'keep me' });
  });

  it('sanitizes anything that is not an object to an empty map', () => {
    expect(sanitizeStagePromptOverrides(undefined)).toEqual({});
    expect(sanitizeStagePromptOverrides(null)).toEqual({});
    expect(sanitizeStagePromptOverrides('nope')).toEqual({});
    expect(sanitizeStagePromptOverrides([1, 2])).toEqual({});
  });
});
