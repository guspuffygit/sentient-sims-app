/**
 * One-time migration: fill in retrieval metadata (memory_index) for a save's existing memories.
 *
 * The in-app backfill (MemoryAnnotationService.backfill) only ever computes EMBEDDINGS for
 * historical memories — it assigns importance from the cheap event-type heuristic, because
 * rating a whole backlog with an LLM on the request path would be absurd. That leaves every
 * pre-existing memory at a flat 8/5/2/3 by event type, so importance contributes almost
 * nothing to retrieval ranking on an old save.
 *
 * This script closes that gap offline: it rates every historical memory with gpt-4.1-nano
 * using the exact prompt and parser the live path uses, embeds them with the same model the
 * app expects, and writes both into memory_index.
 *
 * Run with the app CLOSED and the game not running. better-sqlite3 is built for Electron's
 * ABI, so this must run under Electron's Node, not system Node:
 *
 *   ELECTRON_RUN_AS_NODE=true ./node_modules/.bin/electron scripts/backfill-memory-index.cjs \
 *     --dir "$HOME/Documents/Electronic Arts/The Sims 4/Mods/sentient-sims" --dry-run
 *
 * or via npm:  npm run backfill-memories -- --dir "<mods>/sentient-sims" --dry-run
 */

const fs = require('fs');
const path = require('path');

// The root node_modules copy of better-sqlite3 is built for system Node's ABI; the copy
// under release/app is the one electron-builder rebuilt against Electron's. Running under
// ELECTRON_RUN_AS_NODE means we need the latter, so prefer it and fall back to the plain
// resolution for anyone running this on a machine where only one build exists.
function loadDatabaseConstructor() {
  const electronAbiCopy = path.join(__dirname, '..', 'release', 'app', 'node_modules', 'better-sqlite3');
  try {
    return require(electronAbiCopy);
  } catch {
    return require('better-sqlite3');
  }
}

const Database = loadDatabaseConstructor();

// ---------------------------------------------------------------------------
// Constants mirrored from the app. These MUST stay in sync — see the notes.
// ---------------------------------------------------------------------------

// src/main/sentient-sims/services/EmbeddingService.ts (OPENAI_EMBEDDING_MODEL).
// MemoryRetrievalService cosine-compares stored vectors against a fresh query vector
// WITHOUT checking embedding_model, so writing a different model here would silently
// produce meaningless similarity scores at retrieval time.
const EMBEDDING_MODEL = 'text-embedding-3-small';

// src/main/sentient-sims/services/MemoryAnnotationService.ts (IMPORTANCE_SYSTEM_PROMPT).
const IMPORTANCE_SYSTEM_PROMPT = `You rate how memorable a life event is for the character who experienced it.
1 means mundane and forgettable (routine chores, small talk), 10 means life-changing (a breakup, a birth, a betrayal).
Respond with only a single integer from 1 to 10, nothing else.`;

// src/main/sentient-sims/services/MemoryAnnotationService.ts (IMPORTANCE_BY_EVENT_TYPE).
const IMPORTANCE_BY_EVENT_TYPE = { reflection: 8, outcome: 5, thought: 2 };
const DEFAULT_IMPORTANCE = 3;

// src/main/sentient-sims/db/migrations.ts — DDL copied verbatim. If this script creates the
// table it must also record the migration name, or the app's migrate() will later try to
// CREATE TABLE again, throw, and fail the whole save load.
const MEMORY_INDEX_MIGRATION = '012-create-memory-index';
const MEMORY_INDEX_DDL = `
      CREATE TABLE memory_index (
        memory_id            INTEGER NOT NULL  PRIMARY KEY  ,
        importance           INTEGER  ,
        embedding            BLOB     ,
        embedding_model      TEXT     ,
        FOREIGN KEY ( memory_id ) REFERENCES memory( id ) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

const IMPORTANCE_MODEL_DEFAULT = 'gpt-4.1-nano-2025-04-14';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Rough USD per 1M tokens, for the --dry-run estimate only. Verify against current
// OpenAI pricing before trusting the number.
const PRICING = {
  embedding: 0.02,
  importanceInput: 0.1,
  importanceOutput: 0.4,
};

const EMBED_BATCH_SIZE = 100;
const RATE_CONCURRENCY_DEFAULT = 8;
const MAX_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Shared helpers (mirrored from MemoryAnnotationService)
// ---------------------------------------------------------------------------

function heuristicImportance(eventType) {
  if (eventType && eventType in IMPORTANCE_BY_EVENT_TYPE) {
    return IMPORTANCE_BY_EVENT_TYPE[eventType];
  }
  return DEFAULT_IMPORTANCE;
}

function parseImportance(text) {
  const match = /\b(10|[1-9])\b/.exec(text);
  return match ? Number(match[1]) : undefined;
}

function memoryText(row) {
  return row.observation || row.content || '';
}

function embeddingToBuffer(embedding) {
  return Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength);
}

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = {
    dbs: [],
    dryRun: false,
    force: false,
    skipBackup: false,
    limit: Infinity,
    concurrency: RATE_CONCURRENCY_DEFAULT,
    importanceModel: IMPORTANCE_MODEL_DEFAULT,
    embeddingsOnly: false,
    importanceOnly: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) {
        throw new Error(`${arg} requires a value`);
      }
      return argv[i];
    };

    switch (arg) {
      case '--db':
        options.dbs.push(path.resolve(next()));
        break;
      case '--dir': {
        const dir = path.resolve(next());
        const found = fs
          .readdirSync(dir)
          .filter((file) => file.endsWith('-sentient-sims.db'))
          .map((file) => path.join(dir, file));
        if (found.length === 0) {
          throw new Error(`No *-sentient-sims.db files found in ${dir}`);
        }
        options.dbs.push(...found);
        break;
      }
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--no-backup':
        options.skipBackup = true;
        break;
      case '--limit':
        options.limit = Number(next());
        break;
      case '--concurrency':
        options.concurrency = Number(next());
        break;
      case '--importance-model':
        options.importanceModel = next();
        break;
      case '--embeddings-only':
        options.embeddingsOnly = true;
        break;
      case '--importance-only':
        options.importanceOnly = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

const USAGE = `
Backfill memory_index (importance + embeddings) for existing Sentient Sims saves.

  --db <path>              A *-sentient-sims.db to process (repeatable)
  --dir <path>             Process every *-sentient-sims.db in this folder
  --dry-run                Report counts and an estimated cost; no API calls, no writes
  --limit <n>              Only process the first n memories (trial runs)
  --concurrency <n>        Parallel importance calls (default ${RATE_CONCURRENCY_DEFAULT})
  --importance-model <id>  Default ${IMPORTANCE_MODEL_DEFAULT}
  --embeddings-only        Skip LLM rating (matches the in-app backfill)
  --importance-only        Skip embeddings
  --force                  Re-rate memories this script already rated
  --no-backup              Skip the automatic .bak copy (not recommended)

Requires OPENAI_KEY in the environment. Close the app and quit the game first.
`;

// ---------------------------------------------------------------------------
// OpenAI calls
// ---------------------------------------------------------------------------

async function openaiRequest(apiKey, endpoint, body) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(`${OPENAI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
    } catch (error) {
      // Network-level failure — retry
      lastError = error;
      await sleep(2 ** attempt * 500);
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    const detail = await response.text();
    lastError = new Error(`${endpoint} failed ${response.status}: ${detail.slice(0, 300)}`);
    lastError.status = response.status;

    // 4xx other than rate limiting will not fix itself
    if (response.status !== 429 && response.status < 500) {
      throw lastError;
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 500);
  }

  throw lastError;
}

async function embedBatch(apiKey, texts) {
  const json = await openaiRequest(apiKey, '/embeddings', { model: EMBEDDING_MODEL, input: texts });
  const byIndex = new Map(json.data.map((item) => [item.index, item.embedding]));
  return texts.map((_, index) => {
    const embedding = byIndex.get(index);
    return embedding ? Float32Array.from(embedding) : undefined;
  });
}

// Returns { rating, fromLlm }. A heuristic fallback is fine for the occasional malformed
// reply, but it must never masquerade as a real rating — the caller only records ids as
// done when fromLlm is true, so a fallback gets retried on the next run instead of
// permanently freezing a memory at its event-type prior.
async function rateImportance(apiKey, model, text, eventType) {
  try {
    const json = await openaiRequest(apiKey, '/chat/completions', {
      model,
      max_tokens: 8,
      temperature: 0,
      messages: [
        { role: 'system', content: IMPORTANCE_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    });
    const reply = json.choices?.[0]?.message?.content ?? '';
    const rating = parseImportance(reply);
    if (rating !== undefined) {
      return { rating, fromLlm: true };
    }
    console.warn(`  unparseable rating reply ${JSON.stringify(reply)}, using heuristic`);
  } catch (error) {
    // A bad key or a disabled account fails identically for every single memory. Quietly
    // heuristic-filling the whole backlog would look like success while producing exactly
    // the flat ratings this script exists to replace, so stop the run instead.
    if (error.status === 401 || error.status === 403) {
      throw new Error(`OpenAI rejected the API key (${error.status}). Fix OPENAI_KEY and rerun.`, { cause: error });
    }
    console.warn(`  rating failed (${error.message}), using heuristic`);
  }
  return { rating: heuristicImportance(eventType), fromLlm: false };
}

// Bounded worker pool: keeps `limit` requests in flight without pulling in a dependency.
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

function ensureMemoryIndexTable(db) {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS migrations (
       id INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
     );`,
  ).run();

  const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='memory_index'").get();
  if (exists) {
    return false;
  }

  // Table and migration bookkeeping in one transaction: recording the name is what stops
  // the app's migrate() from re-running the CREATE TABLE and failing the save load.
  db.transaction(() => {
    db.prepare(MEMORY_INDEX_DDL).run();
    const recorded = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(MEMORY_INDEX_MIGRATION);
    if (!recorded) {
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(MEMORY_INDEX_MIGRATION);
    }
  })();

  return true;
}

function progressPath(dbPath) {
  return `${dbPath}.backfill-progress.json`;
}

function loadProgress(dbPath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(progressPath(dbPath), 'utf8'));
    // Progress files written before ids became strings hold numbers; normalize
    return new Set((parsed.rated ?? []).map(String));
  } catch {
    return new Set();
  }
}

function saveProgress(dbPath, rated) {
  fs.writeFileSync(progressPath(dbPath), JSON.stringify({ rated: [...rated] }, null, 2));
}

// ---------------------------------------------------------------------------
// Main per-database routine
// ---------------------------------------------------------------------------

async function processDatabase(dbPath, options, apiKey) {
  console.log(`\n=== ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    console.error(`  missing, skipping`);
    return;
  }

  // These saves are in WAL mode, so merely opening one — even read-only — creates -wal and
  // -shm sidecars. Remember whether they were already there so we can clean up after
  // ourselves rather than leaving litter that looks like a crashed session.
  const walExisted = fs.existsSync(`${dbPath}-wal`);
  const shmExisted = fs.existsSync(`${dbPath}-shm`);

  if (!options.dryRun && !options.skipBackup) {
    const backup = `${dbPath}.bak`;
    fs.copyFileSync(dbPath, backup);
    console.log(`  backup written to ${path.basename(backup)}`);
  }

  const db = new Database(dbPath, { readonly: options.dryRun });
  try {
    if (!options.dryRun) {
      db.pragma('foreign_keys = ON');
      // The real "is anything else using this?" test. An open app or a running game holds
      // the write lock, and SQLITE_BUSY here is far more reliable than guessing from the
      // presence of a -wal file (which a plain read also creates).
      try {
        db.exec('BEGIN IMMEDIATE');
        db.exec('ROLLBACK');
      } catch (error) {
        console.error(`  locked by another process — close the app and quit the game, then rerun (${error.message})`);
        return;
      }
      if (ensureMemoryIndexTable(db)) {
        console.log(`  created memory_index and recorded ${MEMORY_INDEX_MIGRATION}`);
      }
    } else if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='memory_index'").get()) {
      console.log(`  memory_index does not exist yet (a real run would create it)`);
    }

    const hasIndexTable = Boolean(
      db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='memory_index'").get(),
    );

    // Memory ids are 64-bit game handles: read them with safeIntegers and carry them as
    // strings (the app's convention), else float64 rounding makes the upsert's EXISTS
    // guard silently skip every big-id row.
    const rows = db
      .prepare(
        hasIndexTable
          ? `SELECT memory.id, memory.observation, memory.content, memory.event_type,
                    memory_index.importance AS existing_importance,
                    memory_index.embedding AS existing_embedding,
                    memory_index.embedding_model AS existing_model
             FROM memory
             LEFT JOIN memory_index ON memory_index.memory_id = memory.id
             ORDER BY memory.id ASC`
          : `SELECT memory.id, memory.observation, memory.content, memory.event_type,
                    NULL AS existing_importance, NULL AS existing_embedding, NULL AS existing_model
             FROM memory ORDER BY memory.id ASC`,
      )
      .safeIntegers()
      .all()
      .map((row) => ({
        ...row,
        id: row.id.toString(),
        existing_importance: row.existing_importance === null ? null : Number(row.existing_importance),
      }));

    const textable = rows.filter((row) => memoryText(row)).slice(0, options.limit);
    const skippedBlank = rows.length - rows.filter((row) => memoryText(row)).length;

    const alreadyRated = loadProgress(dbPath);
    const needsRating = options.embeddingsOnly
      ? []
      : textable.filter((row) => options.force || !alreadyRated.has(row.id));
    const needsEmbedding = options.importanceOnly
      ? []
      : textable.filter((row) => !row.existing_embedding || row.existing_model !== EMBEDDING_MODEL);

    const ratingChars = needsRating.reduce((sum, row) => sum + memoryText(row).length, 0);
    const embeddingChars = needsEmbedding.reduce((sum, row) => sum + memoryText(row).length, 0);
    // ~4 chars per token is the usual English rule of thumb; good enough for an estimate.
    const ratingTokens = ratingChars / 4 + needsRating.length * 60;
    const embeddingTokens = embeddingChars / 4;
    const estimate =
      (embeddingTokens / 1e6) * PRICING.embedding +
      (ratingTokens / 1e6) * PRICING.importanceInput +
      ((needsRating.length * 2) / 1e6) * PRICING.importanceOutput;

    console.log(`  memories: ${rows.length} (${skippedBlank} with no text, skipped)`);
    console.log(`  need rating: ${needsRating.length}   need embedding: ${needsEmbedding.length}`);
    console.log(`  estimated cost: $${estimate.toFixed(4)} (verify against current OpenAI pricing)`);

    if (options.dryRun) {
      return;
    }
    if (needsRating.length === 0 && needsEmbedding.length === 0) {
      console.log('  nothing to do');
      return;
    }

    const ratings = new Map();
    const llmRated = new Set();
    const embeddings = new Map();

    if (needsRating.length > 0) {
      let done = 0;
      let fallbacks = 0;
      await mapWithConcurrency(needsRating, options.concurrency, async (row) => {
        const { rating, fromLlm } = await rateImportance(
          apiKey,
          options.importanceModel,
          memoryText(row),
          row.event_type,
        );
        ratings.set(row.id, rating);
        if (fromLlm) {
          llmRated.add(row.id);
        } else {
          fallbacks += 1;
        }
        done += 1;
        if (done % 25 === 0 || done === needsRating.length) {
          console.log(`  rated ${done}/${needsRating.length}`);
        }
      });
      if (fallbacks > 0) {
        console.warn(`  ${fallbacks} memories fell back to the heuristic — rerun to retry just those`);
      }
    }

    for (let start = 0; start < needsEmbedding.length; start += EMBED_BATCH_SIZE) {
      const batch = needsEmbedding.slice(start, start + EMBED_BATCH_SIZE);
      const vectors = await embedBatch(
        apiKey,
        batch.map((row) => memoryText(row)),
      );
      batch.forEach((row, index) => {
        if (vectors[index]) {
          embeddings.set(row.id, embeddingToBuffer(vectors[index]));
        }
      });
      console.log(`  embedded ${Math.min(start + EMBED_BATCH_SIZE, needsEmbedding.length)}/${needsEmbedding.length}`);
    }

    // Mirrors MemoryIndexRepository.upsertIndex, including the EXISTS guard.
    const upsert = db.prepare(
      `INSERT OR REPLACE INTO memory_index(memory_id, importance, embedding, embedding_model)
       SELECT ?, ?, ?, ?
       WHERE EXISTS (SELECT 1 FROM memory WHERE id = ?)`,
    );

    const touched = new Set([...ratings.keys(), ...embeddings.keys()]);
    const write = db.transaction(() => {
      touched.forEach((id) => {
        const row = textable.find((candidate) => candidate.id === id);
        const embedding = embeddings.get(id) ?? row.existing_embedding ?? null;
        const model = embeddings.has(id) ? EMBEDDING_MODEL : (row.existing_model ?? null);
        const importance = ratings.get(id) ?? row.existing_importance ?? heuristicImportance(row.event_type);
        upsert.run(BigInt(id), importance, embedding, model, BigInt(id));
      });
    });
    write();

    llmRated.forEach((id) => alreadyRated.add(id));
    saveProgress(dbPath, alreadyRated);

    console.log(
      `  wrote ${touched.size} rows (${llmRated.size} rated by ${options.importanceModel}, ${embeddings.size} embedded)`,
    );
  } finally {
    db.close();
    // close() checkpoints, so a 0-byte -wal has nothing left to replay and the pair is safe
    // to remove. If there is anything in the -wal, keep BOTH files — an orphaned -shm next
    // to a live -wal is worse than leaving the pair alone. Sidecars that predate this run
    // are never touched.
    const wal = `${dbPath}-wal`;
    const walIsEmpty = !fs.existsSync(wal) || fs.statSync(wal).size === 0;
    if (walIsEmpty) {
      [
        [wal, walExisted],
        [`${dbPath}-shm`, shmExisted],
      ].forEach(([sidecar, existedBefore]) => {
        if (existedBefore || !fs.existsSync(sidecar)) {
          return;
        }
        try {
          fs.rmSync(sidecar);
        } catch {
          // Leaving a sidecar behind is harmless; SQLite recreates it on next open
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || options.dbs.length === 0) {
    console.log(USAGE);
    process.exit(options.help ? 0 : 1);
  }

  const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey && !options.dryRun) {
    console.error('OPENAI_KEY is not set. Set it, or pass --dry-run to see counts and an estimate.');
    process.exit(1);
  }

  for (const dbPath of options.dbs) {
    await processDatabase(dbPath, options, apiKey);
  }

  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
