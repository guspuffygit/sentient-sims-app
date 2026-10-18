# CLAUDE.md

Sentient Sims App is an Electron desktop companion app for the Sentient Sims mod for The Sims 4.
It acts as a secure proxy between the game and various AI APIs (OpenAI, Gemini, KoboldAI, NovelAI, VLLM, and a custom Sentient Sims AI service).
It also manages game state, saves, memories, locations, and participants via a local SQLite database.

Commands:
  npm run start       Dev mode (electron-vite dev: renderer HMR + main/preload rebuild + Electron)
  npm run build       Production build (main + preload + renderer via electron-vite)
  AWS_PROFILE=sentientsims npm run check Run all the compile, integration/unit tests, and eslint. Run this after each change to verify

Single test: edit the filename filter in test:single or run directly (Vitest takes a substring filename filter):
  cross-env NODE_ENV=test ELECTRON_RUN_AS_NODE=true ./node_modules/.bin/electron ./node_modules/.bin/vitest run YourTest

Tests run through Electron's Node runtime (ELECTRON_RUN_AS_NODE=true) with Vitest (config in vitest.config.ts,
setup in vitest.setup.ts). This is required because the native better-sqlite3 addon is built for Electron's ABI,
not system Node's. Vitest runs files serially (fileParallelism: false) to avoid Express port collisions.
Integration tests (.it.test.ts) require OPENAI_KEY env var; the AWS-backed tests in Api.test.ts need AWS_PROFILE=sentientsims.

Build tiers (release 4.5): this tree is the CORE build, one of three the same codebase produces (core
= the public release; a stream build and the loose dev tree add layers this tree does not carry).
tiers.json lists the paths those layers would add. Core code reaches layer code ONLY through
src/main/sentient-sims/tiers/: the ApiContext.ext capability slots and the TierRegistration hooks
(construct, routes, ipc, start, onSettingChanged, onDatabaseLoaded, onSceneClosed, onModMessage,
onMemoryUpserted, shutdown), every slot empty here (CoreWithoutTiers.test.ts). The renderer asks
src/renderer/tiers/merge.ts for tier routes, nav, settings tabs/rows. tiers/index.ts and renderer
tiers/index.tsx are GENERATED (scripts/gen-tier-index.ts --tier core; Tiers.test.ts pins them); src/
never imports tiers.json. IPC a layer adds goes through tierInvoke/tierOn over interfaces the layer's
own file augments (tiers/ipc.ts). `bash scripts/strip-check.sh core` re-checks the tree (worktree of
HEAD: strip, tsc, unit tests, electron-vite build, scripts/verify-build.ts reads the source maps and
the tier stamp); it skips Api.test.ts, whose update and interaction tests need AWS and OpenAI
credentials (test.yml runs them with secrets). The 4.1.0 cognition plumbing (CognitionController,
ActionDispatcherService, ActionIntent, formatPerception and the /cognition/* routes in api.ts) is
core; a layer may hand core subclass instances through ctx.ext.cognitionController /
ctx.ext.actionDispatcher, so those routes serve them without being bound twice.

Architecture:

  Main process (src/main/main.ts) creates the BrowserWindow, starts an Express HTTP server on port 25148 (tests use 25198), and sets up WebSocket servers (mod 25145, renderer 25146). The Sims 4 mod communicates with this Express API.
  Renderer process (src/renderer/) is a React 19 UI with MUI components, React Router, and TanStack Query. Communicates with main via IPC and the local Express API.
  Preload (src/main/preload.ts) bridges renderer to main process via contextBridge.

Backend (src/main/sentient-sims/):

  ApiContext (services/ApiContext.ts) is the central dependency injection container. It instantiates all services, repositories, and controllers. Most classes receive ApiContext in their constructor.

  controllers/ - Express route handlers, registered in api.ts
  services/   - Business logic:
    AIService                   - Orchestrates AI generation across providers, resolving a provider config per AIActionType
    GenerationService           - Interface implemented by each AI provider
    ProviderConfigService       - Resolves named provider configs (AIProviderConfig: provider + model) with a default config and per-action overrides; legacy aiApiType stays two-way synced with the default config via SettingsService hooks
    PromptRequestBuilderService - Builds prompts from game state, memories, interaction context
    PlayerConversationService   - The thread between the player (chat window, voice persona) and a sim: each reply sees the exchange so far, and the thread closes when the sim has said their piece, on idle, or when the game stops the scene
    SettingsService             - Persists user settings via electron-store
    DirectoryService            - Manages Sims 4 mod/save file paths
    DbService                   - SQLite database via better-sqlite3
  db/         - Data access layer over SQLite (Repository base class, LocationRepository, MemoryRepository, ParticipantRepository, InteractionRepository)
  models/     - TypeScript types/interfaces. ApiType enum defines supported AI backends.
  tokens/     - Token counting implementations per AI provider

Frontend (src/renderer/):
  App.tsx      - Main router with pages (Home, Settings, Memories, Locations, Sims, Chat, Logs, etc.)
  hooks/       - React Query hooks for data fetching
  clients/     - HTTP client wrappers (at src/main/sentient-sims/clients/) for the local Express API
  providers/   - React context providers
  settings/    - Settings UI components

Player-facing replies (2026-09-21): a directed scene driven by a playerLine (chat window, voice/conscience)
is `playerFacing` in AIService.runDirectedGeneration — full-length straight answers (pipeline/prompts/scene.ts
playerFacing branch, playerReplyMaxTokens), the sim's live <STATUS>/<TODAYS_PLAN> block (util/formatSelfStatus)
and the conversation thread as context (PlayerConversationService). The scorer's action verdict is offered to
a layer through ctx.ext (actOnConversation); with no layer it is dropped. Long replies air in sentence chunks
(util/airingChunks, `continues` on DialogueLine → 150 ms gap, mouth stays open in the mod). Sim-to-sim scenes
keep the short-line rules.

Pets, babies and infants can be kept quiet (2026-10-15): setting nonControllableSimsSpeak (default true, checkbox
on the Settings page next to Directed Scenes). Off, util/speechCapability.canSpeak says no for a pet (event is_pet, the
report's self.species or the fact store - a Twitch ask is built as a human adult, so the report outranks the event) and
for BABY/INFANT (lifeStageOf, else the event age); toddlers up, occults and ghosts always speak, unknown fails open. In
runDirectedGeneration a silent performer still gets a director briefing (silentNames), an actor turn in the THINK-only
format, a score and a monologue row; no line of theirs airs, the reviewer no longer demands both voices (speakerNames),
and a cast with no speaker runs finishMonologueScene with aloud=false - stored "(thinking)" rows, no "(to self)" TTS. A
player line to a silenced sim gets a thought back and opens no PlayerConversation thread. The classic narrator path adds
one system-prompt clause and drops the sim's lines from paced playback; wants of a silenced sim are generated unvoiced.
The mod sends everything already (is_pet, age, report species); nothing changes there.

Lot descriptions (2026-10-15 to 2026-10-18): every scene prompt carries one LOCATION line, `{name} ({type}),
{description}`. The shipped defaults (descriptions/locationDescriptions.ts, 181 lots + 2 stock; lots that ship empty,
every Newcrest lot included, have none, and a player's own builds never belong there) are in the CARD shape: 3-4
present-tense sentences, what kind of place and where, then the real things in it, nobody in the text. The shape won a
360-scene blind-judged experiment against stock/minimal/long/flowery/key-value (harness
src/__tests__/LotFormatExperiment.test.ts, gated on LOT_FORMAT_EXPERIMENT); the stock "suburban residence" placeholder
was the worst of all, so an undescribed lot costs more than any shape choice. BuiltInDescriptions.test.ts holds every
built-in to util/lotDescription.placeDescriptionProblems (1-4 sentences, "Mt." and "!" inside a name are not sentence
ends, no person, no moment) and a no-people scrub; edit the file directly.

"Auto-Generate Description" on the Locations page: POST /locations/:id/describe (LocationsController.describeLocation
-> DefaultDescriptionService.describeLocation, the same facts and writer as the fire-and-forget fallback) returns
{description, versions, facts, lotType} and stores nothing (the page fills Lot Type when it is empty or the Residence
placeholder); 409 until the lot has been reported this app run (SimStateCache.getLotBlock keeps every reported lot
block by lot id). A press writes THREE drafts in parallel, each through the gate, and `versions` holds them in
util/lotDescription.orderDrafts order (first-try passes before retries, then the card closest to four sentences;
description is versions[0]); a "Draft 1 of 3" stepper under the Description field swaps them and asks before
dropping an edit. There is NO ranking call: in LotTraitExperiment's rank mode (14 lots, 3 judged drafts each) a
llama-3.3-70b ranker matched a sonnet-4.5 blind judge's top pick 36% / 50% depending on the order shown vs 43% for the
first draft, and the judge agreed with its own other-order pick on only 50% of lots - the drafts are near-equal, so the
player chooses. The fallback writer asks for one draft. The button's calls are runOneShot `interactive`: logged, but
outside provider health (AIExchangeLogService LabelContext.health), so failed presses never raise the in-game
"provider has failed" toast. Provider errors reach the player in plain words (util/providerErrorWords
.plainProviderError: the editor's message, with "Open Settings" when the fix is there, the health chip and the mod
toast); the raw text stays in main.log. Gemini thinking counts against maxOutputTokens (a 220-token description spent
209 thinking), so GeminiService sends thinkingBudget 0, else thinkingLevel LOW, else nothing, the last two with 1024
tokens of headroom, and remembers per model which one it accepted. Publishing refuses text naming a sim in the save
(findSavedNames); everyday words a townie is called (savedNames COMMON_WORDS: story, blue, white, house, street,
bright, someone) only count inside a full name. The button names the lot by the app's name, not the in-game one, so a
rename made in game never leaks into a shared default; names are saved and published trimmed.

The facts the writer sees come from the mod's lot block: the zone record's `description` (EA blurb), `bedrooms`,
`bathrooms`, `lot_traits` and `lot_challenges` (zone modifiers; mod builds from 2026-10-17), `world_name`, `street`,
`furnishings` (every object tuning name on the lot), `floor_furnishings`, `music` (StereoChannel_* stereo states),
`venue_type` (the lot type set in Manage Worlds, preferred over the active venue: Ward Park's active venue is
venue_Generic) and `rooms` (level, the game's room id from build_buy.get_room_id, 0 outdoors, tuning name -> count;
capped at 40 rooms x 60 kinds). util/lotRooms names each room from what is in it (a bed makes a bedroom whatever else
is there; appliances a kitchen, with sofa + TV an open-plan kitchen and living room; a pool outranks lockers; a toilet
a bathroom at home and a restroom at a venue; a venue's lone shower stall a shower room; desk + computer a study; 3+
bookshelves a library; machines a home gym / workout room), hides what the name already says, merges a level's
outdoor groups into "outside: ...", shows an undefined room as "a room with ..." only when it holds 2+ kinds, collapses
same-name rooms ("two bedrooms, one with a desk"), reads kitchen and living room first and bathrooms last, and leaves a
bare bathroom out at a home. Paintings and sculptures are home decor: never listed at a home, kept at a venue. lotFacts
writes one line per room floor, or a single "Rooms:" line on a one-story lot; a lot with no named room keeps
"Furnished with:" (util/lotFurnishings plain words: kinds, never counts, singular or plural by count; a venue keeps
its showers and restrooms, a home does not; names no rule knows are logged as "furnishings with no plain words", and
furnishingWords takes an overrides map that wins over FURNISHING_WORDS by exact name). util/lotFurnishings.roomFloors
counts a level only with 2+ real furnishing kinds, and one story is never mentioned. The place is named by
descriptions/lotNeighborhoods.ts (lot id -> neighborhood + world), else the reported world (the Locations page's
Neighborhood column; LocationEntity.neighborhood). Lot types read as Manage Worlds names them (util/lotDescription
VENUES + VENUE_PATTERNS: Café, National Park for venue_ForestPark, Recreation Center...), except homes, which read
Residence / Haunted House Residence / Tiny Home Residence, so a home's lot type never changes. Lot traits:
util/lotTraitWords maps the tuning name (prefixes, creator, WickedWhims plumbing and pro/con/PetWorld category words
stripped) to the Build mode panel name and a short clause (FreshAir = "Bracing Breezes (oodles of fresh air, bracing
for exercise)", BurglarTime = Heist Havoc, CelebrityHangOut_LowFame = Up-and-Coming Hotspot; names from the Sims wiki
"Lot traits and challenges" page); an unknown name falls back to its tuning words. The facts line is `Lot traits: Name
(clause), ...; lot challenges: Heist Havoc (clause)`, and the clause says what the place is like, never a mechanic (the
prompt lets a trait colour the last sentence lightly and forbids explaining a game rule). Harness
src/__tests__/LotTraitExperiment.test.ts (gated on LOT_TRAIT_EXPERIMENT=dry|live|rank), 15 lots x none / names / names
with clause on llama-3.3-70b, 45 runs each: the trait's character reached the card 51% / 98% / 100% of the time, a
game rule was explained 0 / 0 / 2%. The writer goes floor by floor and ends on what the place is like and who it is
for: in a 160-scene test no reply named a furnishing, but a place's character ("only celebrities get in") did carry
into dialogue. Tests: LotDescription, LotRooms, LotFurnishings, LotTraitWords, BuiltInDescriptions,
DefaultDescription, LocationsDescribe.

Mod log lines (2026-09-22): every `log` message from the mod is appended to Mods/sentient-sims/logs.txt under
modsDirectory (util/format formatLog, timestamps in UTC) and, at INFO and above, mirrored into electron-log's
main.log as `[Mod] <LEVEL> <message>` (util/modLogMirror), so the mod's game-thread stall watchdog lines
(`game thread stall: ...`, `game thread slow ...`) sit next to [Scene]/PUSHDIAG with local timestamps. DEBUG never
reaches main.log. Test: ModLogMirror.test.ts.

IPC: ipcHandlers.ts registers Electron IPC handlers (dialog, settings, clipboard, navigation). Renderer uses window.electron.ipcRenderer for direct main process calls, and HTTP clients for Express API calls.

Build: electron-vite (config at electron.vite.config.ts) builds main/preload/renderer to release/app/dist/{main,preload,renderer}/. All node_modules deps are bundled (build.externalizeDeps: false); only native modules from release/app/package.json (better-sqlite3) stay external. Packaging via electron-builder (Windows NSIS, macOS DMG, Linux AppImage).

Native modules: the root `rebuild` script (run by `postinstall`) rebuilds for Electron's ABI only the modules named in its
`--only` list, currently better-sqlite3. A new native dependency that needs an Electron rebuild must be added to that list
by hand, or it silently keeps the system Node ABI and fails to load. There is no global keyboard hook dependency: the
voice hotkey is heard by the game overlay and relayed by the mod (`voice_hotkeys` / `voice_key` websocket messages).

Signing/notarization secrets (macOS packaging): the Developer ID cert arrives as base64 in APPLE_P12_BASE64 (password APPLE_P12_PASSWORD); notarization uses APPLE_ID/APPLE_ID_PASS/APPLE_TEAM_ID, and electron-builder reads CSC_LINK/CSC_KEY_PASSWORD. NEVER print these — no env, env | grep, echo, or cat of the .p12. Decode the cert straight to a gitignored file (printf '%s' "$APPLE_P12_BASE64" | base64 -d > certificate.p12) and reference everything by variable name only. See the "Never expose secrets" rule in the global CLAUDE.md.

Code conventions:
  TypeScript strict mode throughout
  Prettier: single quotes, trailing commas, 120 char print width
  Tests in src/__tests__/, named *.test.ts (unit) or *.it.test.ts (integration)
  ESM modules ("type": "module" in package.json)

64-bit game ids (sims, memories, participants): the game uses ids bigger than JavaScript numbers can
hold exactly, so treat every id as an opaque string everywhere — JSON, websocket, IPC, renderer, and
entity types. Only the SQLite layer touches the real integer: read INTEGER id columns with
.safeIntegers() and convert to string with .toString(), and bind ids in queries with BigInt(id).
Never pass an id through Number() or parseInt — it silently rounds and the id stops matching.
