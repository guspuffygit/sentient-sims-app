import { AIController } from '../controllers/AIController';
import { AnimationsController } from '../controllers/AnimationsController';
import { AssetsController } from '../controllers/AssetsController';
import { DbController } from '../controllers/DbController';
import { DebugController } from '../controllers/DebugController';
import { FileController } from '../controllers/FileController';
import { InteractionDescriptionController } from '../controllers/InteractionDescriptionController';
import { LocationsController } from '../controllers/LocationsController';
import { LoginController } from '../controllers/LoginController';
import { MappingController } from '../controllers/MappingController';
import { MemoriesController } from '../controllers/MemoriesController';
import { NewsController } from '../controllers/NewsController';
import { ParticipantsController } from '../controllers/ParticipantsController';
import { PatreonController } from '../controllers/PatreonController';
import { SettingsController } from '../controllers/SettingsController';
import { UpdateController } from '../controllers/UpdateController';
import { VersionController } from '../controllers/VersionController';
import { VoiceController } from '../controllers/VoiceController';
import { InteractionRepository } from '../db/InteractionRepository';
import { LocationRepository } from '../db/LocationRepository';
import { MemoryRepository } from '../db/MemoryRepository';
import { ParticipantRepository } from '../db/ParticipantRepository';
import { ApiType } from '../models/ApiType';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { NovelAITokenCounter } from '../tokens/NovelAITokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';
import { TokenCounter } from '../tokens/TokenCounter';
import { AIService } from './AIService';
import { AnimationsService } from './AnimationsService';
import { DbService } from './DbService';
import { DirectoryService } from './DirectoryService';
import { GeminiService } from './GeminiService';
import { GenerationService } from './GenerationService';
import { InteractionService } from './InteractionService';
import { KoboldAIService } from './KoboldAIService';
import { LastExceptionService } from './LastExceptionService';
import { LogSendService } from './LogSendService';
import { LogsService } from './LogsService';
import { MappingService } from './MappingService';
import { ModelSettingsService } from './ModelSettingsService';
import { NovelAIService } from './NovelAIService';
import { OpenAIService } from './OpenAIService';
import { PatreonService } from './PatreonService';
import { Player2Service } from './Player2Service'; // ADDED: Import Player2Service for API integration
import { PromptRequestBuilderService } from './PromptRequestBuilderService';
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
    this._voiceController = new VoiceController();
    this._aiController = new AIController(ctx);
    this._animationsController = new AnimationsController(ctx);
    this._assetsController = new AssetsController(ctx);
    this._mappingController = new MappingController(ctx);
    this._newsController = new NewsController(ctx);
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
  private readonly _mappingService: MappingService;

  // --- Repositories ---
  private readonly _locationRepository: LocationRepository;
  private readonly _memoryRepository: MemoryRepository;
  private readonly _participantRepository: ParticipantRepository;
  private readonly _interactionRepository: InteractionRepository;

  // --- AI Services ---
  private readonly _sentientSimsAIService: SentientSimsAIService;
  private readonly _koboldAIService: KoboldAIService;
  private readonly _novelAIService: NovelAIService;
  private readonly _geminiService: GeminiService;
  private readonly _vllmAIService: VLLMAIService;
  private readonly _openAIService: OpenAIService;
  private readonly _player2Service: Player2Service; // ADDED: Player2 AI service instance
  private readonly _modelSettingsService: ModelSettingsService;

  private readonly _novelAITokenCounter: NovelAITokenCounter;
  private readonly _openAITokenCounter: OpenAITokenCounter;
  private readonly _llamaTokenCounter: LLaMaTokenCounter;

  private readonly _controller: ControllerContext;

  constructor(options: ApiContextParams) {
    this._port = options.port;
    this._getAssetPath = options.getAssetPath;
    this._settings = options.settingsService;
    this._directory = options.directoryService;

    // Initialize AI services - each provider has its own service instance
    this._sentientSimsAIService = new SentientSimsAIService(this);
    this._koboldAIService = new KoboldAIService(this);
    this._novelAIService = new NovelAIService(this);
    this._geminiService = new GeminiService(this);
    this._vllmAIService = new VLLMAIService(this);
    this._openAIService = new OpenAIService(this);
    this._player2Service = new Player2Service(this); // ADDED: Initialize Player2 service for cost-effective AI generation

    this._novelAITokenCounter = new NovelAITokenCounter();
    this._openAITokenCounter = new OpenAITokenCounter();
    this._llamaTokenCounter = new LLaMaTokenCounter();

    // --- Initialize Services, Repositories, and Controllers ---
    this._lastException = new LastExceptionService(this);
    this._version = new VersionService(this);
    this._update = new UpdateService(this);
    this._db = new DbService(this);
    this._logsService = new LogsService(this);
    this._logSendService = new LogSendService(this);
    this._patreonService = new PatreonService(this);
    this._animationsService = new AnimationsService(this);
    this._modelSettingsService = new ModelSettingsService(this);

    this._locationRepository = new LocationRepository(this._db);
    this._memoryRepository = new MemoryRepository(this._db);
    this._participantRepository = new ParticipantRepository(this._db);
    this._interactionRepository = new InteractionRepository(this);

    this._promptBuilder = new PromptRequestBuilderService(this);
    this._interactionService = new InteractionService(this);

    this._aiService = new AIService(this);
    this._mappingService = new MappingService();

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

  get mapping(): MappingService {
    return this._mappingService;
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

  private get player2Service(): Player2Service { // ADDED: Getter for Player2 service instance
    return this._player2Service;
  }

  // MODIFIED: Added Player2 case to the generation service selector
  get genai(): GenerationService {
    const aiType = this.settings.aiApiType;
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

    if (aiType === ApiType.Player2) { // ADDED: Return Player2 service when Player2 is selected as AI provider
      return this.player2Service;
    }

    return this.openAIService; // Default to OpenAI for backwards compatibility
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

  // MODIFIED: Added Player2 to use OpenAI token counter since it uses compatible API
  get tokenCounter(): TokenCounter {
    const aiType = this.settings.aiApiType;

    if (aiType === ApiType.NovelAI) {
      return this.novelAITokenCounter;
    }

    if (aiType === ApiType.OpenAI || aiType === ApiType.Player2) { // ADDED: Player2 uses OpenAI-compatible token counting
      return this.openAITokenCounter;
    }

    return this.llamaTokenCounter;
  }

  // MODIFIED: Added Player2 model setting support
  get aiModel(): string | undefined {
    const aiType = this.settings.aiApiType;

    if (aiType === ApiType.OpenAI) {
      return this.settings.openaiModel;
    } else if (aiType === ApiType.SentientSimsAI) {
      return this.settings.sentientSimsAIModel;
    } else if (aiType === ApiType.Gemini) {
      return this.settings.geminiModel;
    } else if (aiType === ApiType.VLLM) {
      return this.settings.vllmModel;
    } else if (aiType === ApiType.NovelAI) {
      return this.settings.novelAIModel;
    } else if (aiType === ApiType.Player2) { // ADDED: Return Player2 model setting for model selection
      return this.settings.player2Model;
    }

    return undefined;
  }

  get controller(): ControllerContext {
    return this._controller;
  }
}