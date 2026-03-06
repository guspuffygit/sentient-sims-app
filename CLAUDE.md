# CLAUDE.md

Sentient Sims App is an Electron desktop companion app for the Sentient Sims mod for The Sims 4.
It acts as a secure proxy between the game and various AI APIs (OpenAI, Gemini, KoboldAI, NovelAI, VLLM, and a custom Sentient Sims AI service).
It also manages game state, saves, memories, locations, and participants via a local SQLite database.

Commands:
  npm run start       Dev mode (renderer dev server + main process)
  npm run build       Production build (main + renderer via webpack)
  npm run lint        ESLint with flat config
  npm run compile     TypeScript type-check (tsc --noEmit --skipLibCheck)
  npm run check       Lint + compile + test (full CI check)
  npm run test        All tests (unit + integration)
  npm run test:unit   Unit tests only (excludes *.it.test.* files)
  npm run test:watch  Watch mode for unit tests

Single test: edit the regex in test:single or run directly:
  cross-env ELECTRON_RUN_AS_NODE=true NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" JEST_DISABLE_COVERAGE=true ./node_modules/.bin/electron ./node_modules/.bin/jest 'YourTest.test.ts'

Tests run through Electron's Node runtime (ELECTRON_RUN_AS_NODE=true) with Jest.
Integration tests (.it.test.ts) require OPENAI_KEY env var.

Architecture:

  Main process (src/main/main.ts) creates the BrowserWindow, starts an Express HTTP server on port 25198, and sets up a WebSocket server. The Sims 4 mod communicates with this Express API.
  Renderer process (src/renderer/) is a React 19 UI with MUI components, React Router, and TanStack Query. Communicates with main via IPC and the local Express API.
  Preload (src/main/preload.ts) bridges renderer to main process via contextBridge.

Backend (src/main/sentient-sims/):

  ApiContext (services/ApiContext.ts) is the central dependency injection container. It instantiates all services, repositories, and controllers. Most classes receive ApiContext in their constructor.

  controllers/ - Express route handlers, registered in api.ts
  services/   - Business logic:
    AIService                   - Orchestrates AI generation across providers
    GenerationService           - Interface implemented by each AI provider
    PromptRequestBuilderService - Builds prompts from game state, memories, interaction context
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

IPC: ipcHandlers.ts registers Electron IPC handlers (dialog, settings, clipboard, navigation). Renderer uses window.electron.ipcRenderer for direct main process calls, and HTTP clients for Express API calls.

Build: electron-react-boilerplate webpack setup in .erb/configs/. Builds to release/app/dist/. Packaging via electron-builder (Windows NSIS, macOS DMG, Linux AppImage).

Code conventions:
  TypeScript strict mode throughout
  Prettier: single quotes, trailing commas, 120 char print width
  Tests in src/__tests__/, named *.test.ts (unit) or *.it.test.ts (integration)
  ESM modules ("type": "module" in package.json), uses tsx for ts execution
