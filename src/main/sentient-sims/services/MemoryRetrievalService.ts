import { MemoryEntity } from '../db/entities/MemoryEntity';
import { MemoryWithIndex } from '../db/entities/MemoryIndexEntity';
import { ApiContext } from './ApiContext';
import { bufferToEmbedding, cosineSimilarity } from './EmbeddingService';
import { heuristicImportance } from './MemoryAnnotationService';

// A wider net than k so scoring has something to rank, small enough that decoding
// embeddings per query stays cheap at this database's scale.
const CANDIDATE_LIMIT = 500;

// Half-life of about 6 days of real time.
const RECENCY_DECAY_PER_HOUR = 0.995;

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
  excludeMemoryIds?: number[];
};

// Timestamps are SQLite CURRENT_TIMESTAMP strings (UTC, second precision, 'YYYY-MM-DD HH:MM:SS').
export function recencyScore(timestamp: string | undefined, now: Date): number {
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
// query a memory is. Similarity contributes 0 when either side has no embedding, so
// retrieval still ranks sensibly with no embedder configured.
export function scoreCandidate(
  candidate: MemoryWithIndex,
  queryVector: Float32Array | undefined,
  now: Date,
): RetrievedMemory {
  const recency = recencyScore(candidate.timestamp, now);
  const importance = (candidate.importance ?? heuristicImportance(candidate.event_type)) / 10;
  const similarity =
    queryVector && candidate.embedding ? cosineSimilarity(queryVector, bufferToEmbedding(candidate.embedding)) : 0;

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

  async retrieve(request: RetrieveRequest): Promise<RetrievedMemory[]> {
    if (request.k <= 0) {
      return [];
    }

    const candidates = this.ctx.memoryIndexRepository.getRetrievalCandidates(request.participantIds, CANDIDATE_LIMIT);
    const excluded = new Set(request.excludeMemoryIds ?? []);
    const scoreable = candidates.filter((candidate) => candidate.id !== undefined && !excluded.has(candidate.id));
    if (scoreable.length === 0) {
      return [];
    }

    const queryVector = await this.embedQuery(request.queryText);
    const now = new Date();
    const scored = scoreable.map((candidate) => scoreCandidate(candidate, queryVector, now));
    // Ties (same score, e.g. no embeddings and equal importance) break toward newer memories
    scored.sort((a, b) => b.score - a.score || (b.memory.id ?? 0) - (a.memory.id ?? 0));
    return scored.slice(0, request.k);
  }

  private async embedQuery(queryText: string): Promise<Float32Array | undefined> {
    if (!queryText || !this.ctx.embedding.isAvailable()) {
      return undefined;
    }
    const [vector] = await this.ctx.embedding.embed([queryText]);
    return vector;
  }
}
