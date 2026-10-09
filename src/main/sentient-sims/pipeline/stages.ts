import { AIActionType } from '../models/AIActionType';

// The pipeline named by what each stage DOES in a mind, not by the theatre metaphor the
// scene path grew up with. Phase 3 gives every Sim its own copy of this pipeline (a
// "Sentience"), so the stage id is the unit of routing: a provider, a model, a token
// budget and a prompt variant are all chosen per stage, and later per Sim per stage.
//
// Nothing here changes behaviour on its own. Every stage that exists today keeps its
// legacy AIActionType as an alias, so `aiActionProviderOverrides` set by a player in the
// settings UI keeps routing exactly the calls it routed before.
//
// One stage id = one output contract. A `stagePromptOverrides` entry replaces the whole
// system prompt for its stage, so two call sites may share an id only when the same
// replacement text would satisfy both of their parsers. Where the parsers differ (the
// action review's `{"choice": N}` against the scene review's `name: line` rows, the sleep
// consolidation's five-field JSON against the mid-day plan's three) the stage is split.

export enum StageId {
  // Sensory cortex — game ground truth in (state report + dossier). No LLM.
  SENSES = 'senses',
  // Hippocampus — semantic facts + episodic retrieval into the prompt. No LLM in v1.
  HIPPOCAMPUS_RECALL = 'hippocampus_recall',
  // Hippocampus — extract atomic facts from a memory (idle lane).
  HIPPOCAMPUS_ENCODE = 'hippocampus_encode',
  // Hippocampus — the salience tag stored on a memory row.
  HIPPOCAMPUS_IMPORTANCE = 'hippocampus_importance',
  // Dorsolateral prefrontal cortex — the private briefing for a beat.
  PLANNING_BRIEF = 'planning_brief',
  // Default mode network — the inner voice on a quiet tick.
  DEFAULT_MODE_MONOLOGUE = 'default_mode_monologue',
  // Limbic system — how much this moment matters and how much it pulls at the Sim.
  LIMBIC_SALIENCE = 'limbic_salience',
  // Basal ganglia — action selection over the OFFERED vocabulary.
  BASAL_GANGLIA_OPTIONS = 'basal_ganglia_options',
  BASAL_GANGLIA_CHOICE = 'basal_ganglia_choice',
  // Basal ganglia — the sanity check over the chosen action ({"choice": N} JSON).
  BASAL_GANGLIA_REVIEW = 'basal_ganglia_review',
  // Broca's area — the spoken line (and the thought under it).
  BROCA_SPEECH = 'broca_speech',
  // Ventrolateral prefrontal cortex — reviewing the delivered lines before they air
  // (numbered `name: line` rows in, the same rows out).
  PREFRONTAL_REVIEW = 'prefrontal_review',
  // The older free-text repair over a whole generated scene (the non-directed path).
  PREFRONTAL_REVIEW_TEXT = 'prefrontal_review_text',
  // Wernicke's area — understanding what was asked.
  WERNICKE_TRIAGE = 'wernicke_triage',
  WERNICKE_MATCH = 'wernicke_match',
  // Prefrontal cortex — consenting to or refusing an ask.
  PREFRONTAL_DECIDE = 'prefrontal_decide',
  // Hippocampal replay during sleep — the diary and tomorrow's plan.
  CONSOLIDATION_REFLECT = 'consolidation_reflect',
  CONSOLIDATION_PLAN = 'consolidation_plan',
  // The lazy plan: a Sim who woke without one sets intentions for the rest of today.
  CONSOLIDATION_PLAN_MIDDAY = 'consolidation_plan_midday',
  // Utilities that are not part of any Sim's mind.
  VOICE_COMMAND = 'voice_command',
  DESCRIPTION_DEFAULT = 'description_default',
  CLASSIFICATION = 'classification',
  BUFF = 'buff',
  // Not a brain part — the world. Turn order, round caps, pacing. No LLM.
  CONDUCTOR = 'conductor',
}

export type StageDefinition = {
  id: StageId;
  // How the stage is named to a human: the region, then the job it does there.
  brainName: string;
  job: string;
  // The AIActionType this stage ran as before the registry existed. Provider overrides,
  // the settings UI and the exchange log all still speak in these.
  legacyActionType?: AIActionType;
  // The response budget the call sites pass today. undefined = the stage has no LLM call,
  // or the budget genuinely varies per call (the reflection stage's 250 vs 900).
  defaultMaxResponseTokens?: number;
  // A stage with no LLM call of its own: retrieval, perception, turn ordering.
  usesLLM: boolean;
};

export const STAGES: StageDefinition[] = [
  {
    id: StageId.SENSES,
    brainName: 'Sensory cortex',
    job: 'Game ground truth in — the state report and the per-Sim dossier',
    usesLLM: false,
  },
  {
    id: StageId.HIPPOCAMPUS_RECALL,
    brainName: 'Hippocampus',
    job: 'Recall — known facts and relevant memories for the prompt',
    usesLLM: false,
  },
  {
    id: StageId.HIPPOCAMPUS_ENCODE,
    brainName: 'Hippocampus',
    job: 'Encode — atomic facts extracted from a memory',
    defaultMaxResponseTokens: 200,
    usesLLM: true,
  },
  {
    id: StageId.HIPPOCAMPUS_IMPORTANCE,
    brainName: 'Hippocampus',
    job: 'Salience — how memorable a stored memory is',
    legacyActionType: AIActionType.MEMORY_IMPORTANCE,
    defaultMaxResponseTokens: 5,
    usesLLM: true,
  },
  {
    id: StageId.PLANNING_BRIEF,
    brainName: 'Dorsolateral prefrontal cortex',
    job: 'The private briefing a Sim carries into a beat',
    legacyActionType: AIActionType.DIRECTED_SCENE_DIRECTOR,
    defaultMaxResponseTokens: 500,
    usesLLM: true,
  },
  {
    id: StageId.DEFAULT_MODE_MONOLOGUE,
    brainName: 'Default mode network',
    job: 'The inner voice on a quiet tick',
    legacyActionType: AIActionType.COGNITION,
    defaultMaxResponseTokens: 120,
    usesLLM: true,
  },
  {
    id: StageId.LIMBIC_SALIENCE,
    brainName: 'Limbic system',
    job: 'How memorable this moment is and how hard it pulls at the Sim',
    legacyActionType: AIActionType.DIRECTED_SCENE_SCORES,
    defaultMaxResponseTokens: 300,
    usesLLM: true,
  },
  {
    id: StageId.BASAL_GANGLIA_OPTIONS,
    brainName: 'Basal ganglia',
    job: 'The courses of action open right now, bound to the offered vocabulary',
    legacyActionType: AIActionType.ACTION_SCENE,
    defaultMaxResponseTokens: 400,
    usesLLM: true,
  },
  {
    id: StageId.BASAL_GANGLIA_CHOICE,
    brainName: 'Basal ganglia',
    job: 'Committing to one of them',
    legacyActionType: AIActionType.ACTION_SCENE,
    defaultMaxResponseTokens: 150,
    usesLLM: true,
  },
  {
    id: StageId.BASAL_GANGLIA_REVIEW,
    brainName: 'Basal ganglia',
    job: 'Checking the chosen action for an obvious mistake before it executes',
    legacyActionType: AIActionType.ACTION_SCENE,
    defaultMaxResponseTokens: 60,
    usesLLM: true,
  },
  {
    id: StageId.BROCA_SPEECH,
    brainName: "Broca's area",
    job: 'The line spoken out loud, and the thought running under it',
    legacyActionType: AIActionType.DIRECTED_SCENE_ACTOR,
    defaultMaxResponseTokens: 120,
    usesLLM: true,
  },
  {
    id: StageId.PREFRONTAL_REVIEW,
    brainName: 'Ventrolateral prefrontal cortex',
    job: 'Checking the delivered lines before they air',
    legacyActionType: AIActionType.DIRECTED_SCENE_REVIEWER,
    defaultMaxResponseTokens: 400,
    usesLLM: true,
  },
  {
    id: StageId.PREFRONTAL_REVIEW_TEXT,
    brainName: 'Ventrolateral prefrontal cortex',
    job: 'Repairing a whole generated scene as free text (the non-directed path)',
    legacyActionType: AIActionType.DIRECTED_SCENE_REVIEWER,
    defaultMaxResponseTokens: 300,
    usesLLM: true,
  },
  {
    id: StageId.WERNICKE_TRIAGE,
    brainName: "Wernicke's area",
    job: 'Was that talk, or a request to act?',
    legacyActionType: AIActionType.ASK_TRIAGE,
    defaultMaxResponseTokens: 30,
    usesLLM: true,
  },
  {
    id: StageId.WERNICKE_MATCH,
    brainName: "Wernicke's area",
    job: 'What was asked, mapped onto something the Sim can actually do',
    legacyActionType: AIActionType.ASK_ACTION_MATCH,
    defaultMaxResponseTokens: 150,
    usesLLM: true,
  },
  {
    id: StageId.PREFRONTAL_DECIDE,
    brainName: 'Prefrontal cortex',
    job: 'Will you do it? — consent or refusal, in character',
    legacyActionType: AIActionType.ASK_DECISION,
    defaultMaxResponseTokens: 150,
    usesLLM: true,
  },
  {
    id: StageId.CONSOLIDATION_REFLECT,
    brainName: 'Hippocampal replay (sleep)',
    job: 'The diary entry that closes a stretch of the day',
    legacyActionType: AIActionType.REFLECTION,
    usesLLM: true,
  },
  {
    id: StageId.CONSOLIDATION_PLAN,
    brainName: 'Hippocampal replay (sleep)',
    job: "Goal review and tomorrow's goals, loadout and persona",
    legacyActionType: AIActionType.DAILY_PLAN,
    usesLLM: true,
  },
  {
    id: StageId.CONSOLIDATION_PLAN_MIDDAY,
    brainName: 'Hippocampal replay (waking)',
    job: 'Goals, loadout and persona for the rest of today, when the Sim woke without a plan',
    legacyActionType: AIActionType.DAILY_PLAN,
    defaultMaxResponseTokens: 400,
    usesLLM: true,
  },
  {
    id: StageId.VOICE_COMMAND,
    brainName: 'Utility',
    job: "A spoken order mapped onto the Sim's offered actions",
    legacyActionType: AIActionType.VOICE_COMMAND,
    defaultMaxResponseTokens: 120,
    usesLLM: true,
  },
  {
    id: StageId.DESCRIPTION_DEFAULT,
    brainName: 'Utility',
    job: 'A first description for a Sim or a lot that has none',
    legacyActionType: AIActionType.DESCRIPTION_DEFAULT,
    defaultMaxResponseTokens: 220,
    usesLLM: true,
  },
  {
    id: StageId.CLASSIFICATION,
    brainName: 'Utility',
    job: 'Classifying a conversation, such as the mood it left behind',
    legacyActionType: AIActionType.CLASSIFICATION,
    defaultMaxResponseTokens: 15,
    usesLLM: true,
  },
  {
    id: StageId.BUFF,
    brainName: 'Utility',
    job: 'Which moodlet a conversation leaves on each Sim, how strong and how long',
    legacyActionType: AIActionType.BUFF,
    defaultMaxResponseTokens: 400,
    usesLLM: true,
  },
  {
    id: StageId.CONDUCTOR,
    brainName: 'The world, not the brain',
    job: 'Turn order, round cap, time budget, pacing',
    usesLLM: false,
  },
];

const STAGES_BY_ID = new Map<StageId, StageDefinition>(STAGES.map((stage) => [stage.id, stage]));

// Several stages can share one legacy type (options/choice were both ACTION_SCENE), so the
// reverse map keeps the FIRST stage declared for a type — the one whose budget and prompt
// the legacy call site used.
const STAGES_BY_LEGACY = new Map<AIActionType, StageDefinition>();
STAGES.forEach((stage) => {
  if (stage.legacyActionType && !STAGES_BY_LEGACY.has(stage.legacyActionType)) {
    STAGES_BY_LEGACY.set(stage.legacyActionType, stage);
  }
});

export function stageDefinition(stageId: StageId): StageDefinition {
  const stage = STAGES_BY_ID.get(stageId);
  if (!stage) {
    throw new Error(`Unknown pipeline stage: ${stageId}`);
  }
  return stage;
}

// The stage a legacy action type stands for, when there is one. Action types that are
// event kinds rather than pipeline stages (INTERACTION, CHAT, WANTS…) have no stage.
export function stageForLegacy(actionType: AIActionType): StageDefinition | undefined {
  return STAGES_BY_LEGACY.get(actionType);
}

// The action type a stage still routes and logs as. Provider overrides, the settings UI
// and the exchange log all continue to speak legacy until per-Sim routing lands in 3.2.
export function legacyForStage(stageId: StageId): AIActionType | undefined {
  return STAGES_BY_ID.get(stageId)?.legacyActionType;
}

export function isKnownStage(value: string): value is StageId {
  return STAGES_BY_ID.has(value as StageId);
}
