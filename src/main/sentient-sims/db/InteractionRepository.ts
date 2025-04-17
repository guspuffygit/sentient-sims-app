/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import {
  InteractionDescription,
  interactionDescriptions,
} from '../descriptions/interactionDescriptions';
import { IgnoredInteractionsResponse } from '../models/IgnoredInteractionsResponse';
import { SettingsEnum } from '../models/SettingsEnum';
import { SettingsService } from '../services/SettingsService';
import { BasicInteraction } from './dto/InteractionDTO';
import { fetchWithRetries } from '../util/fetchWithRetries';

export class InteractionRepository {
  private settingsService: SettingsService;

  private interactions?: Map<string, BasicInteraction>;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async fetchInteractions(): Promise<Map<string, BasicInteraction>> {
    const url = `${this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    )}/interactions`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetchWithRetries(url, {
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
    });

    return response.json();
  }

  async getInteractions(): Promise<Map<string, BasicInteraction>> {
    if (!this.interactions) {
      try {
        this.interactions = new Map(
          Object.entries(await this.fetchInteractions()),
        );
      } catch (err) {
        log.error(`Unable to fetch interactions from Sentient Sims API`, err);
      }
    }

    return new Map<string, BasicInteraction>();
  }

  async setInteraction(interaction: BasicInteraction) {
    const url = `${this.settingsService.get(
      SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    )}/interactions`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetchWithRetries(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify(interaction),
    });

    const result = await response.json();

    this.interactions = new Map(Object.entries(result));

    return result;
  }

  async getInteraction(
    interactionName: string,
  ): Promise<InteractionDescription | undefined> {
    if (!this.interactions) {
      this.interactions = new Map(Object.entries(await this.getInteractions()));
    }

    const basicInteraction = this.interactions.get(interactionName);

    if (basicInteraction) {
      const interactionDescription: InteractionDescription = {};

      if (basicInteraction?.action) {
        interactionDescription.pre_actions = [basicInteraction.action];
      }
      if (basicInteraction?.ignored) {
        interactionDescription.ignored = basicInteraction.ignored;
      }

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
