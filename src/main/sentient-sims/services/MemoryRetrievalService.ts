import { MemoryEntity } from '../db/entities/MemoryEntity';
import { MemoryWithIndex } from '../db/entities/MemoryIndexEntity';
import { ApiContext } from './ApiContext';
import { bufferToEmbedding, cosineSimilarity, EmbeddingService } from './EmbeddingService';
import { heuristicImportance } from './MemoryAnnotationService';

// How wide the candidate net is: settings.memoryRetrievalCandidateLimit, default 1000,
// raised from a hardcoded 500 because the entity-focus window makes a bigger pool useful.
// The constant stands in wherever there is no settings service (tests, the bench harness) -
// retrieval must not stop working because a knob is unreadable.
const DEFAULT_CANDIDATE_LIMIT = 1000;

// Half-life of about 6 days of real time.
const RECENCY_DECAY_PER_HOUR = 0.995;

// Half-life of about 3 GAME days. A sim lives on the game clock: at speed 3 a whole sim
// week goes by in real minutes, so real-time decay rated a week-old memory as fresh as
// this morning's. Applied only to rows that carry a game day.
const RECENCY_DECAY_PER_GAME_DAY = 0.794;

export type RetrievedMemory = {
  memory: MemoryEntity;
  score: number;
  // The three components, each roughly 0..1, kept for logging and tests
  recency: number;
  importance: number;
  similarity: number;
};

export type RetrieveRequest = {
  participantIds: string[];
  queryText: string;
  k: number;
  excludeMemoryIds?: string[];
  // Participant ids whose PRIVATE memories (inner monologue rows) may surface — the sim
  // retrieving for itself, or every sim present in the scene being staged (the director
  // is omniscient; actors only ever see what it puts in their briefings). Omitted =
  // shared memories only.
  ownerScope?: string[];
  // People the query is ABOUT (the sim being asked after, the target of an ask). They get
  // their own candidate window, so an old row about someone just named can surface even
  // when the recent window is full of unrelated ticks.
  focusParticipantIds?: string[];
  // The game day right now, from the state report. When both this and the memory's own
  // game day are known, recency is measured in game days rather than real hours.
  today?: number;
  // Cap on self-authored rumination rows ('thought'/'monologue') in the result. A sim's
  // own tick-thoughts win on recency and dominate the candidate pool, so retrieval
  // feeds the monologue its own words back — the echo chamber measured live 2026-08-09
  // (35 of 39 thought rows one topic). 'reflection' rows are deliberately NOT capped:
  // the diary is the identity thread that SHOULD compound. Omitted = old behavior.
  maxSelfAuthored?: number;
};

// Ids are decimal strings of 64-bit ints — too big for float64, so ties compare as BigInt.
function newerIdFirst(a: string | undefined, b: string | undefined): number {
  const aId = a === undefined ? 0n : BigInt(a);
  const bId = b === undefined ? 0n : BigInt(b);
  if (aId === bId) {
    return 0;
  }
  return bId > aId ? 1 : -1;
}

// The rumination row types maxSelfAuthored counts against
const SELF_AUTHORED_EVENT_TYPES = new Set(['thought', 'monologue']);

// Timestamps are SQLite CURRENT_TIMESTAMP strings (UTC, second precision, 'YYYY-MM-DD HH:MM:SS').
export function recencyScore(
  timestamp: string | undefined,
  now: Date,
  gameDay?: number | null,
  today?: number,
): number {
  // Game time wins when both ends are known. A save reloaded to an earlier day can put
  // the memory in the future; clamp rather than score above 1.
  if (gameDay !== undefined && gameDay !== null && today !== undefined) {
    const days = Math.max(0, today - gameDay);
    return RECENCY_DECAY_PER_GAME_DAY ** days;
  }
  if (!timestamp) {
    return 0;
  }
  const then = new Date(`${timestamp.replace(' ', 'T')}Z`);
  if (Number.isNaN(then.getTime())) {
    return 0;
  }
  const hours = Math.max(0, (now.getTime() - then.getTime()) / 3_600_000);
  return RECENCY_DECAY_PER_HOUR ** hours;
}

// Equal-weight blend of how recent, how important, and how semantically close to the
// query a memory is. Similarity contributes 0 when either side has no embedding, or when
// the candidate was embedded with a different model than the query (vectors from
// different models share no space, so comparing them scores garbage), so retrieval still
// ranks sensibly with no embedder configured or mid re-embed after a provider switch.
export function scoreCandidate(
  candidate: MemoryWithIndex,
  queryVector: Float32Array | undefined,
  queryModel: string | undefined,
  now: Date,
  today?: number,
): RetrievedMemory {
  const recency = recencyScore(candidate.timestamp, now, candidate.game_day, today);
  const importance = (candidate.importance ?? heuristicImportance(candidate.event_type)) / 10;
  const similarity =
    queryVector && candidate.embedding && candidate.embedding_model === queryModel
      ? cosineSimilarity(queryVector, bufferToEmbedding(candidate.embedding))
      : 0;

  return {
    memory: candidate,
    score: recency + importance + similarity,
    recency,
    importance,
    similarity,
  };
}

// Scores memories involving the given participants against a query text and returns the
// top k — the engine behind the <RELEVANT_MEMORIES> prompt block (Block 6) and cognition
// tick context.
export class MemoryRetrievalService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Wrapped because a context assembled without a settings service (tests, the bench
  // harness) must still retrieve rather than throw.
  private candidateLimit(): number {
    try {
      return this.ctx.settings.memoryRetrievalCandidateLimit;
    } catch {
      return DEFAULT_CANDIDATE_LIMIT;
    }
  }

  async retrieve(request: RetrieveRequest): Promise<RetrievedMemory[]> {
    if (request.k <= 0) {
      return [];
    }

    // Capture the embedder once so the candidate embeddings, the query vector, and the
    // model they're compared under can't drift if the provider setting changes mid-request
    const embedder = this.ctx.embedding;
    const candidates = this.ctx.memoryIndexRepository.getRetrievalCandidates(
      request.participantIds,
      this.candidateLimit(),
      embedder.model,
      request.ownerScope ?? [],
      request.focusParticipantIds ?? [],
    );
    const excluded = new Set(request.excludeMemoryIds ?? []);
    const scoreable = candidates.filter((candidate) => candidate.id !== undefined && !excluded.has(candidate.id));
    if (scoreable.length === 0) {
      return [];
    }

    const queryVector = await this.embedQuery(request.queryText, embedder);
    const now = new Date();
    const scored = scoreable.map((candidate) =>
      scoreCandidate(candidate, queryVector, embedder.model, now, request.today),
    );
    // Ties (same score, e.g. no embeddings and equal importance) break toward newer memories
    scored.sort((a, b) => b.score - a.score || newerIdFirst(a.memory.id, b.memory.id));
    if (request.maxSelfAuthored === undefined) {
      return scored.slice(0, request.k);
    }
    // Walk best-first, skipping rumination rows beyond the cap and filling to k from
    // the rest — the top non-thought memories still surface in rank order
    const selected: RetrievedMemory[] = [];
    let selfAuthored = 0;
    for (const candidate of scored) {
      if (selected.length >= request.k) {
        break;
      }
      if (SELF_AUTHORED_EVENT_TYPES.has(candidate.memory.event_type ?? '')) {
        if (selfAuthored >= request.maxSelfAuthored) {
          continue;
        }
        selfAuthored += 1;
      }
      selected.push(candidate);
    }
    return selected;
  }

  private async embedQuery(queryText: string, embedder: EmbeddingService): Promise<Float32Array | undefined> {
    if (!queryText || !embedder.isAvailable()) {
      return undefined;
    }
    const [vector] = await embedder.embed([queryText]);
    return vector;
  }
}
