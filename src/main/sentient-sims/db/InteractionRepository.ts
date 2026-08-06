import log from 'electron-log';
import { InteractionDescription, interactionDescriptions } from '../descriptions/interactionDescriptions';
import { IgnoredInteractionsResponse } from '../models/IgnoredInteractionsResponse';
import { BasicInteraction, BrowsableInteraction, ShadowedVersion } from './dto/InteractionDTO';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from '../services/ApiContext';
import { notifyOnlineMappingsChanged } from '../util/notifyRenderer';
import { ONLINE_MAPPING_SYNC_INTERVAL_MS, onlineMappingsEqual } from '../util/onlineMappingSync';
import fs from 'fs';
import path from 'path';

const FETCH_RETRY_COOLDOWN_MS = 60_000;
const FETCH_TIMEOUT_MS = 15_000;

export class InteractionRepository {
  private ctx: ApiContext;
  private localInteractions?: Map<string, BasicInteraction>;
  private interactions?: Map<string, BasicInteraction>;
  private lastFetchFailure?: number;
  private syncTimer?: ReturnType<typeof setInterval>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.loadLocalInteractions();
  }

  async fetchInteractions(): Promise<Map<string, BasicInteraction>> {
    const response = await axiosClient<Record<string, BasicInteraction>>({
      url: '/interactions',
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      timeout: FETCH_TIMEOUT_MS,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    });

    return new Map(Object.entries(response.data));
  }

  private getLocalOverridesPath(): string {
    return path.join(this.ctx.directory.getSentientSimsFolder(), 'user_interaction_overrides.json');
  }

  private loadLocalInteractions() {
    try {
      const localMapPath = this.getLocalOverridesPath();

      if (fs.existsSync(localMapPath)) {
        const fileContent = fs.readFileSync(localMapPath, 'utf-8');
        const parsed = JSON.parse(fileContent) as Record<string, BasicInteraction>;
        this.localInteractions = new Map(Object.entries(parsed));
        log.info(`[Override] Local interaction-overrides loaded successfully.`);
      }
    } catch (err) {
      log.error('[Override] Could not load local interactions-overrides.', err);
    }
  }

  private writeLocalInteractions(localOverrides: Record<string, BasicInteraction>) {
    this.localInteractions = new Map(Object.entries(localOverrides));
    fs.writeFileSync(this.getLocalOverridesPath(), JSON.stringify(localOverrides, null, 2));
  }

  private readLocalInteractions(): Record<string, BasicInteraction> {
    const localMapPath = this.getLocalOverridesPath();
    if (fs.existsSync(localMapPath)) {
      const fileContent = fs.readFileSync(localMapPath, 'utf-8');
      return JSON.parse(fileContent) as Record<string, BasicInteraction>;
    }
    return {};
  }

  saveLocalInteraction(interaction: BasicInteraction) {
    if (!interaction.name) {
      throw new Error('Interaction is missing a name, unable to save local override.');
    }

    try {
      const localOverrides = this.readLocalInteractions();
      localOverrides[interaction.name] = interaction;
      this.writeLocalInteractions(localOverrides);
      log.info(`[Override] Local interaction '${interaction.name}' saved.`);
    } catch (err) {
      log.error(`[Override] Local Interaction could not be saved`, err);
      throw err;
    }
  }

  deleteLocalInteraction(interactionName: string) {
    if (!interactionName) {
      throw new Error('Interaction is missing a name, unable to delete local override.');
    }

    try {
      const localOverrides = this.readLocalInteractions();
      const remaining = Object.fromEntries(Object.entries(localOverrides).filter(([name]) => name !== interactionName));
      this.writeLocalInteractions(remaining);
      log.info(`[Override] Local interaction '${interactionName}' deleted.`);
    } catch (err) {
      log.error(`[Override] Local Interaction could not be deleted`, err);
      throw err;
    }
  }

  async getInteractions(): Promise<Map<string, BasicInteraction>> {
    if (this.interactions) {
      return this.interactions;
    }

    if (this.lastFetchFailure && Date.now() - this.lastFetchFailure < FETCH_RETRY_COOLDOWN_MS) {
      return new Map<string, BasicInteraction>();
    }

    try {
      this.interactions = await this.fetchInteractions();
      this.lastFetchFailure = undefined;
      this.scheduleOnlineSync();
    } catch (err) {
      this.lastFetchFailure = Date.now();
      log.error(`Unable to fetch interactions from Sentient Sims API`, err);
    }

    return this.interactions || new Map<string, BasicInteraction>();
  }

  // Online mappings are shared: when a mapper edits one, every running app should pick
  // it up without a restart, so the cache re-syncs in the background once it is in use
  private scheduleOnlineSync() {
    if (this.syncTimer) {
      return;
    }
    this.syncTimer = setInterval(() => {
      void this.syncOnlineInteractions();
    }, ONLINE_MAPPING_SYNC_INTERVAL_MS);
    this.syncTimer.unref();
  }

  async syncOnlineInteractions() {
    try {
      const latest = await this.fetchInteractions();
      if (!this.interactions || !onlineMappingsEqual(this.interactions, latest)) {
        this.interactions = latest;
        notifyOnlineMappingsChanged('interactions');
      }
    } catch (err) {
      // Being offline is normal for a background sync; error-level would nag every interval
      log.debug('[Sync] Unable to refresh online interactions', err);
    }
  }

  /**
   * Every interaction the user can browse and edit, merged from all sources.
   * Precedence matches in-game resolution: local override > online > built-in.
   */
  async getBrowsableInteractions(): Promise<Map<string, BrowsableInteraction>> {
    const browsable = new Map<string, BrowsableInteraction>();

    const builtIns = new Map<string, ShadowedVersion>();
    interactionDescriptions.forEach((description, name) => {
      builtIns.set(name, { action: description.pre_actions?.join('\n'), ignored: description.ignored });
    });

    builtIns.forEach((builtIn, name) => {
      browsable.set(name, { name, action: builtIn.action, ignored: builtIn.ignored, source: 'built-in' });
    });

    const onlineInteractions = await this.getInteractions();
    onlineInteractions.forEach((interaction, name) => {
      const builtIn = builtIns.get(name);
      browsable.set(name, { ...interaction, name, source: 'online', ...(builtIn ? { builtIn } : {}) });
    });

    this.localInteractions?.forEach((interaction, name) => {
      const onlineVersion = onlineInteractions.get(name);
      const builtIn = builtIns.get(name);
      browsable.set(name, {
        ...interaction,
        name,
        source: 'local',
        ...(onlineVersion ? { online: { action: onlineVersion.action, ignored: onlineVersion.ignored } } : {}),
        ...(builtIn ? { builtIn } : {}),
      });
    });

    return browsable;
  }

  async setInteraction(interaction: BasicInteraction) {
    const response = await axiosClient<Record<string, BasicInteraction>>({
      url: '/interactions',
      method: 'POST',
      data: interaction,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    });

    const result = response.data;

    this.interactions = new Map(Object.entries(result));
    this.scheduleOnlineSync();
    notifyOnlineMappingsChanged('interactions');

    return result;
  }

  async deleteInteraction(interaction: BasicInteraction): Promise<void> {
    await axiosClient({
      url: '/interactions',
      method: 'DELETE',
      data: interaction,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    });

    this.interactions?.delete(interaction.name);
    notifyOnlineMappingsChanged('interactions');
  }

  async getInteraction(interactionName: string): Promise<InteractionDescription | undefined> {
    const localOverride = this.localInteractions?.get(interactionName);
    if (localOverride) {
      log.debug(`[Override] Load '${interactionName}' from user_interaction_overrides.json`);
      const interactionDescription: InteractionDescription = {};
      if (localOverride.action) interactionDescription.pre_actions = [localOverride.action];
      if (localOverride.ignored) interactionDescription.ignored = localOverride.ignored;
      return interactionDescription;
    }

    const interactions = await this.getInteractions();
    const basicInteraction = interactions.get(interactionName);
    if (basicInteraction) {
      log.debug(`[Online] Load '${interactionName}' from Sentient Sims API`);
      const interactionDescription: InteractionDescription = {};
      if (basicInteraction.action) interactionDescription.pre_actions = [basicInteraction.action];
      if (basicInteraction.ignored) interactionDescription.ignored = basicInteraction.ignored;
      return interactionDescription;
    }
    return undefined;
  }

  async getIgnoredInteractions(): Promise<IgnoredInteractionsResponse> {
    // An override replaces the lower-precedence interaction entirely, so it can
    // also un-ignore: local override > online > built-in
    const ignoredByName = new Map<string, boolean>();

    interactionDescriptions.forEach((description, name) => {
      ignoredByName.set(name, description.ignored === true);
    });

    (await this.getInteractions()).forEach((interaction, name) => {
      ignoredByName.set(name, interaction.ignored === true);
    });

    this.localInteractions?.forEach((interaction, name) => {
      ignoredByName.set(name, interaction.ignored === true);
    });

    const ignoredInteractionNames: string[] = [];
    ignoredByName.forEach((ignored, name) => {
      if (ignored) {
        ignoredInteractionNames.push(name);
      }
    });

    return {
      ignoredInteractionNames,
    };
  }
}
