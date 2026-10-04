import { LLMExchange } from './InteractionEventResult';

export type MemoryTracePipeline =
  | 'directed_scene'
  | 'scene_generation'
  | 'scene_reflection'
  | 'cognition'
  | 'ask_action'
  | 'other';

export type MemoryTraceReview = {
  // What the actors delivered (or the raw scene text) before the reviewer pass
  before: string;
  // The final text after the reviewer pass
  after: string;
  // Whether the reviewer's cut actually aired (directed scenes fall back to the
  // actors' original lines when the reviewer loses a speaker)
  usedReviewerCut: boolean;
};

// Dev-mode record of every LLM stage that produced one memory. Traces for the loaded save
// are persisted (memory_trace); with no database loaded they stay in memory as before.
export type MemoryTrace = {
  pipeline: MemoryTracePipeline;
  exchanges: LLMExchange[];
  // The director's raw briefing output (shared scene + per-actor prompts), directed scenes only
  directorDirection?: string;
  review?: MemoryTraceReview;
};

// How one stage is stored in memory_trace. A stage that went through the logged provider
// seam is kept as a reference into ai_exchange so its prompt lives once in the save; the
// prompt is inlined only for a stage with no logged row (a stubbed provider in tests, or a
// call recorded while no database was loaded).
export type StoredTraceExchange = {
  label: string;
  exchangeId?: number;
  exchange?: LLMExchange;
};

export type StoredMemoryTrace = Omit<MemoryTrace, 'exchanges'> & {
  exchanges: StoredTraceExchange[];
};
