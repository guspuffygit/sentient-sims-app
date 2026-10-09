import { Repository } from './Repository';
import { FactSource } from '../pipeline/facts/predicates';

// One claim about one sim. `objectSimId` set makes it an edge; `validToDay` set makes it
// history rather than current belief.
export type SimFactRecord = {
  id?: number;
  subjectSimId: string;
  predicate: string;
  objectText?: string;
  objectSimId?: string;
  source: FactSource;
  confidence: number;
  validFromDay?: number;
  validToDay?: number;
  provenanceMemoryId?: string;
  supersededBy?: number;
  createdAt?: string;
};

type SimFactRow = {
  id: number;
  subject_sim_id: string;
  predicate: string;
  object_text: string | null;
  object_sim_id: string | null;
  source: string;
  confidence: number;
  valid_from_day: number | null;
  valid_to_day: number | null;
  provenance_memory_id: string | null;
  superseded_by: number | null;
  created_at: string;
};

export type SimDossierRecord = {
  simId: string;
  json: string;
  updatedDay?: number;
  updatedAt: string;
};

type SimDossierRow = {
  sim_id: string;
  json: string;
  updated_day: number | null;
  updated_at: string;
};

function toRecord(row: SimFactRow): SimFactRecord {
  return {
    id: row.id,
    subjectSimId: row.subject_sim_id,
    predicate: row.predicate,
    objectText: row.object_text ?? undefined,
    objectSimId: row.object_sim_id ?? undefined,
    source: row.source as FactSource,
    confidence: row.confidence,
    validFromDay: row.valid_from_day ?? undefined,
    validToDay: row.valid_to_day ?? undefined,
    provenanceMemoryId: row.provenance_memory_id ?? undefined,
    supersededBy: row.superseded_by ?? undefined,
    createdAt: row.created_at,
  };
}

/**
 * The semantic fact store (Phase 3.1 H2). Bi-temporal and invalidate-never-delete: a fact
 * that stops being true keeps its row and gains a valid_to_day, because "she used to be
 * married to him" is worth knowing and because a deleted row cannot explain a belief.
 *
 * Every method here is mechanical. The trust rules (a told fact may never retire a game
 * fact) live one layer up in SemanticMemoryService — this class does what it is told.
 */
export class SimFactRepository extends Repository {
  isLoaded(): boolean {
    return this.dbService.isLoaded();
  }

  insert(record: SimFactRecord): number {
    const result = this.dbService
      .getDb()
      .prepare(
        `INSERT INTO sim_fact(subject_sim_id, predicate, object_text, object_sim_id, source, confidence,
                              valid_from_day, valid_to_day, provenance_memory_id, superseded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run([
        record.subjectSimId,
        record.predicate,
        record.objectText ?? null,
        record.objectSimId ?? null,
        record.source,
        record.confidence,
        record.validFromDay ?? null,
        record.validToDay ?? null,
        record.provenanceMemoryId ?? null,
        record.supersededBy ?? null,
        record.createdAt ?? new Date().toISOString(),
      ]);
    return Number(result.lastInsertRowid);
  }

  getFact(id: number): SimFactRecord | undefined {
    const row = this.dbService.getDb().prepare('SELECT * FROM sim_fact WHERE id = ?').get([id]) as
      | SimFactRow
      | undefined;
    return row ? toRecord(row) : undefined;
  }

  // Current beliefs only (valid_to_day IS NULL). `about` narrows to one relationship.
  getCurrentFacts(subjectSimId: string, options: { about?: string; predicate?: string } = {}): SimFactRecord[] {
    const clauses = ['subject_sim_id = ?', 'valid_to_day IS NULL'];
    const parameters: (string | number)[] = [subjectSimId];
    if (options.about) {
      clauses.push('object_sim_id = ?');
      parameters.push(options.about);
    }
    if (options.predicate) {
      clauses.push('predicate = ?');
      parameters.push(options.predicate);
    }
    const rows = this.dbService
      .getDb()
      .prepare(`SELECT * FROM sim_fact WHERE ${clauses.join(' AND ')} ORDER BY id ASC`)
      .all(parameters) as SimFactRow[];
    return rows.map(toRecord);
  }

  // Everything ever believed about this sim, retired rows included — the Facts dialog and
  // the explain route both need the history, not just what is true now.
  getHistory(subjectSimId: string): SimFactRecord[] {
    const rows = this.dbService
      .getDb()
      .prepare('SELECT * FROM sim_fact WHERE subject_sim_id = ? ORDER BY id DESC')
      .all([subjectSimId]) as SimFactRow[];
    return rows.map(toRecord);
  }

  // Edges in either direction: "what is the relationship between these two".
  getEdgesBetween(simA: string, simB: string): SimFactRecord[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `SELECT * FROM sim_fact
         WHERE valid_to_day IS NULL
           AND ((subject_sim_id = ? AND object_sim_id = ?) OR (subject_sim_id = ? AND object_sim_id = ?))
         ORDER BY id ASC`,
      )
      .all([simA, simB, simB, simA]) as SimFactRow[];
    return rows.map(toRecord);
  }

  // Facts where this sim is the OBJECT — "who claims to be related to her".
  getFactsMentioning(simId: string): SimFactRecord[] {
    const rows = this.dbService
      .getDb()
      .prepare('SELECT * FROM sim_fact WHERE object_sim_id = ? AND valid_to_day IS NULL ORDER BY id ASC')
      .all([simId]) as SimFactRow[];
    return rows.map(toRecord);
  }

  // Recently learned hearsay, newest first: the "someone told me" section of <KNOWN_FACTS>.
  getRecentTold(subjectSimId: string, limit = 5): SimFactRecord[] {
    const rows = this.dbService
      .getDb()
      .prepare(
        `SELECT * FROM sim_fact
         WHERE subject_sim_id = ? AND valid_to_day IS NULL AND source IN ('told', 'inferred')
         ORDER BY id DESC LIMIT ?`,
      )
      .all([subjectSimId, limit]) as SimFactRow[];
    return rows.map(toRecord);
  }

  // Current facts that make the same KIND of claim as this one, so the caller can decide
  // whether the new fact retires them. Matching is on the subject and predicate; the
  // caller compares objects, because "spouse = Bob" contradicts "spouse = Alice" while
  // "trait = Geek" does not contradict "trait = Outgoing".
  findContradicting(subjectSimId: string, predicate: string): SimFactRecord[] {
    return this.getCurrentFacts(subjectSimId, { predicate });
  }

  // Retire a fact as of `day`. The row stays; this is the whole invalidate-never-delete
  // contract. A NULL day still retires it (an undated save), so the read path stays simple.
  invalidate(id: number, day?: number, supersededBy?: number) {
    this.dbService
      .getDb()
      .prepare('UPDATE sim_fact SET valid_to_day = ?, superseded_by = ? WHERE id = ? AND valid_to_day IS NULL')
      .run([day ?? -1, supersededBy ?? null, id]);
  }

  /**
   * Shortest chain of current edges from a to b, up to maxHops. The walk is breadth-first
   * and expands each sim once, so the edge count bounds its cost whatever maxHops is.
   * Returns the edge rows along the path, nearest hop first, or [] if unreachable.
   */
  pathBetween(simA: string, simB: string, maxHops = 2): SimFactRecord[] {
    if (simA === simB) {
      return [];
    }
    const edgesOf = this.dbService.getDb().prepare(
      `SELECT * FROM sim_fact
       WHERE valid_to_day IS NULL
         AND object_sim_id IS NOT NULL
         AND (subject_sim_id = ? OR object_sim_id = ?)
       ORDER BY id ASC`,
    );
    const reachedBy = new Map<string, { edge: SimFactRow; from: string }>();
    let frontier = [simA];
    for (let depth = 0; depth < maxHops && frontier.length > 0 && !reachedBy.has(simB); depth += 1) {
      const next: string[] = [];
      for (const sim of frontier) {
        for (const edge of edgesOf.all([sim, sim]) as SimFactRow[]) {
          const other = edge.subject_sim_id === sim ? edge.object_sim_id : edge.subject_sim_id;
          if (other && other !== simA && !reachedBy.has(other)) {
            reachedBy.set(other, { edge, from: sim });
            next.push(other);
          }
        }
      }
      frontier = next;
    }
    const path: SimFactRecord[] = [];
    for (let step = reachedBy.get(simB); step; step = reachedBy.get(step.from)) {
      path.unshift(toRecord(step.edge));
    }
    return path;
  }

  // Nothing reads sim_dossier.hash. The column is NOT NULL, so it is written empty.
  saveDossier(record: SimDossierRecord) {
    this.dbService
      .getDb()
      .prepare(
        `INSERT OR REPLACE INTO sim_dossier(sim_id, hash, json, updated_day, updated_at)
         VALUES (?, '', ?, ?, ?)`,
      )
      .run([record.simId, record.json, record.updatedDay ?? null, record.updatedAt]);
  }

  getDossier(simId: string): SimDossierRecord | undefined {
    const row = this.dbService.getDb().prepare('SELECT * FROM sim_dossier WHERE sim_id = ?').get([simId]) as
      | SimDossierRow
      | undefined;
    if (!row) {
      return undefined;
    }
    return {
      simId: row.sim_id,
      json: row.json,
      updatedDay: row.updated_day ?? undefined,
      updatedAt: row.updated_at,
    };
  }

  count(): number {
    const row = this.dbService.getDb().prepare('SELECT COUNT(*) AS total FROM sim_fact').get() as { total: number };
    return row.total;
  }
}
