import { AIController } from '../controllers/AIController';
import { AnimationsController } from '../controllers/AnimationsController';
import { AssetsController } from '../controllers/AssetsController';
import { CognitionController } from '../controllers/CognitionController';
import { DbController } from '../controllers/DbController';
import { DebugController } from '../controllers/DebugController';
import { DossierController } from '../controllers/DossierController';
import { FileController } from '../controllers/FileController';
import { InteractionDescriptionController } from '../controllers/InteractionDescriptionController';
import { LocationsController } from '../controllers/LocationsController';
import { LoginController } from '../controllers/LoginController';
import { MappingController } from '../controllers/MappingController';
import { MemoriesController } from '../controllers/MemoriesController';
import { NewsController } from '../controllers/NewsController';
import { OptionsController } from '../controllers/OptionsController';
import { PaintingsController } from '../controllers/PaintingsController';
import { ParticipantsController } from '../controllers/ParticipantsController';
import { PatreonController } from '../controllers/PatreonController';
import { SettingsController } from '../controllers/SettingsController';
import { SimFactsController } from '../controllers/SimFactsController';
import { SimStateController } from '../controllers/SimStateController';
import { UpdateController } from '../controllers/UpdateController';
import { VersionController } from '../controllers/VersionController';
import { VoiceController } from '../controllers/VoiceController';
import { InteractionRepository } from '../db/InteractionRepository';
import { LocationRepository } from '../db/LocationRepository';
import { MemoryIndexRepository } from '../db/MemoryIndexRepository';
import { MemoryRepository } from '../db/MemoryRepository';
import { PaintingRepository } from '../db/PaintingRepository';
import { ParticipantRepository } from '../db/ParticipantRepository';
import { SimFactRepository } from '../db/SimFactRepository';
import { ApiType } from '../models/ApiType';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { NovelAITokenCounter } from '../tokens/NovelAITokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';
import { TokenCounter } from '../tokens/TokenCounter';
import { ActionDispatcherService } from './ActionDispatcherService';
import { AIExchangeLogService } from './AIExchangeLogService';
import { AIService } from './AIService';
import { AnimationsService } from './AnimationsService';
import { DbService } from './DbService';
import { DefaultDescriptionService } from './DefaultDescriptionService';
import { DirectoryService } from './DirectoryService';
import { ElevenLabsVoicesService } from './ElevenLabsVoicesService';
import { EmbeddingProviderConfigService } from './EmbeddingProviderConfigService';
import { EmbeddingService, NoopEmbeddingService, OpenAIEmbeddingService } from './EmbeddingService';
import { GameSigningService } from './GameSigningService';
import { PaintingMountService } from './PaintingMountService';
import { GeminiEmbeddingService } from './GeminiEmbeddingService';
import { GeminiService } from './GeminiService';
import { GenerationQueueService } from './GenerationQueueService';
import { GenerationService } from './GenerationService';
import { ImageGenerationService } from './ImageGenerationService';
import { ImageProviderConfigService } from './ImageProviderConfigService';
import { InteractionService } from './InteractionService';
import { KoboldAIService } from './KoboldAIService';
import { LastExceptionService } from './LastExceptionService';
import { LogSendService } from './LogSendService';
import { LogsService } from './LogsService';
import { MappingService } from './MappingService';
import { MemoryAnnotationService } from './MemoryAnnotationService';
import { MemoryRetrievalService } from './MemoryRetrievalService';
import { InteractionSemanticSearchService } from './InteractionSemanticSearchService';
import { ModelSettingsService } from './ModelSettingsService';
import { NovelAIService } from './NovelAIService';
import { OpenAIImageGenerationService } from './OpenAIImageGenerationService';
import { OpenAIService } from './OpenAIService';
import { OpenRouterEmbeddingService } from './OpenRouterEmbeddingService';
import { OpenRouterImageGenerationService } from './OpenRouterImageGenerationService';
import { OpenRouterService } from './OpenRouterService';
import { PatreonService } from './PatreonService';
import { PlayerConversationService } from './PlayerConversationService';
import { PromptRequestBuilderService } from './PromptRequestBuilderService';
import { SceneService } from './SceneService';
import { ScenePlaybackRegistry } from './ScenePlaybackRegistry';
import { ProviderConfigService } from './ProviderConfigService';
import { SemanticMemoryService } from './SemanticMemoryService';
import { SentientSimsAIService } from './SentientSimsAIService';
import { SentientSimsEmbeddingService } from './SentientSimsEmbeddingService';
import { SettingsService } from './SettingsService';
import { SimStateCache } from './SimStateCache';
import { TranscriptionService } from './TranscriptionService';
import { UpdateService } from './UpdateService';
import { VersionService } from './VersionService';
import { VLLMAIService } from './VLLMAIService';
import {
  notifySceneStop,
  sendConversationClosedToMod,
  sendSceneEndedToMod,
  setSceneMemoryObserver,
} from '../util/notifyRenderer';
import { setSimAliases } from '../util/simAliases';
import { TIER_REGISTRATIONS } from '../tiers';
import type { TierExtensions, TierRegistration } from '../tiers/types';

export type ApiContextParams = {
  port: number;
  getAssetPath: (...paths: string[]) => string;
  settingsService: SettingsService;
  directoryService: DirectoryService;
  appVersion: string;
  // The build tiers this context runs (release 4.5). Defaults to the generated list for
  // the build; tests that pin core behaviour pass [].
  tiers?: TierRegistration[];
  // True when the app runs from source (main.ts: !app.isPackaged). The startup mod
  // auto-update stays off, so a mod built from the repo is not replaced by a release.
  devBuild?: boolean;
};

class ControllerContext {
  private readonly _versionController: VersionController;
  private readonly _fileController: FileController;
  private readonly _dbController: DbController;
  private readonly _memoriesController: MemoriesController;
  private readonly _participantsController: ParticipantsController;
  private readonly _locationsController: LocationsController;
  private readonly _updateController: UpdateController;
  private readonly _settingsController: SettingsController;
  private readonly _patreonController: PatreonController;
  private readonly _loginController: LoginController;
  private readonly _debugController: DebugController;
  private readonly _interactionDescriptionController: InteractionDescriptionController;
  private readonly _voiceController: VoiceController;
  private readonly _aiController: AIController;
  private readonly _animationsController: AnimationsController;
  private readonly _assetsController: AssetsController;
  private readonly _mappingController: MappingController;
  private readonly _newsController: NewsController;
  private readonly _optionsController: OptionsController;
  private readonly _cognitionController: CognitionController;
  private readonly _simStateController: SimStateController;
  private readonly _dossierController: DossierController;
  private readonly _simFactsController: SimFactsController;
  private readonly _paintingsController: PaintingsController;

  constructor(ctx: ApiContext) {
    this._versionController = new VersionController(ctx);
    this._fileController = new FileController(ctx);
    this._dbController = new DbController(ctx);
    this._memoriesController = new MemoriesController(ctx);
    this._participantsController = new ParticipantsController(ctx);
    this._locationsController = new LocationsController(ctx);
    this._updateController = new UpdateController(ctx);
    this._settingsController = new SettingsController(ctx);
    this._patreonController = new PatreonController(ctx);
    this._loginController = new LoginController(ctx);
    this._debugController = new DebugController(ctx);
    this._interactionDescriptionController = new InteractionDescriptionController(ctx);
    this._voiceController = new VoiceController(ctx);
    this._aiController = new AIController(ctx);
    this._animationsController = new AnimationsController(ctx);
    this._assetsController = new AssetsController(ctx);
    this._mappingController = new MappingController(ctx);
    this._newsController = new NewsController(ctx);
    this._optionsController = new OptionsController(ctx);
    this._cognitionController = ctx.ext.cognitionController ?? new CognitionController(ctx);
    this._simStateController = new SimStateController(ctx);
    this._dossierController = new DossierController(ctx);
    this._simFactsController = new SimFactsController(ctx);
    this._paintingsController = new PaintingsController(ctx);
  }

  get version(): VersionController {
    return this._versionController;
  }

  get file(): FileController {
    return this._fileController;
  }

  get db(): DbController {
    return this._dbController;
  }

  get memories(): MemoriesController {
    return this._memoriesController;
  }

  get participants(): ParticipantsController {
    return this._participantsController;
  }

  get locations(): LocationsController {
    return this._locationsController;
  }

  get update(): UpdateController {
    return this._updateController;
  }

  get settings(): SettingsController {
    return this._settingsController;
  }

  get patreon(): PatreonController {
    return this._patreonController;
  }

  get login(): LoginController {
    return this._loginController;
  }

  get debug(): DebugController {
    return this._debugController;
  }

  get interactionDescription(): InteractionDescriptionController {
    return this._interactionDescriptionController;
  }

  get voice(): VoiceController {
    return this._voiceController;
  }

  get ai(): AIController {
    return this._aiController;
  }

  get animations(): AnimationsController {
    return this._animationsController;
  }

  get assets(): AssetsController {
    return this._assetsController;
  }

  get mapping(): MappingController {
    return this._mappingController;
  }

  get news(): NewsController {
    return this._newsController;
  }

  get options(): OptionsController {
    return this._optionsController;
  }

  get cognition(): CognitionController {
    return this._cognitionController;
  }

  get simState(): SimStateController {
    return this._simStateController;
  }

  get dossier(): DossierController {
    return this._dossierController;
  }

  get simFacts(): SimFactsController {
    return this._simFactsController;
  }

  get paintings(): PaintingsController {
    return this._paintingsController;
  }
}

export class ApiContext {
  private readonly _port: number;
  private readonly _getAssetPath: (...paths: string[]) => string;
  private readonly _settings: SettingsService;
  private readonly _directory: DirectoryService;

  // --- Services ---
  private readonly _lastException: LastExceptionService;
  private readonly _version: VersionService;
  private readonly _update: UpdateService;
  private readonly _db: DbService;
  private readonly _promptBuilder: PromptRequestBuilderService;
  private readonly _logSendService: LogSendService;
  private readonly _logsService: LogsService;
  private readonly _patreonService: PatreonService;
  private readonly _animationsService: AnimationsService;
  private readonly _interactionService: InteractionService;
  private readonly _aiService: AIService;
  private readonly _generationQueueService: GenerationQueueService;
  private readonly _mappingService: MappingService;
  private readonly _sceneService: SceneService;
  private readonly _actionDispatcherService: ActionDispatcherService;

  private readonly _scenePlaybackRegistry: ScenePlaybackRegistry;
  private readonly _playerConversationService: PlayerConversationService;

  private _defaultDescriptionService?: DefaultDescriptionService;
  private readonly _simStateCache: SimStateCache;
  private readonly _openAIEmbeddingService: OpenAIEmbeddingService;
  private readonly _sentientSimsEmbeddingService: SentientSimsEmbeddingService;
  private readonly _geminiEmbeddingService: GeminiEmbeddingService;
  private readonly _openRouterEmbeddingService: OpenRouterEmbeddingService;
  private readonly _noopEmbeddingService: NoopEmbeddingService;
  private readonly _memoryAnnotationService: MemoryAnnotationService;
  private readonly _memoryRetrievalService: MemoryRetrievalService;
  private readonly _aiExchangeLogService: AIExchangeLogService;
  private readonly _semanticMemoryService: SemanticMemoryService;
  private readonly _transcriptionService: TranscriptionService;

  // One logging wrapper per provider service, so repeated getGenerationService calls
  // hand back the same object instead of allocating a new proxy each time
  private readonly _loggedGenerationServices = new Map<GenerationService, GenerationService>();
  private readonly _interactionSemanticSearchService: InteractionSemanticSearchService;
  private readonly _gameSigningService: GameSigningService;
  private readonly _paintingMountService: PaintingMountService;
  private readonly _elevenLabsVoicesService: ElevenLabsVoicesService;

  // --- Repositories ---
  private readonly _locationRepository: LocationRepository;
  private readonly _memoryRepository: MemoryRepository;
  private readonly _memoryIndexRepository: MemoryIndexRepository;
  private readonly _paintingRepository: PaintingRepository;
  private readonly _participantRepository: ParticipantRepository;
  private readonly _interactionRepository: InteractionRepository;
  private readonly _simFactRepository: SimFactRepository;

  // --- AI Services ---
  private readonly _sentientSimsAIService: SentientSimsAIService;
  private readonly _koboldAIService: KoboldAIService;
  private readonly _novelAIService: NovelAIService;
  private readonly _geminiService: GeminiService;
  private readonly _vllmAIService: VLLMAIService;
  private readonly _openAIService: OpenAIService;

  private readonly _openRouterService: OpenRouterService;
  private readonly _modelSettingsService: ModelSettingsService;
  private readonly _providerConfigService: ProviderConfigService;
  private readonly _openAIImageService: OpenAIImageGenerationService;
  private readonly _openRouterImageService: OpenRouterImageGenerationService;
  private readonly _imageProviderConfigService: ImageProviderConfigService;
  private readonly _embeddingProviderConfigService: EmbeddingProviderConfigService;

  private readonly _novelAITokenCounter: NovelAITokenCounter;
  private readonly _openAITokenCounter: OpenAITokenCounter;
  private readonly _llamaTokenCounter: LLaMaTokenCounter;

  private readonly _controller: ControllerContext;

  private readonly _tiers: TierRegistration[];

  readonly devBuild: boolean;

  // Capability slots the build tiers fill in construct() (tiers/types.ts TierExtensions).
  // Core code calls only these, and carries on without the feature when a slot is empty.
  readonly ext: TierExtensions = {};

  constructor(options: ApiContextParams) {
    this._tiers = options.tiers ?? TIER_REGISTRATIONS;
    this.devBuild = options.devBuild ?? false;
    this._port = options.port;
    this._getAssetPath = options.getAssetPath;
    this._settings = options.settingsService;
    this._directory = options.directoryService;
    // Alias sims (the Grim Reaper and friends) are named in voice casting and targeting in
    // every build; main.ts refreshes the registry when the setting changes
    setSimAliases(this._settings.twitchSimAliases);

    this._sentientSimsAIService = new SentientSimsAIService(this);
    this._koboldAIService = new KoboldAIService(this);
    this._novelAIService = new NovelAIService(this);
    this._geminiService = new GeminiService(this);
    this._vllmAIService = new VLLMAIService(this);
    this._openAIService = new OpenAIService(this);
    this._openRouterService = new OpenRouterService(this);
    this._openAIImageService = new OpenAIImageGenerationService(this._openAIService);
    this._openRouterImageService = new OpenRouterImageGenerationService(this._openRouterService);

    this._novelAITokenCounter = new NovelAITokenCounter();
    this._openAITokenCounter = new OpenAITokenCounter();
    this._llamaTokenCounter = new LLaMaTokenCounter();

    // --- Initialize Services, Repositories, and Controllers ---
    this._lastException = new LastExceptionService(this);
    this._version = new VersionService(this, options.appVersion);
    this._update = new UpdateService(this);
    this._db = new DbService(this);
    this._logsService = new LogsService(this);
    this._logSendService = new LogSendService(this);
    this._patreonService = new PatreonService(this);
    this._animationsService = new AnimationsService(this);
    this._modelSettingsService = new ModelSettingsService(this);
    this._providerConfigService = new ProviderConfigService(this);
    this._imageProviderConfigService = new ImageProviderConfigService(this);
    this._embeddingProviderConfigService = new EmbeddingProviderConfigService(this);

    this._locationRepository = new LocationRepository(this._db);
    this._memoryRepository = new MemoryRepository(this._db);
    this._memoryIndexRepository = new MemoryIndexRepository(this._db);
    this._paintingRepository = new PaintingRepository(this._db);
    this._participantRepository = new ParticipantRepository(this._db);
    this._interactionRepository = new InteractionRepository(this);
    this._simFactRepository = new SimFactRepository(this._db);

    this._sceneService = new SceneService();
    this._actionDispatcherService = new ActionDispatcherService();
    this._playerConversationService = new PlayerConversationService({
      idleMs: () => this._settings.playerConversationIdleMinutes * 60_000,
      notifyClosed: (conversation, reason) => {
        sendConversationClosedToMod({
          simIds: conversation.simIds,
          simNames: conversation.simNames,
          speaker: conversation.speaker,
          reason,
        });
      },
    });
    this._scenePlaybackRegistry = new ScenePlaybackRegistry({
      notifyStop: notifySceneStop,
      // A conversation that closed is weighed for the moodlet it leaves on each sim, and
      // a reply to the player that wanted to act may act now that it has been heard
      onSceneClosed: (closed) => {
        for (const tier of this._tiers) {
          tier.onSceneClosed?.(this, closed);
        }
      },
      notifySceneEnded: (sceneId, reason) => {
        // The game ended the conversation (walk-away, left lot, zone unload): a player
        // thread riding that scene id is over too. 'finished' is just a round's playback
        // running out, which every reply does while the thread stays open.
        if (reason === 'stopped') {
          this._playerConversationService.onSceneStopped(sceneId);
        }
        sendSceneEndedToMod(sceneId, reason);
      },
      rewriteMemory: (memoryId, content) => {
        if (!this._db.isLoaded()) {
          return;
        }
        const existing = this._memoryRepository.getMemory({ id: memoryId });
        this._memoryRepository.updateMemory({ ...existing, content });
      },
    });
    // A scene's transcript row is saved from round 1 alone; this is how the scene
    // finds its row again at its close to rewrite it to what was actually said.
    setSceneMemoryObserver((pacedText, memoryId) => this._scenePlaybackRegistry.attachMemory(pacedText, memoryId));
    this._simStateCache = new SimStateCache();
    this._openAIEmbeddingService = new OpenAIEmbeddingService(this);
    this._sentientSimsEmbeddingService = new SentientSimsEmbeddingService(this);
    this._geminiEmbeddingService = new GeminiEmbeddingService(this);
    this._openRouterEmbeddingService = new OpenRouterEmbeddingService(this);
    this._noopEmbeddingService = new NoopEmbeddingService();

    this._promptBuilder = new PromptRequestBuilderService(this);
    this._interactionService = new InteractionService(this);

    this._aiService = new AIService(this);
    this._generationQueueService = new GenerationQueueService(this);
    this._mappingService = new MappingService();

    this._memoryAnnotationService = new MemoryAnnotationService(this);
    this._memoryRetrievalService = new MemoryRetrievalService(this);
    this._interactionSemanticSearchService = new InteractionSemanticSearchService(this);
    this._gameSigningService = new GameSigningService(this);
    this._paintingMountService = new PaintingMountService(this);
    this._elevenLabsVoicesService = new ElevenLabsVoicesService(this);
    this._transcriptionService = new TranscriptionService(this);
    this._aiExchangeLogService = new AIExchangeLogService();
    // Names come from the participant table rather than being passed around: the fact
    // store holds ids, and every rendering of a fact needs a name for them.
    this._semanticMemoryService = new SemanticMemoryService(this._simFactRepository, (simIds) => {
      try {
        return this._participantRepository.getParticipantNameMap(simIds);
      } catch {
        // No database loaded, or unknown ids - the renderer falls back to 'sim <id>'
        return {};
      }
    });
    this._memoryRepository.setGameDayProvider(() => {
      try {
        return this._simStateCache.getReport()?.lot?.clock?.absolute_day;
      } catch {
        return undefined;
      }
    });
    this._memoryRepository.setOnMemoryUpserted((memory) => {
      this._memoryAnnotationService.annotateInBackground(memory);
      for (const tier of this._tiers) {
        tier.onMemoryUpserted?.(this, memory);
      }
    });

    // Every core service exists; each build tier builds its own and fills its slots
    for (const tier of this._tiers) {
      tier.construct?.(this);
    }

    this._controller = new ControllerContext(this);
  }

  get tiers(): readonly TierRegistration[] {
    return this._tiers;
  }

  get port(): number {
    return this._port;
  }

  getAssetPath(...paths: string[]): string {
    return this._getAssetPath(...paths);
  }

  get settings(): SettingsService {
    return this._settings;
  }

  get directory(): DirectoryService {
    return this._directory;
  }

  get lastException(): LastExceptionService {
    return this._lastException;
  }

  get version(): VersionService {
    return this._version;
  }

  get update(): UpdateService {
    return this._update;
  }

  get db(): DbService {
    return this._db;
  }

  get promptBuilder(): PromptRequestBuilderService {
    return this._promptBuilder;
  }

  get logSend(): LogSendService {
    return this._logSendService;
  }

  get logs(): LogsService {
    return this._logsService;
  }

  get patreon(): PatreonService {
    return this._patreonService;
  }

  get animations(): AnimationsService {
    return this._animationsService;
  }

  get interactions(): InteractionService {
    return this._interactionService;
  }

  get ai(): AIService {
    return this._aiService;
  }

  get generationQueue(): GenerationQueueService {
    return this._generationQueueService;
  }

  get mapping(): MappingService {
    return this._mappingService;
  }

  get sceneService(): SceneService {
    return this._sceneService;
  }

  get actionDispatcher(): ActionDispatcherService {
    return this.ext.actionDispatcher ?? this._actionDispatcherService;
  }

  get scenePlayback(): ScenePlaybackRegistry {
    return this._scenePlaybackRegistry;
  }

  get playerConversations(): PlayerConversationService {
    return this._playerConversationService;
  }

  // V-6: lazily built — it needs ai, which is built late
  get defaultDescriptions(): DefaultDescriptionService {
    if (!this._defaultDescriptionService) {
      this._defaultDescriptionService = new DefaultDescriptionService(this);
    }
    return this._defaultDescriptionService;
  }

  get simStateCache(): SimStateCache {
    return this._simStateCache;
  }

  // Evaluated per access so changing the embedding provider (or setting a key/token at
  // runtime) takes effect immediately.
  get embedding(): EmbeddingService {
    const config = this._embeddingProviderConfigService.getResolvedConfig();
    const service = this.getEmbeddingService(config.apiType);
    return service.isAvailable() ? service : this._noopEmbeddingService;
  }

  getEmbeddingService(apiType: ApiType): EmbeddingService {
    if (apiType === ApiType.SentientSimsAI || apiType === ApiType.CustomAI) {
      return this._sentientSimsEmbeddingService;
    }
    if (apiType === ApiType.Gemini) {
      return this._geminiEmbeddingService;
    }
    if (apiType === ApiType.OpenRouter) {
      return this._openRouterEmbeddingService;
    }
    return this._openAIEmbeddingService;
  }

  get memoryAnnotation(): MemoryAnnotationService {
    return this._memoryAnnotationService;
  }

  get transcription(): TranscriptionService {
    return this._transcriptionService;
  }

  get memoryRetrieval(): MemoryRetrievalService {
    return this._memoryRetrievalService;
  }

  get aiExchangeLog(): AIExchangeLogService {
    return this._aiExchangeLogService;
  }

  get interactionSemanticSearch(): InteractionSemanticSearchService {
    return this._interactionSemanticSearchService;
  }

  get gameSigning(): GameSigningService {
    return this._gameSigningService;
  }

  get paintingMount(): PaintingMountService {
    return this._paintingMountService;
  }

  get elevenLabsVoices(): ElevenLabsVoicesService {
    return this._elevenLabsVoicesService;
  }

  get modelSettings(): ModelSettingsService {
    return this._modelSettingsService;
  }

  get locationRepository(): LocationRepository {
    return this._locationRepository;
  }

  get memoryRepository(): MemoryRepository {
    return this._memoryRepository;
  }

  get memoryIndexRepository(): MemoryIndexRepository {
    return this._memoryIndexRepository;
  }

  get paintingRepository(): PaintingRepository {
    return this._paintingRepository;
  }

  get participantRepository(): ParticipantRepository {
    return this._participantRepository;
  }

  get interactionRepository(): InteractionRepository {
    return this._interactionRepository;
  }

  get simFactRepository(): SimFactRepository {
    return this._simFactRepository;
  }

  get semanticMemory(): SemanticMemoryService {
    return this._semanticMemoryService;
  }

  private get sentientSimsAIService(): SentientSimsAIService {
    return this._sentientSimsAIService;
  }

  get sentientSimsTranscription(): Pick<SentientSimsAIService, 'transcribe' | 'healthCheck'> {
    return this._sentientSimsAIService;
  }

  private get koboldAIService(): KoboldAIService {
    return this._koboldAIService;
  }

  private get novelAIService(): NovelAIService {
    return this._novelAIService;
  }

  private get geminiService(): GeminiService {
    return this._geminiService;
  }

  private get vllmAIService(): VLLMAIService {
    return this._vllmAIService;
  }

  private get openAIService(): OpenAIService {
    return this._openAIService;
  }

  private get openRouterService(): OpenRouterService {
    return this._openRouterService;
  }

  get providerConfigs(): ProviderConfigService {
    return this._providerConfigService;
  }

  get imageProviderConfigs(): ImageProviderConfigService {
    return this._imageProviderConfigService;
  }

  get embeddingProviderConfigs(): EmbeddingProviderConfigService {
    return this._embeddingProviderConfigService;
  }

  getImageGenerationService(aiType: ApiType): ImageGenerationService {
    if (aiType === ApiType.OpenAI) {
      return this._openAIImageService;
    }

    if (aiType === ApiType.SentientSimsAI) {
      return this.sentientSimsAIService;
    }

    if (aiType === ApiType.Gemini) {
      return this.geminiService;
    }

    if (aiType === ApiType.OpenRouter) {
      return this._openRouterImageService;
    }

    throw new Error(`Image generation is not supported for provider: ${aiType}`);
  }

  // Every AI call in the app goes through here, which makes it the one place that can log
  // them all — see AIExchangeLogService.
  getGenerationService(aiType: ApiType): GenerationService {
    return this.withExchangeLogging(this.resolveGenerationService(aiType));
  }

  // A Proxy rather than a hand-rolled object: callers (and tests) still see the real
  // service — `instanceof SentientSimsAIService` holds, and spying on the returned object
  // defines the spy on the underlying service, so the logging still runs around it.
  private withExchangeLogging(service: GenerationService): GenerationService {
    const existing = this._loggedGenerationServices.get(service);
    if (existing) {
      return existing;
    }

    const exchangeLog = this._aiExchangeLogService;
    const loggedGenerate = async (request: OpenAICompatibleRequest) => {
      const startedAt = Date.now();
      try {
        const response = await service.sentientSimsGenerate(request);
        exchangeLog.record({ request, responseText: response.text, durationMs: Date.now() - startedAt });
        return response;
      } catch (err) {
        exchangeLog.record({
          request,
          responseText: '',
          durationMs: Date.now() - startedAt,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    };

    const wrapped = new Proxy(service, {
      get(target, property, receiver) {
        if (property === 'sentientSimsGenerate') {
          return loggedGenerate;
        }
        const value: unknown = Reflect.get(target, property, receiver);
        // Bound to the real service so delegated methods keep their own `this`
        return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
      },
    });

    this._loggedGenerationServices.set(service, wrapped);
    return wrapped;
  }

  private resolveGenerationService(aiType: ApiType): GenerationService {
    if (aiType === ApiType.SentientSimsAI || aiType === ApiType.CustomAI) {
      return this.sentientSimsAIService;
    }

    if (aiType === ApiType.KoboldAI) {
      return this.koboldAIService;
    }

    if (aiType === ApiType.NovelAI) {
      return this.novelAIService;
    }

    if (aiType === ApiType.Gemini) {
      return this.geminiService;
    }

    if (aiType === ApiType.VLLM) {
      return this.vllmAIService;
    }

    if (aiType === ApiType.OpenRouter) {
      return this.openRouterService;
    }

    return this.openAIService;
  }

  get genai(): GenerationService {
    return this.getGenerationService(this.providerConfigs.getDefaultConfig().apiType);
  }

  getTokenCounter(aiType: ApiType): TokenCounter {
    if (aiType === ApiType.NovelAI) {
      return this.novelAITokenCounter;
    }

    if (aiType === ApiType.OpenAI) {
      return this.openAITokenCounter;
    }

    return this.llamaTokenCounter;
  }

  private get novelAITokenCounter(): NovelAITokenCounter {
    return this._novelAITokenCounter;
  }

  private get openAITokenCounter(): OpenAITokenCounter {
    return this._openAITokenCounter;
  }

  private get llamaTokenCounter(): LLaMaTokenCounter {
    return this._llamaTokenCounter;
  }

  get tokenCounter(): TokenCounter {
    return this.getTokenCounter(this.providerConfigs.getDefaultConfig().apiType);
  }

  get aiModel(): string | undefined {
    return this.providerConfigs.resolve(this.providerConfigs.getDefaultConfig()).model;
  }

  get controller(): ControllerContext {
    return this._controller;
  }
}
