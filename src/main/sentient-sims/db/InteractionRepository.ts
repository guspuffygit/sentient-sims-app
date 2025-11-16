import log from 'electron-log';
import { InteractionDescription, interactionDescriptions } from '../descriptions/interactionDescriptions';
import { IgnoredInteractionsResponse } from '../models/IgnoredInteractionsResponse';
import { BasicInteraction } from './dto/InteractionDTO';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from '../services/ApiContext';
import fs from 'fs';
import path from 'path';

export class InteractionRepository {
  private ctx: ApiContext;
  private localInteractions?: Map<string, BasicInteraction>;
  private interactions?: Map<string, BasicInteraction>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.loadLocalInteractions();
  }

  async fetchInteractions(): Promise<Map<string, BasicInteraction>> {
    const response = await axiosClient({
      url: '/interactions',
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
      },
    });

    return response.data;
  }

  private loadLocalInteractions() {
    try {
      const sentientSimsFolder = this.ctx.directory.getSentientSimsFolder();
      const localMapPath = path.join(sentientSimsFolder, 'user_interaction_overrides.json');

      if (fs.existsSync(localMapPath)) {
        const fileContent = fs.readFileSync(localMapPath, 'utf-8');
        this.localInteractions = new Map(Object.entries(JSON.parse(fileContent)));
        log.info(`[Override] Local interaction-overrides loaded successfully.`);
      }
    } catch (err) {
      log.error('[Override] Could not load local interactions-overrides.', err);
    }
  }

  async saveLocalInteraction(interaction: BasicInteraction) {
    try {
      const sentientSimsFolder = this.ctx.directory.getSentientSimsFolder();
      const localMapPath = path.join(sentientSimsFolder, 'user_interaction_overrides.json');
      let localOverrides: Record<string, BasicInteraction> = {};
      if (fs.existsSync(localMapPath)) {
        const fileContent = fs.readFileSync(localMapPath, 'utf-8');
        localOverrides = JSON.parse(fileContent);
      }
      localOverrides[interaction.name] = interaction;
      this.localInteractions = new Map(Object.entries(localOverrides));

      fs.writeFileSync(localMapPath, JSON.stringify(localOverrides, null, 2));
      log.info(`[Override] Local interaction '${interaction.name}' saved.`);
    } catch (err) {
      log.error(`[Override] Local Interaction could not be saved`, err);
    }
  }

  async getInteractions(): Promise<Map<string, BasicInteraction>> {
    if (!this.interactions) {
      try {
        this.interactions = new Map(Object.entries(await this.fetchInteractions()));
      } catch (err) {
        log.error(`Unable to fetch interactions from Sentient Sims API`, err);
      }
    }

    return this.interactions || new Map<string, BasicInteraction>();
  }

  async setInteraction(interaction: BasicInteraction) {
    const response = await axiosClient({
      url: '/interactions',
      method: 'POST',
      data: interaction,
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
      },
    });

    const result = response.data;

    this.interactions = new Map(Object.entries(result));

    return result;
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

    if (!this.interactions) {
      this.interactions = new Map(Object.entries(await this.getInteractions()));
    }
    const basicInteraction = this.interactions.get(interactionName);
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
    const allInteractions = await this.getInteractions();
    const ignoredInteractionNames: string[] = [];

    allInteractions.forEach((value, key) => {
      if (value.ignored) {
        ignoredInteractionNames.push(key);
      }
    });

    interactionDescriptions.forEach((description, name) => {
      if (description.ignored) {
        ignoredInteractionNames.push(name.toString());
      }
    });

    return {
      ignoredInteractionNames,
    };
  }
}
