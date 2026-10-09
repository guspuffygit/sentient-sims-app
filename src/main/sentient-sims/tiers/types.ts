// Build tiers (release 4.5), the app side of the mod's tiers.py.
//
// One tree, three builds: dev (everything), stream (minus dev), core (the public release:
// minus stream, autonomy and dev). The stripped files are listed in tiers.json and deleted
// before a stripped build, so CORE code may only reach them through what this folder owns:
// the TierRegistration hooks below and the capability slots on ApiContext.ext. Each tier's
// entry module (stream.ts, autonomy.ts, dev.ts) registers into these; the generated index.ts
// lists the entries a build keeps. Nothing here may name a tier's own classes.
import type { Express } from 'express';
import type { IpcMain } from 'electron';
import type { ApiContext } from '../services/ApiContext';
import type { SceneClosed } from '../services/ScenePlaybackRegistry';
import type { MemoryEntity } from '../db/entities/MemoryEntity';
import type { SSEvent } from '../models/InteractionEvents';
import type { InteractionEventResult, LLMExchange } from '../models/InteractionEventResult';
import type { DirectedGenerationOptions } from '../services/AIService';
import type { ReflectionPromptContext } from '../pipeline/prompts/consolidation';
import type { TodaysPlanBlock } from '../util/formatSelfStatus';
import type { ModLogWebsocketMessage } from '../models/ModLogWebsocketMessage';
import type { MemoryTrace, MemoryTracePipeline } from '../models/MemoryTrace';
import type { ActionDispatcherService } from '../services/ActionDispatcherService';
import type { CognitionController } from '../controllers/CognitionController';

export type Tier = 'core' | 'stream' | 'dev';

export type TierLayer = 'stream' | 'autonomy' | 'dev';

// Every hook takes the context it runs for: tests build many contexts in one process, and
// a tier keeps its services per context (a WeakMap behind streamOf/autonomyOf/devOf).
export interface TierRegistration {
  name: TierLayer;
  // Build the tier's services and fill its ApiContext.ext slots. Runs inside the ApiContext
  // constructor, after every core service exists and before the controllers are built.
  construct?(ctx: ApiContext): void;
  // Main process only (main.ts), after IPC is bound: connect, arm hotkeys, open sockets.
  start?(ctx: ApiContext): void;
  // HTTP routes, bound after the core routes.
  routes?(app: Express, ctx: ApiContext): void;
  // Renderer IPC handlers (main.ts only; tests never bind IPC).
  ipc?(ipcMain: IpcMain, ctx: ApiContext): void;
  onSettingChanged?(ctx: ApiContext, key: string): void;
  onDatabaseLoaded?(ctx: ApiContext): void;
  // A conversation closed (ran its course or the game stopped it). Called in registration
  // order: stream's moodlet appraisal before autonomy's held conversation actions.
  onSceneClosed?(ctx: ApiContext, closed: SceneClosed): void;
  // A websocket message from the mod that core did not handle. True means handled.
  onModMessage?(ctx: ApiContext, message: ModLogWebsocketMessage): boolean;
  onMemoryUpserted?(ctx: ApiContext, memory: MemoryEntity): void;
  // App quit (main.ts will-quit).
  shutdown?(ctx: ApiContext): void;
}

// --- Capability slots (ApiContext.ext) -------------------------------------------------
// What core code may ask a tier for. Every slot is optional: a build without the tier
// leaves it undefined and core carries on without the feature. Typed with core-owned
// types only, so core never names a tier's classes.

export type AskActionPlayback = {
  priority?: boolean;
  deferPlayback?: boolean;
  onPlaybackReady?: (play: () => void) => void;
};

// AUTONOMY: a solo player line that asks the sim to DO something. Undefined on any miss,
// and the ordinary reply runs.
export interface AskActionSlot {
  tryAskedAction(
    event: SSEvent,
    options: DirectedGenerationOptions,
    playback: AskActionPlayback,
  ): Promise<InteractionEventResult | undefined>;
}

export type ConversationActionRequest = {
  score: number;
  reason?: string;
  thought?: string;
  speaker: string;
  transcript: string;
  sceneId?: string;
  suggestOnly?: boolean;
};

export type ConversationActionOutcome = { acted: boolean; action?: string; target?: string };

// AUTONOMY: a scene's action verdicts. A player-facing beat acts once its scene has aired;
// any other scene arms a desire for the sim's next tick.
export interface ConversationActionsSlot {
  actOnConversation(simId: string, request: ConversationActionRequest): Promise<ConversationActionOutcome>;
  armDesireFromScene(simId: string, desire: { score: number; reason?: string; thought?: string }): void;
}

// AUTONOMY: the nightly planner riding the sleep diary. prepare() returns undefined when
// there is nothing to plan tonight, and the reflection is the plain diary.
export interface SleepPlan {
  // The combined diary + plan system prompt, built around the diary's own context
  systemPrompt(reflection: ReflectionPromptContext): string;
  // Records the review and accepts the plan out of the model's reply; returns the diary
  // prose (never the JSON), before cleanup
  accept(raw: string): string;
}

export interface SleepPlannerSlot {
  prepare(
    pov: { simId: string; simName: string },
    sleepClock?: { hour?: number; absolute_day?: number },
  ): SleepPlan | undefined;
}

// AUTONOMY: an order spoken on the voice command chord
export interface VoiceCommandSlot {
  handleCommand(text: string): Promise<boolean>;
}

// DEV: the Memories window's pipeline view. Core records what produced each memory only when
// a tier keeps it.
export interface TraceSlot {
  recordPending(contents: (string | undefined)[], trace: MemoryTrace): void;
  appendExchange(memoryId: string, exchange: LLMExchange | undefined, pipeline?: MemoryTracePipeline): void;
}

export interface TierExtensions {
  trace?: TraceSlot;
  askAction?: AskActionSlot;
  conversationActions?: ConversationActionsSlot;
  sleepPlanner?: SleepPlannerSlot;
  voiceCommand?: VoiceCommandSlot;
  // AUTONOMY: today's plan as the self-status block renders it
  selfStatusPlan?: (simId: string, absoluteDay: number) => TodaysPlanBlock | undefined;
  // AUTONOMY: the cognition loop's subclasses of Gus's dispatcher and controller. Core
  // builds his own when a slot is empty; his routes serve whichever instance it holds.
  actionDispatcher?: ActionDispatcherService;
  cognitionController?: CognitionController;
}
