import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';
import { CatchErrors } from './decorators/CatchError';
import { FactPredicate, isKnownSource } from '../pipeline/facts/predicates';

/**
 * Read and write one sim's semantic facts (Phase 3.1 H4).
 *
 * The point of the read side is provenance: "why does she believe that" should resolve to
 * the memory row it came from, and "how is she related to him at all" should resolve to a
 * chain of edges. Hallucination hunting has had no such surface until now - the watches
 * could see what a sim said and not what it thought it knew.
 */
export class SimFactsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Express types a route param as string | string[]; every one of ours is a single id.
  private static param(value: string | string[] | undefined): string {
    return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
  }

  private nameMap(simIds: string[]): Record<string, string> {
    const unique = [...new Set(simIds.filter(Boolean))];
    if (unique.length === 0) {
      return {};
    }
    try {
      return this.ctx.semanticMemory.namesForIds(unique);
    } catch {
      return {};
    }
  }

  // GET /sims/:id/facts — current beliefs, ?all=1 for the history, ?about= for one person
  @CatchErrors()
  getFacts = (req: Request, res: Response) => {
    const simId = SimFactsController.param(req.params.id);
    const about = typeof req.query.about === 'string' ? req.query.about : undefined;
    const all = req.query.all === '1' || req.query.all === 'true';
    const facts = all
      ? this.ctx.semanticMemory.getHistory(simId)
      : this.ctx.semanticMemory.getCurrentFacts(simId, { about });
    const filtered = all && about ? facts.filter((fact) => fact.objectSimId === about) : facts;
    const names = this.nameMap([simId, ...filtered.map((fact) => fact.objectSimId ?? '')]);
    return res.json({ simId, names, facts: filtered });
  };

  // GET /sims/:id/facts/path/:otherId — the chain of edges connecting two sims
  @CatchErrors()
  getFactPath = (req: Request, res: Response) => {
    const simId = SimFactsController.param(req.params.id);
    const otherId = SimFactsController.param(req.params.otherId);
    const hops = Number(req.query.hops ?? 2);
    const path = this.ctx.semanticMemory.pathBetween(simId, otherId, Number.isFinite(hops) ? hops : 2);
    const names = this.nameMap([
      simId,
      otherId,
      ...path.flatMap((fact) => [fact.subjectSimId, fact.objectSimId ?? '']),
    ]);
    return res.json({ from: simId, to: otherId, connected: path.length > 0, names, path });
  };

  // GET /facts/:factId/explain — the fact, the memory behind it, and what it replaced
  @CatchErrors()
  getExplain = (req: Request, res: Response) => {
    const factId = Number(SimFactsController.param(req.params.factId));
    if (!Number.isFinite(factId)) {
      return res.status(400).json({ error: 'factId must be a number' });
    }
    const fact = this.ctx.semanticMemory.getFact(factId);
    if (!fact) {
      return res.status(404).json({ error: `no fact ${factId}` });
    }
    // A told fact points at the memory it was extracted from. That row is the whole
    // answer to "who told her that" and it may since have been pruned, hence the guard.
    let provenance;
    if (fact.provenanceMemoryId) {
      try {
        provenance = this.ctx.memoryRepository.getMemory({ id: fact.provenanceMemoryId });
      } catch {
        provenance = undefined;
      }
    }
    const supersedes = this.ctx.semanticMemory
      .getHistory(fact.subjectSimId)
      .filter((other) => other.supersededBy === factId);
    const supersededBy = fact.supersededBy ? this.ctx.semanticMemory.getFact(fact.supersededBy) : undefined;
    const names = this.nameMap([
      fact.subjectSimId,
      fact.objectSimId ?? '',
      ...supersedes.map((other) => other.objectSimId ?? ''),
    ]);
    return res.json({ fact, provenance, supersedes, supersededBy, names });
  };

  // POST /sims/:id/facts — a person or the bench asserting something directly
  @CatchErrors()
  addFact = (req: Request, res: Response) => {
    const simId = SimFactsController.param(req.params.id);
    const body = req.body as {
      predicate?: string;
      objectText?: string;
      objectSimId?: string;
      source?: string;
      confidence?: number;
      provenanceMemoryId?: string;
      day?: number;
    };
    if (!body.predicate) {
      return res.status(400).json({ error: 'predicate is required' });
    }
    if (!body.objectText && !body.objectSimId) {
      return res.status(400).json({ error: 'objectText or objectSimId is required' });
    }
    // `game` is reserved for the dossier. Letting a route assert it would put a claim
    // nothing can ever correct at the top of the trust ladder.
    const source = body.source ?? 'player';
    if (!isKnownSource(source) || source === 'game') {
      return res.status(400).json({ error: `source must be one of player, told, inferred, reflection` });
    }
    const id = this.ctx.semanticMemory.addFact({
      subjectSimId: simId,
      predicate: body.predicate,
      objectText: body.objectText,
      objectSimId: body.objectSimId,
      source,
      confidence: body.confidence,
      provenanceMemoryId: body.provenanceMemoryId,
      day: body.day ?? this.ctx.simStateCache.getReport()?.lot?.clock?.absolute_day,
    });
    if (id === undefined) {
      return res.status(409).json({ error: 'no save loaded' });
    }
    return res.json({ ok: true, id, fact: this.ctx.semanticMemory.getFact(id) });
  };

  // DELETE /sims/:id/facts/:factId — retire, never remove. The row stays as history.
  @CatchErrors()
  retireFact = (req: Request, res: Response) => {
    const factId = Number(SimFactsController.param(req.params.factId));
    if (!Number.isFinite(factId)) {
      return res.status(400).json({ error: 'factId must be a number' });
    }
    const fact = this.ctx.semanticMemory.getFact(factId);
    if (!fact) {
      return res.status(404).json({ error: `no fact ${factId}` });
    }
    this.ctx.semanticMemory.invalidateFact(factId, this.ctx.simStateCache.getReport()?.lot?.clock?.absolute_day);
    return res.json({ ok: true, retired: factId });
  };

  // GET /facts/predicates — the vocabulary, so the UI and the tools do not hardcode it
  @CatchErrors()
  getPredicates = (_req: Request, res: Response) => res.json({ predicates: Object.values(FactPredicate) });
}
