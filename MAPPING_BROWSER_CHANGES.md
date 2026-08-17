# Mapping Browser Changes

A record of the mapping browser improvements made in August 2026 on the `subtitles-playtest` branch: what was built, how it works, and why it was built that way.

---

## 1. Pie-menu-style display names

**Commit:** `8a402a8`

### What

Interactions in the mapping browser were listed and searchable only by their raw tuning ID (e.g. `mixer_social_PassionateKiss_targeted_romance_emotionSpecific`). Each interaction card now shows a human-readable title — "Passionate Kiss" — with the raw ID in small monospace beneath it, and the text filter matches either form. You can find a mapping by typing what you clicked in the in-game pie menu.

### How

- New utility [`src/main/sentient-sims/util/interactionDisplayName.ts`](src/main/sentient-sims/util/interactionDisplayName.ts) derives the name from the tuning ID:
  1. Split the ID on `_` and `:`.
  2. Drop known structural noise tokens (`mixer`, `social`, `targeted`, `STC`, `alwaysOn`, `emotionSpecific` — including the `emotionSpeficic` typo that exists in real tuning data — category tags like `friendly`/`mean`/`romance`, etc.).
  3. Split remaining camelCase tokens into words (`GetToKnow` → `Get To Know`) and title-case them.
  4. If stripping removes everything, fall back to the full prettified ID so the title is never blank.
- The browser computes `displayName` per mapping at load time and includes it in the name-ranked bucket of the text filter ([`OnlineMappingBrowser.tsx`](src/renderer/components/OnlineMappingBrowser.tsx)).
- Unit tests in [`src/__tests__/InteractionDisplayName.test.ts`](src/__tests__/InteractionDisplayName.test.ts).

### Why this approach

The *true* localized pie menu text lives in the game's string tables (STBL resources inside `.package` files). Neither the Electron app nor the mod's in-game Python can read those at runtime — the mod only sees a `LocalizedString` hash, and resolution happens in the game's UI layer. But EA's tuning IDs contain the same words as the pie menu labels, so a deterministic prettifier gets ~equivalent searchability with zero data dependencies, works offline, and applies uniformly to all 9,000+ interactions including mod content.

---

## 2. Semantic search

**Commit:** `8a402a8`

### What

A "Semantic search" toggle next to the filter box (interactions only). When on, the query is ranked by meaning — searching "smooching" finds kiss interactions — instead of exact substring match.

### How

- New service [`src/main/sentient-sims/services/InteractionSemanticSearchService.ts`](src/main/sentient-sims/services/InteractionSemanticSearchService.ts), wired into `ApiContext` and exposed at `GET /interactions/semantic-search?q=`.
- It reuses the app's existing `EmbeddingService` (OpenAI `text-embedding-3-small`, the same one memory retrieval uses), so there is no new provider dependency and it degrades gracefully to `{available: false}` without an API key — the UI then shows a message and falls back to text filtering.
- Each interaction is embedded as `displayName + tuning ID + description text`, so all three are semantically searchable.
- Embeddings are cached in `interaction_embeddings.json` in the Sentient Sims folder (base64-encoded `Float32Array` per entry, keyed by the exact text). Only the first search pays to index the catalog; later searches embed just the query. Entries re-embed automatically when a description changes, and entries for deleted interactions are pruned on save.
- Search: embed the query, cosine-similarity against the cached vectors, return the top 100 names. The renderer maps names back to loaded mappings, preserving score order.
- The renderer effect avoids the repo's `set-state-in-effect` lint rule by keying results to the query that produced them — `semanticLoading` and `semanticResults` are *derived* values, and an `AbortController` cancels stale requests.
- Tests in [`src/__tests__/InteractionSemanticSearch.test.ts`](src/__tests__/InteractionSemanticSearch.test.ts) use a fake deterministic embedding service and verify ranking, disk-cache reuse (a fresh service instance answers without re-embedding the catalog), and the no-key path.

### Why this approach

The infrastructure (OpenAI key handling, embedding service, cosine similarity) already existed for memory retrieval — reusing it kept the feature small. Disk caching matters because the catalog is ~4,600 embeddable descriptions: without it every app launch would cost a multi-second, multi-request indexing pass on first search.

---

## 3. Description cleanup sweep (data, not code)

**Not a commit** — a one-off data operation, with reports gitignored (`3315ff6`).

### What

Roughly a quarter of all mapped interaction descriptions were polluted with prompt-injection noise — `[AI: PLEASE SKIP describing the time of day...]` blocks, meta commentary about save files and "outputs", bracketed trait tags, and even character names leaked from other players' saves ("Tav", "Lae'zel", "Mattia Sartoris"). 4,623 descriptions were swept; **1,147 were pared down to just the in-world action text** and saved as local overrides. Reports: `interaction-cleanup-report.csv` / `-with-titles.csv` (gitignored).

### How

- All descriptions were fetched from the running app's `/interactions/all` and each was judged and cleaned by `gpt-4.1-mini` (temperature 0, JSON output, 16 concurrent requests).
- A pilot run on 12 known-tricky cases caught two failure modes before the full run, which became strict prompt rules: **never censor explicit adult content** (it is intentional in this mod ecosystem, not noise) and **never alter curly-brace template tokens**.
- Every proposed change passed mechanical validation: no leftover `[AI:` blocks, no lost `{actor}` tokens, no invented/mutated tokens (only bare `{actor.N}` insertions allowed, for leaked-name replacement), no length growth. 4 items failed validation and were left untouched, flagged "needs manual review" in the CSV.
- Cleaned versions were saved via `/interactions/save-locally` only — **nothing was pushed to the shared online database**. The overrides file was backed up first (`user_interaction_overrides.backup-20260805-213652.json`).
- A follow-up pass applied 11 manual corrections the user added in a `manual_change` column of the report spreadsheet.

### Why this approach

Regex stripping alone was provably wrong: the scan found false positives (in-world "please", second-person text describing an in-game website) and noise that no bracket-pattern catches (unbracketed directives, leaked save names). An LLM judge with deterministic validation guards gets the judgment right while making the failure modes mechanically impossible. Saving locally-only keeps the operation fully reversible per-interaction ("Remove Local Override") and defers the online-publish decision to a human.

---

## 4. Online-status chips

**Commit:** `80a767a`

### What

Pressing "Save Online" on a local override gave no visible feedback: the card kept saying "Local override" (correct — local outranks online) but nothing showed whether the shared copy now matched. Every local-override interaction card now carries a second chip:

- **Matches online** (green) — the shared mapping is identical; everyone sees your text.
- **Differs from online** (orange) — tooltip shows the text everyone else sees instead.
- **Not online** (grey) — no shared mapping exists; only you have this description.

The chip updates immediately when Save Online succeeds.

### Why it happened in the first place

`getBrowsableInteractions()` merges built-in → online → local with a last-write-wins map, so the shadowed online version was *discarded* before the UI ever saw it. The card literally could not know the relationship.

### How

- [`InteractionRepository.getBrowsableInteractions()`](src/main/sentient-sims/db/InteractionRepository.ts) now annotates entries with the versions they shadow instead of discarding them: a local-source entry carries `online` and `builtIn`, an online-source entry carries `builtIn` (`ShadowedVersion` type in [`InteractionDTO.ts`](src/main/sentient-sims/db/dto/InteractionDTO.ts)).
- The card compares its saved text/ignored state against the shadowed online version to pick a chip, and `handleSaveOnline` updates the tracked online version on success so the chip flips to "Matches online" without a refetch.

---

## 5. Tag filters

**Commit:** `80a767a`

### What

A "Filter by tag:" row of toggleable chips under the toolbar: source (`Built-in` / `Online` / `Local override`), online status (`Matches online` / `Differs from online` / `Not online`), and `Ignored`. Chips within a group are mutually exclusive; groups combine with AND; tag filters stack with both the text filter and semantic search. Animations show only the source group, since the other tags are interaction concepts.

This enables the review workflow the feature set was built for: select "Differs from online" and walk through exactly the overrides that haven't been published (or diverge from what's published).

### How

- `mappingTags()` computes each mapping's tags from load-time data (source, online-status comparison, ignored flag).
- `filteredMappings` filters by active tags first, then applies text/semantic filtering to the survivors, so all filter mechanisms compose.
- Group exclusivity is handled in `toggleTag()`: selecting a chip deselects its groupmates. This prevents impossible AND combinations (an item can't be both `Online` and `Local override`).

---

## 6. Compare-with-original panel

**Commit:** `80a767a`

### What

Any card whose text shadows other versions has a "Compare with … version(s)" expander under the editor. It shows the shadowed online and/or built-in text read-only, each with either a "Same as editor" badge or a **Copy into editor** button. Intended flow: before publishing a local override online, expand, read the original, and if the original was better, copy it into the editor and save that instead.

### How

Pure UI over the `ShadowedVersion` data from change #4 — a `Collapse` listing each shadowed version; "Copy into editor" just sets the editor state, which marks the card "Unsaved changes" and leaves the save decision (locally/online) to the user. Works on online-source cards too, comparing against the built-in original.

---

## 7. In-place Remove Local Override (no more losing your place)

**Uncommitted at time of writing.**

### What

"Remove Local Override" (and "Delete Online") previously triggered a full reload of all mappings, wiping the current search, filters, page, and scroll position. Both now update the card in place:

- Override removed → card morphs into the online version (chip flips to "Online", editor shows the shared text), or the built-in version if no online exists.
- Nothing left underneath → the card stays put with a red **Removed** chip; "Save Locally" recreates it.
- The snackbar states which outcome occurred.

### How

The reload existed only because the card didn't know what it would fall back to. After change #4 it does — `fallBackTo()` swaps the card's source/text/ignored state to the shadowed version locally, no refetch. The parent list is deliberately *not* re-filtered mid-pass so cards don't vanish under the cursor; tag filters reflect new states on the next Load Interactions. Animations keep the old reload behavior because they don't carry shadowed-version data.

---

## Verification

Every commit passed `tsc --noEmit`, ESLint, and the Vitest suite (run through Electron's Node for the better-sqlite3 ABI). New tests cover display-name derivation, semantic ranking + cache reuse + no-key fallback, and the shadowed-version merge. Two pre-existing environment-dependent test failures are unrelated: `Api.test.ts` (needs AWS credentials) and one `MemoryIndex` test (assumes no `OPENAI_KEY` env var; passes with the key unset).
