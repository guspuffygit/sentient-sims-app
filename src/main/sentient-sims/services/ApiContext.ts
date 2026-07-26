import { AIController } from '../controllers/AIController';
import { AnimationsController } from '../controllers/AnimationsController';
import { AssetsController } from '../controllers/AssetsController';
import { CognitionController } from '../controllers/CognitionController';
import { DbController } from '../controllers/DbController';
import { DebugController } from '../controllers/DebugController';
import { FileController } from '../controllers/FileController';
import { InteractionDescriptionController } from '../controllers/InteractionDescriptionController';
import { LocationsController } from '../controllers/LocationsController';
import { LoginController } from '../controllers/LoginController';
import { MappingController } from '../controllers/MappingController';
import { MemoriesController } from '../controllers/MemoriesController';
import { NewsController } from '../controllers/NewsController';
import { OptionsController } from '../controllers/OptionsController';
import { ParticipantsController } from '../controllers/ParticipantsController';
import { PatreonController } from '../controllers/PatreonController';
import { SettingsController } from '../controllers/SettingsController';
import { UpdateController } from '../controllers/UpdateController';
import { VersionController } from '../controllers/VersionController';
import { VoiceController } from '../controllers/VoiceController';
import { InteractionRepository } from '../db/InteractionRepository';
import { LocationRepository } from '../db/LocationRepository';
import { MemoryIndexRepository } from '../db/MemoryIndexRepository';
import { MemoryRepository } from '../db/MemoryRepository';
import { ParticipantRepository } from '../db/ParticipantRepository';
import { ApiType } from '../models/ApiType';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { NovelAITokenCounter } from '../tokens/NovelAITokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';
import { TokenCounter } from '../tokens/TokenCounter';
import { ActionDispatcherService } from './ActionDispatcherService';
import { AIService } from './AIService';
import { AnimationsService } from './AnimationsService';
import { DbService } from './DbService';
import { DirectoryService } from './DirectoryService';
import { ElevenLabsVoicesService } from './ElevenLabsVoicesService';
import { EmbeddingService, NoopEmbeddingService, OpenAIEmbeddingService } from './EmbeddingService';
import { GeminiService } from './GeminiService';
import { GenerationQueueService } from './GenerationQueueService';
import { GenerationService } from './GenerationService';
import { InteractionService } from './InteractionService';
import { KoboldAIService } from './KoboldAIService';
import { LastExceptionService } from './LastExceptionService';
import { LogSendService } from './LogSendService';
import { LogsService } from './LogsService';
import { MappingService } from './MappingService';
import { MemoryAnnotationService } from './MemoryAnnotationService';
import { MemoryRetrievalService } from './MemoryRetrievalService';
import { ModelSettingsService } from './ModelSettingsService';
import { NovelAIService } from './NovelAIService';
import { OpenAIService } from './OpenAIService';
import { OpenRouterService } from './OpenRouterService';
import { PatreonService } from './PatreonService';
import { PromptRequestBuilderService } from './PromptRequestBuilderService';
import { SceneService } from './SceneService';
import { ProviderConfigService } from './ProviderConfigService';
import { SentientSimsAIService } from './SentientSimsAIService';
import { SettingsService } from './SettingsService';
import { UpdateService } from './UpdateService';
import { VersionService } from './VersionService';
import { VLLMAIService } from './VLLMAIService';

export type ApiContextParams = {
  port: number;
  getAssetPath: (...paths: string[]) => string;
  settingsService: SettingsService;
  directoryService: DirectoryService;
  appVersion: string;
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
    this._cognitionController = new CognitionController(ctx);
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
  private readonly _openAIEmbeddingService: OpenAIEmbeddingService;
  private readonly _noopEmbeddingService: NoopEmbeddingService;
  private readonly _memoryAnnotationService: MemoryAnnotationService;
  private readonly _memoryRetrievalService: MemoryRetrievalService;
  private readonly _elevenLabsVoicesService: ElevenLabsVoicesService;

  // --- Repositories ---
  private readonly _locationRepository: LocationRepository;
  private readonly _memoryRepository: MemoryRepository;
  private readonly _memoryIndexRepository: MemoryIndexRepository;
  private readonly _participantRepository: ParticipantRepository;
  private readonly _interactionRepository: InteractionRepository;

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

  private readonly _novelAITokenCounter: NovelAITokenCounter;
  private readonly _openAITokenCounter: OpenAITokenCounter;
  private readonly _llamaTokenCounter: LLaMaTokenCounter;

  private readonly _controller: ControllerContext;

  constructor(options: ApiContextParams) {
    this._port = options.port;
    this._getAssetPath = options.getAssetPath;
    this._settings = options.settingsService;
    this._directory = options.directoryService;

    this._sentientSimsAIService = new SentientSimsAIService(this);
    this._koboldAIService = new KoboldAIService(this);
    this._novelAIService = new NovelAIService(this);
    this._geminiService = new GeminiService(this);
    this._vllmAIService = new VLLMAIService(this);
    this._openAIService = new OpenAIService(this);
    this._openRouterService = new OpenRouterService(this);

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

    this._locationRepository = new LocationRepository(this._db);
    this._memoryRepository = new MemoryRepository(this._db);
    this._memoryIndexRepository = new MemoryIndexRepository(this._db);
    this._participantRepository = new ParticipantRepository(this._db);
    this._interactionRepository = new InteractionRepository(this);

    this._sceneService = new SceneService();
    this._actionDispatcherService = new ActionDispatcherService();
    this._openAIEmbeddingService = new OpenAIEmbeddingService(this);
    this._noopEmbeddingService = new NoopEmbeddingService();

    this._promptBuilder = new PromptRequestBuilderService(this);
    this._interactionService = new InteractionService(this);

    this._aiService = new AIService(this);
    this._generationQueueService = new GenerationQueueService(this);
    this._mappingService = new MappingService();

    this._memoryAnnotationService = new MemoryAnnotationService(this);
    this._memoryRetrievalService = new MemoryRetrievalService(this);
    this._elevenLabsVoicesService = new ElevenLabsVoicesService(this);
    this._memoryRepository.setOnMemoryUpserted((memory) => {
      this._memoryAnnotationService.annotateInBackground(memory);
    });

    this._controller = new ControllerContext(this);
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
    return this._actionDispatcherService;
  }

  // Evaluated per access so setting an OpenAI key at runtime upgrades from Noop
  get embedding(): EmbeddingService {
    return this._openAIEmbeddingService.isAvailable() ? this._openAIEmbeddingService : this._noopEmbeddingService;
  }

  get memoryAnnotation(): MemoryAnnotationService {
    return this._memoryAnnotationService;
  }

  get memoryRetrieval(): MemoryRetrievalService {
    return this._memoryRetrievalService;
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

  get participantRepository(): ParticipantRepository {
    return this._participantRepository;
  }

  get interactionRepository(): InteractionRepository {
    return this._interactionRepository;
  }

  private get sentientSimsAIService(): SentientSimsAIService {
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

  getGenerationService(aiType: ApiType): GenerationService {
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
