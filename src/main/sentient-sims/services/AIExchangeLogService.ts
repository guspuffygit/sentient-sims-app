import { AsyncLocalStorage } from 'async_hooks';
import log from 'electron-log';
import { AIActionType } from '../models/AIActionType';
import { AIExchangeDetail, AIExchangeSummary } from '../models/AIExchangeLog';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { StageId } from '../pipeline/stages';
import { notifyProviderHealth } from '../util/notifyRenderer';

// Prompts run tens of kilobytes each, so the log is a bounded ring: enough history to
// follow a play session, small enough to never matter for memory.
const MAX_ENTRIES = 200;
// The persisted table holds a whole save's history rather than one session's, but the save
// database is copied whole on every game save, so it is bounded too — generously.
const MAX_PERSISTED_ENTRIES = 5000;
const PRUNE_EVERY = 500;
const PREVIEW_CHARS = 160;
// O-6: this many consecutive provider failures = the pipeline is dead (3h of 429s went
// unnoticed in the 08-04..08-14 playtest). One renderer badge + ONE non-pausing game
// toast; cleared on the next success.
const DEAD_PIPELINE_FAILURES = 3;

// Where the log persists, when a build keeps it (release 4.5, decision 16): the ai_exchange
// table in the loaded save. The stream tier attaches AIExchangeRepository; the core build
// attaches nothing and the log is the in-memory ring alone.
export interface ExchangePersistence {
  isLoaded(): boolean;
  insert(exchange: AIExchangeDetail): void;
  list(limit: number): AIExchangeSummary[];
  get(id: number): AIExchangeDetail | undefined;
  setMemoryId(ids: number[], memoryId: string): void;
  maxId(): number;
  prune(keep: number): void;
}

type LabelContext = { label: string; actionType?: AIActionType; stageId?: StageId };

type Entry = AIExchangeDetail;

/**
 * Records every request the app makes to an AI provider — scene pipelines, cognition ticks,
 * reflections, classifications, importance ratings, everything — so dev mode can show the
 * exact prompt and response for each one.
 *
 * Capture happens at the single provider seam (ApiContext.getGenerationService), which is why
 * new call sites are logged automatically. The human-readable label comes from an
 * AsyncLocalStorage scope set by the caller: concurrent generations (a prefetch and a
 * cognition tick overlap routinely) each keep their own label without threading a parameter
 * through the GenerationService interface.
 *
 * In builds that keep it (stream and dev; release 4.5, decision 16) every row is also written
 * to the loaded save's ai_exchange table (F4), so the bench and the
 * watches can read prompts back after a restart. The in-memory ring stays the live view of
 * this session and covers the windows where no save is loaded (the main menu, the scenario
 * tester, tests); the table is authoritative whenever one is.
 */
export class AIExchangeLogService {
  private entries: Entry[] = [];

  private nextId = 1;

  private readonly labelContext = new AsyncLocalStorage<LabelContext>();

  private consecutiveFailures = 0;

  private pipelineDown = false;

  private repository?: ExchangePersistence;

  // Called once by the tier that keeps the table (stream); never in the core build
  attachPersistence(store: ExchangePersistence) {
    this.repository = store;
  }

  private get persistence(): ExchangePersistence | undefined {
    return this.repository?.isLoaded() ? this.repository : undefined;
  }

  // Called when a save's database opens. Ids continue above whatever that save already
  // holds, so a restart never reuses an id that /ai/exchanges/:id already answers. The ring
  // is dropped with them: its entries belong to whatever was loaded before, and their ids sit
  // below the new floor, so keeping them would put two different calls under one id.
  onDatabaseLoaded() {
    const repository = this.persistence;
    if (!repository) {
      return;
    }
    try {
      this.entries = [];
      this.nextId = Math.max(this.nextId, repository.maxId() + 1);
      repository.prune(MAX_PERSISTED_ENTRIES);
    } catch (err) {
      log.error('Unable to read the persisted AI exchange log', err);
    }
  }

  getProviderHealth(): { down: boolean; consecutiveFailures: number } {
    return { down: this.pipelineDown, consecutiveFailures: this.consecutiveFailures };
  }

  private trackHealth(error: string | undefined) {
    if (error) {
      this.consecutiveFailures += 1;
      if (!this.pipelineDown && this.consecutiveFailures >= DEAD_PIPELINE_FAILURES) {
        this.pipelineDown = true;
        notifyProviderHealth({ down: true, failures: this.consecutiveFailures, lastError: error.slice(0, 200) });
      }
      return;
    }
    if (this.pipelineDown) {
      this.pipelineDown = false;
      notifyProviderHealth({ down: false, failures: 0 });
    }
    this.consecutiveFailures = 0;
  }

  // Runs fn with a label attached to every provider call made inside it
  runLabeled<T>(
    label: string,
    actionType: AIActionType | undefined,
    fn: () => Promise<T>,
    stageId?: StageId,
  ): Promise<T> {
    return this.labelContext.run({ label, actionType, stageId }, fn);
  }

  record(params: {
    request: OpenAICompatibleRequest;
    responseText: string;
    durationMs: number;
    error?: string;
  }): number {
    const context = this.labelContext.getStore();
    const id = this.nextId;
    this.nextId += 1;
    this.trackHealth(params.error);

    const promptChars = params.request.messages.reduce((total, message) => total + message.content.length, 0);
    const responsePreview = params.responseText.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_CHARS);

    const entry: Entry = {
      id,
      at: new Date().toISOString(),
      label: context?.label ?? 'AI Generation',
      actionType: context?.actionType,
      stageId: context?.stageId,
      apiType: params.request.apiType,
      model: params.request.model,
      durationMs: params.durationMs,
      promptChars,
      responsePreview,
      responseText: params.responseText,
      request: params.request,
      promptOverflow: params.request.promptOverflow,
      error: params.error,
    };
    this.entries.push(entry);

    if (this.entries.length > MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - MAX_ENTRIES);
    }

    // Best-effort: logging a call must never break the call it logged
    try {
      const repository = this.persistence;
      repository?.insert(entry);
      // A long session would otherwise grow the table between loads
      if (repository && id % PRUNE_EVERY === 0) {
        repository.prune(MAX_PERSISTED_ENTRIES);
      }
    } catch (err) {
      log.error('Unable to persist an AI exchange', err);
    }

    return id;
  }

  // The logged row id for a request object, by identity — used to store a memory's trace as
  // references into the exchange table instead of a second copy of every prompt.
  idForRequest(request: OpenAICompatibleRequest): number | undefined {
    return this.entries.find((entry) => entry.request === request)?.id;
  }

  // Stamps the memory a set of calls produced onto their log rows. Matching is by request
  // object identity — the exact objects the pipeline passed to the provider — so no text
  // comparison can mislabel a row.
  linkRequestsToMemory(requests: OpenAICompatibleRequest[], memoryId: string) {
    if (requests.length === 0) {
      return;
    }
    const linkedIds: number[] = [];
    this.entries.forEach((entry) => {
      if (entry.memoryId === undefined && requests.includes(entry.request)) {
        entry.memoryId = memoryId;
        linkedIds.push(entry.id);
      }
    });

    try {
      this.persistence?.setMemoryId(linkedIds, memoryId);
    } catch (err) {
      log.error('Unable to link persisted AI exchanges to a memory', err);
    }
  }

  // Newest first, without the prompt bodies — the list is polled, the detail is not
  list(limit = MAX_ENTRIES): AIExchangeSummary[] {
    const persisted = this.readPersisted(() => this.persistence?.list(limit));
    if (persisted) {
      return persisted;
    }

    return this.entries
      .slice(-limit)
      .reverse()
      .map((entry) => ({
        id: entry.id,
        at: entry.at,
        label: entry.label,
        actionType: entry.actionType,
        stageId: entry.stageId,
        apiType: entry.apiType,
        model: entry.model,
        durationMs: entry.durationMs,
        promptChars: entry.promptChars,
        responsePreview: entry.responsePreview,
        memoryId: entry.memoryId,
        promptOverflow: entry.promptOverflow,
        error: entry.error,
      }));
  }

  get(id: number): AIExchangeDetail | undefined {
    // The ring first: it holds this session's calls, including any whose write failed
    return this.entries.find((entry) => entry.id === id) ?? this.readPersisted(() => this.persistence?.get(id));
  }

  // A read from a save's table must never take down the log the UI polls
  private readPersisted<T>(read: () => T | undefined): T | undefined {
    try {
      return read();
    } catch (err) {
      log.error('Unable to read the persisted AI exchange log', err);
      return undefined;
    }
  }
}
