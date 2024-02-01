/* eslint-disable class-methods-use-this */
import {
  InteractionDescription,
  interactionDescriptions,
} from '../descriptions/interactionDescriptions';
import { IgnoredInteractionsResponse } from '../models/IgnoredInteractionsResponse';
import { InteractionDTO } from './dto/InteractionDTO';

export class InteractionRepository {
  private readonly interactions: {
    [key: string]: InteractionDTO;
  } = {};

  updateInteraction(interaction: InteractionDTO) {
    this.interactions[interaction.name] = interaction;
  }

  deleteInteraction(name: string) {
    if (name in this.interactions) {
      delete this.interactions[name];
    }
  }

  getAllInteractions(): InteractionDTO[] {
    return Object.values(this.interactions);
  }

  getInteraction(name: string): InteractionDescription | undefined {
    if (name in this.interactions) {
      const interactionDescription: InteractionDescription = {};
      const interaction: InteractionDTO = this.interactions[name];

      if (interaction.action) {
        interactionDescription.pre_actions = [interaction.action];
      }
      if (interaction.ignored) {
        interactionDescription.ignored = interaction.ignored;
      }

      return interactionDescription;
    }

    return undefined;
  }

  getModifiedInteractions(): InteractionDTO[] {
    return this.getAllInteractions().filter(
      (interaction) =>
        interaction.action !== undefined || interaction.ignored !== undefined
    );
  }

  getIgnoredInteractions(): IgnoredInteractionsResponse {
    const ignoredInteractionNames = this.getAllInteractions()
      .filter((i) => i.ignored)
      .map((i) => i.name);

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
