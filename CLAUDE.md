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

Pets and player notes in the facts store (2026-10-12): the dossier lists a pet as a bare household member id and
never says what it is, so the app learns species from the state report (self.species on a reported pet, species on a
perceived one) via SemanticMemoryService.recordSpeciesFromReport (wired in ApiContext.onReport): a `species` game fact
on the pet and a `pet` edge from every housemate whose dossier lists it; dossierToFacts derives the same edge on the
next ingest (speciesOf lookup) so the diff keeps it, and retires it when the pet leaves the household. renderKnownFacts
takes pets out of "you live with ..." and adds "your pet: Bosun the dog"; a present pet is labelled "Bosun (dog, he/him):
your dog". The `note` predicate is the player's free-text "always know" field (rendered verbatim right after the
household line); FACT_PREDICATE_HELP explains every predicate and is served by GET /facts/predicates for the Facts
dialog's tooltips. Tests: FactVocabulary, RenderKnownFacts, SemanticMemory, SimFactRoutes.
The store keeps the game's identifiers (trait_Pet_Glutton_Dog, trait_SimPreference_Likes_Activities_Cooking); util/factWords
says them in plain words ("Glutton (Dog)", "Cooking", "Hip Hop music", "Nanny", "Popularity") for BOTH the prompt and the
Facts dialog, so never prettify in one place only. A pet gets no HUMAN occult (dossierToFacts drops it when the species is
known; recordSpecies retires one already stored). PUT /sims/:id/facts/:factId rewords a non-game fact: new row, old row
retired with supersededBy (SemanticMemoryService.editFact); the dialog's Edit button on player facts uses it.
The dialog's layout is util/factGroups.groupFacts (pure, tested in FactGroups.test.ts): a summary line (age, gender,
species or occult, ghost, household, job, aspiration), then "Custom (Player Added)" first in the info colour (always
shown, even empty; the add box is its own component so typing never re-renders the rows), then categories A to Z
with rows A to Z, one Accordion each,
"People met" folded, Likes/Dislikes/Turn-ons/Turn-offs split under sub-headings (factWords.preferenceParts: Colors,
Activities, Conversation Topics, Types of Sims...), pets inside "Household Members", exes in Partners marked "(ex)"
from the romantic-Divorced bit. The dialog adds only `note` facts (shown as "Custom (Player Added)"); the route still
takes any predicate for the bench. Skills: every one the mod sends (its top 8), level 1 included, and the prompt has a
"your skills:" line since 2026-10-13. NLS = Natural Living (factWords ABBREVIATIONS).
Traits beyond Create a Sim (2026-10-13): the dossier's `reward_traits` (aspiration rewards like Business Savvy, child
skill rewards, Top-Notch Infant/Toddler) become `reward_trait` facts and ride the prompt's personality line; `phases`
(childhood phases and a child's confidence level, mod builds from 2026-10-13) become `phase` facts and a "right now:"
line. The mod's dossier builder (sentient-sims-code-subtitles ss_sim_dossier.build_trait_groups) keeps PERSONALITY, FEAR,
ASPIRATION, CHILD_REWARD, PHASE, name-matched TopNotch/Reward traits, and the WickedWhims MAJOR personality archetype
(Lover, Sinister...) as a personality trait. On-screen names: trait_Insane is "Erratic", Characteristic_Idealist is
"Artsy", HomestyleCooking is "Cooking", Bartending is "Mixology" (factWords TRAIT_NAMES / CHARACTERISTIC_NAMES / SKILL_NAMES - every on-screen alias lives in those three tables and is
pinned by FactWords.test.ts; Lovestruck=Lovebug, Temperature_IceMan=Iceproof, BurningMan=Heatproof, TheKnack=Handy).
WickedWhims archetypes read as the bare word, major or minor. The Sims page ID column is hidden outside the dev build.
Exes: `ex_partner` edge from the dossier relationship bits romantic-Broken_Up / romantic-Divorced (objectText 'broke up' /
'divorced'), in the prompt's life people and the dialog's Partners below the current ones. GET /sims/:id/facts also returns
`relationships` (live scores + bits from the stored dossier) so the dialog's "Sims Met" splits into Best Friends / Good
Friends / Friends / Acquaintances / On Bad Terms by the friendship bit. The mod sends every GAMEPLAY-typed trait minus a
six-fragment plumbing list and both WickedWhims archetype tiers; the app keeps every reward it gets (the descriptions'
`ignored` flag is NOT a reward filter - it marks Top-Notch Infant).
Lovestruck turn-ons/turn-offs (trait_Attraction_*_TurnOn/Off, filed under likes/dislikes by the
mod) are their own categories and their own prompt lines ("your turn-ons: ...", factWords.preferenceKind).
Aspirations, career branches, businesses (2026-10-13): the base game names aspiration tracks by letter
(Track_Family_A = Successful Lineage; factWords ASPIRATION_NAMES, read as the bare name "Successful Lineage"
with no category after it; an unknown letter falls back to the category alone). The dialog's summary tags carry a heading each (Age, Gender,
Household, Career, Business, Aspiration; FactSummaryItem.title) and there is no Aspiration category. The mod
sends `track` per career (Athletic_Track3_BodyBuilder; mod builds from 2026-10-13) and the claim becomes
`career_Adult_Athletic/Athletic_Track3_BodyBuilder (level 10)` ONLY once a branch is chosen (careerBranchWords
ignores Track1 and NPC tracks), read as "Bodybuilder (Athletic, level 10)" and "the Athletic career
(Bodybuilder branch)". `business` facts come from the mod's `businesses` (BusinessService.get_business_manager_for_sim
for a Businesses & Hobbies small business, named by itself; get_business_managers_for_household for a retail
store, restaurant or vet clinic, named after its lot): objectText is the name, with "(restaurant)" etc. after
it unless it is a small business (businessText/businessParts); the prompt says "you own a small business,
Vale Curios" and a business owner is never told "you have no job". Fears read as the panel names them
(FEAR_NAMES: The Dark, Unfulfilled Dreams, Dead-End Job); WickedWhims rewards drop their system prefix
(TURBODRIVER:WickedWhims_Trait_Nudity_NoSweat_Reward -> "Doesn't Sweat"). trait_Legendary is Beloved and
trait_NosyNeighbor is Confidante on the panel. The game types WickedWhims' FertilityIssues ("Hypofertile") as a
PHASE: factWords.isChildPhase tells a real childhood phase/confidence from it, and a non-child `phase` fact is
shown and prompted as a plain personality trait. Turn-on/turn-off sub-headings follow the Lovestruck panel
(ATTRACTION_GROUPS: Way of Life, Characteristics, Fashion, Hair Color, Outfit Color, Skills, Romance Styles;
Performer is filed under Way of Life although the files put it in SkillArchetypes). Likes keep "Types of Sims".

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
