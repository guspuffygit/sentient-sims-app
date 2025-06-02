/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import {
  InteractionDescription,
  interactionDescriptions,
} from '../descriptions/interactionDescriptions';
import { IgnoredInteractionsResponse } from '../models/IgnoredInteractionsResponse';
import { SettingsService } from '../services/SettingsService';
import { BasicInteraction } from './dto/InteractionDTO';
import axiosClient from '../clients/AxiosClient';

export class InteractionRepository {
  private settingsService: SettingsService;

  private interactions?: Map<string, BasicInteraction>;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  async fetchInteractions(): Promise<Map<string, BasicInteraction>> {
    const response = await axiosClient({
      url: '/interactions',
    });

    return response.data;
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
    const response = await axiosClient({
      url: '/interactions',
      method: 'POST',
      data: interaction,
    });

    const result = response.data;

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
