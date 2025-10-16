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
import { SettingsEnum } from '../models/SettingsEnum';
import { AllModelSettings, ModelSettings } from '../modelSettings';
import { LLaMaTokenCounter } from '../tokens/LLaMaTokenCounter';
import { NovelAITokenCounter } from '../tokens/NovelAITokenCounter';
import { OpenAITokenCounter } from '../tokens/OpenAITokenCounter';
import { TokenCounter } from '../tokens/TokenCounter';
import { stringType } from '../util/typeChecks';
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
import { NovelAIService } from './NovelAIService';
import { OpenAIService } from './OpenAIService';
import { PatreonService } from './PatreonService';
import { PromptRequestBuilderService } from './PromptRequestBuilderService';
import { RepositoryService } from './RepositoryService';
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

export class ApiContext {
  private readonly _port: number;
  private readonly _getAssetPath: (...paths: string[]) => string;
  private readonly _settings: SettingsService;
  private readonly _directory: DirectoryService;

  // --- Services ---
  private readonly _lastExceptionService: LastExceptionService;
  private readonly _versionService: VersionService;
  private readonly _updateService: UpdateService;
  private readonly _dbService: DbService;
  private readonly _repositoryService: RepositoryService;
  private readonly _promptBuilderService: PromptRequestBuilderService;
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

  // --- Controllers ---
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

  // --- AI Services ---
  private readonly _sentientSimsAIService: SentientSimsAIService;
  private readonly _koboldAIService: KoboldAIService;
  private readonly _novelAIService: NovelAIService;
  private readonly _geminiService: GeminiService;
  private readonly _vllmAIService: VLLMAIService;
  private readonly _openAIService: OpenAIService;

  private readonly _novelAITokenCounter: NovelAITokenCounter;
  private readonly _openAITokenCounter: OpenAITokenCounter;
  private readonly _llamaTokenCounter: LLaMaTokenCounter;

  constructor(options: ApiContextParams) {
    this._port = options.port;
    this._getAssetPath = options.getAssetPath;
    this._settings = options.settingsService;
    this._directory = options.directoryService;

    this._sentientSimsAIService = new SentientSimsAIService(this._settings);
    this._koboldAIService = new KoboldAIService(this._settings);
    this._novelAIService = new NovelAIService(this._settings);
    this._geminiService = new GeminiService(this._settings);
    this._vllmAIService = new VLLMAIService(this._settings);
    this._openAIService = new OpenAIService(this._settings);

    this._novelAITokenCounter = new NovelAITokenCounter();
    this._openAITokenCounter = new OpenAITokenCounter();
    this._llamaTokenCounter = new LLaMaTokenCounter();

    // --- Initialize Services, Repositories, and Controllers ---
    this._lastExceptionService = new LastExceptionService(this._directory);
    this._versionService = new VersionService(this._directory);
    this._updateService = new UpdateService(this._directory);
    this._dbService = new DbService(this._directory);
    this._logsService = new LogsService(this._directory);
    this._logSendService = new LogSendService(
      this._settings,
      this._directory,
      this._lastExceptionService,
      this._versionService,
    );
    this._patreonService = new PatreonService(this._settings);
    this._animationsService = new AnimationsService(this._settings);

    this._locationRepository = new LocationRepository(this._dbService);
    this._memoryRepository = new MemoryRepository(this._dbService);
    this._participantRepository = new ParticipantRepository(this._dbService);
    this._interactionRepository = new InteractionRepository(this._settings);

    this._repositoryService = new RepositoryService(
      this._locationRepository,
      this._memoryRepository,
      this._participantRepository,
    );
    this._promptBuilderService = new PromptRequestBuilderService(this._repositoryService);
    this._interactionService = new InteractionService(this._interactionRepository);

    this._aiService = new AIService(
      this._settings,
      this._promptBuilderService,
      this._animationsService,
      this._interactionService,
    );
    this._mappingService = new MappingService();

    this._versionController = new VersionController(this);
    this._fileController = new FileController(this);
    this._dbController = new DbController(this);
    this._memoriesController = new MemoriesController(this);
    this._participantsController = new ParticipantsController(this);
    this._locationsController = new LocationsController(this._locationRepository);
    this._updateController = new UpdateController(this);
    this._settingsController = new SettingsController(this._settings);
    this._patreonController = new PatreonController(this);
    this._loginController = new LoginController(this);
    this._debugController = new DebugController(this);
    this._interactionDescriptionController = new InteractionDescriptionController(this);
    this._voiceController = new VoiceController();
    this._aiController = new AIController(this);
    this._animationsController = new AnimationsController(this);
    this._assetsController = new AssetsController(this);
    this._mappingController = new MappingController(this);
  }

  get port(): number {
    return this._port;
  }

  getAssetPath(...paths: string[]): string {
    return this._getAssetPath(...paths);
  }

  get settingsService(): SettingsService {
    return this._settings;
  }

  get directoryService(): DirectoryService {
    return this._directory;
  }

  get lastExceptionService(): LastExceptionService {
    return this._lastExceptionService;
  }

  get versionService(): VersionService {
    return this._versionService;
  }

  get updateService(): UpdateService {
    return this._updateService;
  }

  get dbService(): DbService {
    return this._dbService;
  }

  get repositoryService(): RepositoryService {
    return this._repositoryService;
  }

  get promptBuilderService(): PromptRequestBuilderService {
    return this._promptBuilderService;
  }

  get logSendService(): LogSendService {
    return this._logSendService;
  }

  get logsService(): LogsService {
    return this._logsService;
  }

  get patreonService(): PatreonService {
    return this._patreonService;
  }

  get animationsService(): AnimationsService {
    return this._animationsService;
  }

  get interactionService(): InteractionService {
    return this._interactionService;
  }

  get aiService(): AIService {
    return this._aiService;
  }

  get mappingService(): MappingService {
    return this._mappingService;
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

  get versionController(): VersionController {
    return this._versionController;
  }

  get fileController(): FileController {
    return this._fileController;
  }

  get dbController(): DbController {
    return this._dbController;
  }

  get memoriesController(): MemoriesController {
    return this._memoriesController;
  }

  get participantsController(): ParticipantsController {
    return this._participantsController;
  }

  get locationsController(): LocationsController {
    return this._locationsController;
  }

  get updateController(): UpdateController {
    return this._updateController;
  }

  get settingsController(): SettingsController {
    return this._settingsController;
  }

  get patreonController(): PatreonController {
    return this._patreonController;
  }

  get loginController(): LoginController {
    return this._loginController;
  }

  get debugController(): DebugController {
    return this._debugController;
  }

  get interactionDescriptionController(): InteractionDescriptionController {
    return this._interactionDescriptionController;
  }

  get voiceController(): VoiceController {
    return this._voiceController;
  }

  get aiController(): AIController {
    return this._aiController;
  }

  get animationsController(): AnimationsController {
    return this._animationsController;
  }

  get assetsController(): AssetsController {
    return this._assetsController;
  }

  get mappingController(): MappingController {
    return this._mappingController;
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

  get genai(): GenerationService {
    const aiType = this.settingsService.get(SettingsEnum.AI_API_TYPE);
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

    return this.openAIService;
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
    const aiType = this.settingsService.get(SettingsEnum.AI_API_TYPE);

    if (aiType === ApiType.NovelAI) {
      return this.novelAITokenCounter;
    }

    if (aiType === ApiType.OpenAI) {
      return this.openAITokenCounter;
    }

    return this.llamaTokenCounter;
  }

  get modelSettings(): ModelSettings {
    const aiType = this.settingsService.get(SettingsEnum.AI_API_TYPE);

    let modelSettings = AllModelSettings.default;
    let model: string | unknown = null;

    if (aiType === ApiType.OpenAI) {
      model = this.settingsService.get(SettingsEnum.OPENAI_MODEL);
    }

    if (aiType === ApiType.SentientSimsAI) {
      model = this.settingsService.get(SettingsEnum.SENTIENTSIMSAI_MODEL);
    }

    if (aiType === ApiType.Gemini) {
      model = this.settingsService.get(SettingsEnum.GEMINI_MODEL);
    }

    if (aiType === ApiType.VLLM) {
      model = this.settingsService.get(SettingsEnum.VLLM_MODEL);
    }

    if (stringType(model) && model in AllModelSettings) {
      modelSettings = AllModelSettings[model];
    }

    return modelSettings;
  }
}
