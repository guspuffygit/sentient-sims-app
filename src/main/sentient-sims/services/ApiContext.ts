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
import { AIService } from './AIService';
import { AnimationsService } from './AnimationsService';
import { DbService } from './DbService';
import { DirectoryService } from './DirectoryService';
import { InteractionService } from './InteractionService';
import { LastExceptionService } from './LastExceptionService';
import { LogSendService } from './LogSendService';
import { LogsService } from './LogsService';
import { MappingService } from './MappingService';
import { PatreonService } from './PatreonService';
import { PromptRequestBuilderService } from './PromptRequestBuilderService';
import { RepositoryService } from './RepositoryService';
import { SettingsService } from './SettingsService';
import { UpdateService } from './UpdateService';
import { VersionService } from './VersionService';

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

  constructor(options: ApiContextParams) {
    this._port = options.port;
    this._getAssetPath = options.getAssetPath;
    this._settings = options.settingsService;
    this._directory = options.directoryService;

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

    this._versionController = new VersionController(this._versionService);
    this._fileController = new FileController(this._lastExceptionService);
    this._dbController = new DbController(this._dbService);
    this._memoriesController = new MemoriesController(this._memoryRepository);
    this._participantsController = new ParticipantsController(this._participantRepository);
    this._locationsController = new LocationsController(this._locationRepository);
    this._updateController = new UpdateController(this._updateService);
    this._settingsController = new SettingsController(this._settings);
    this._patreonController = new PatreonController(this._patreonService, this._getAssetPath);
    this._loginController = new LoginController(this._getAssetPath);
    this._debugController = new DebugController(this._settings, this._logSendService);
    this._interactionDescriptionController = new InteractionDescriptionController(this._interactionService);
    this._voiceController = new VoiceController();
    this._aiController = new AIController(this._aiService, this._dbService);
    this._animationsController = new AnimationsController(this._animationsService);
    this._assetsController = new AssetsController(this._getAssetPath);
    this._mappingController = new MappingController(this._mappingService);
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
}
