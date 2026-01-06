import { appApiUrl } from '../constants';
import { AIClient } from './AIClient';
import { DbClient } from './DbClient';
import { DebugClient } from './DebugClient';
import { FilesClient } from './FilesClient';
import { InteractionClient } from './InteractionClient';
import { LocationsClient } from './LocationsClient';
import { MemoriesClient } from './MemoriesClient';
import { ParticipantClient } from './ParticipantClient';
import { SentientSimsAiApiClient } from './SentientSimsAiApiClient';
import { SentientSimulationsWebsiteClient } from './SentientSimulationsWebsiteClient';
import { SettingsClient } from './SettingsClient';
import { UpdateClient } from './UpdateClient';
import { VersionClient } from './VersionClient';
import { VoiceClient } from './VoiceClient';
import { WebsocketClient } from './WebsocketClient';

export class SentientSimsAppClient {
  private readonly _ai: AIClient;
  private readonly _db: DbClient;
  private readonly _interaction: InteractionClient;
  private readonly _memories: MemoriesClient;
  private readonly _participant: ParticipantClient;
  private readonly _settings: SettingsClient;
  private readonly _update: UpdateClient;
  private readonly _version: VersionClient;
  private readonly _voice: VoiceClient;
  private readonly _websocket: WebsocketClient;
  private readonly _locations: LocationsClient;
  private readonly _sentientSimulationsWebsite: SentientSimulationsWebsiteClient;
  private readonly _debug: DebugClient;
  private readonly _sentientSimsAiApi: SentientSimsAiApiClient;
  private readonly _files: FilesClient;

  constructor(apiUrl?: string) {
    const url = apiUrl ?? appApiUrl;

    this._ai = new AIClient(url);
    this._db = new DbClient(url);
    this._interaction = new InteractionClient(url);
    this._memories = new MemoriesClient(url);
    this._participant = new ParticipantClient(url);
    this._settings = new SettingsClient(url);
    this._update = new UpdateClient(url);
    this._version = new VersionClient(url);
    this._voice = new VoiceClient(url);
    this._websocket = new WebsocketClient(url);
    this._locations = new LocationsClient(url);
    this._sentientSimulationsWebsite = new SentientSimulationsWebsiteClient(url);
    this._debug = new DebugClient(url);
    this._sentientSimsAiApi = new SentientSimsAiApiClient(url);
    this._files = new FilesClient(url);
  }

  get ai(): AIClient {
    return this._ai;
  }

  get db(): DbClient {
    return this._db;
  }

  get interaction(): InteractionClient {
    return this._interaction;
  }

  get memories(): MemoriesClient {
    return this._memories;
  }

  get participant(): ParticipantClient {
    return this._participant;
  }

  get settings(): SettingsClient {
    return this._settings;
  }

  get update(): UpdateClient {
    return this._update;
  }

  get version(): VersionClient {
    return this._version;
  }

  get voice(): VoiceClient {
    return this._voice;
  }

  get websocket(): WebsocketClient {
    return this._websocket;
  }

  get locations(): LocationsClient {
    return this._locations;
  }

  get sentientSimulationsWebsite(): SentientSimulationsWebsiteClient {
    return this._sentientSimulationsWebsite;
  }

  get debug(): DebugClient {
    return this._debug;
  }

  get sentientSimsAiApi(): SentientSimsAiApiClient {
    return this._sentientSimsAiApi;
  }

  get files(): FilesClient {
    return this._files;
  }
}
