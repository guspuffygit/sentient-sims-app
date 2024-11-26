/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import {
  interactionDescriptions,
  InteractionDescription,
} from '../descriptions/interactionDescriptions';
import { InteractionRepository } from '../db/InteractionRepository';
import { BasicInteraction, InteractionDTO } from '../db/dto/InteractionDTO';
import { notifyUnmappedInteractionChanged } from '../util/notifyRenderer';

export class InteractionService {
  private readonly interactionRepository: InteractionRepository;

  constructor(interactionRepository: InteractionRepository) {
    this.interactionRepository = interactionRepository;
  }

  async getInteractionDescription(
    interactionName: string
  ): Promise<InteractionDescription | undefined> {
    let description = interactionDescriptions.get(interactionName);
    if (!description) {
      description = await this.interactionRepository.getInteraction(
        interactionName
      );
    }

    return description;
  }

  getUnmappedDescriptions(): InteractionDTO[] {
    return [];
  }

  getModifiedUnmappedDescriptions(): InteractionDTO[] {
    return [];
  }

  updateUnmappedInteraction(interaction: InteractionDTO) {
    const basicInteration: BasicInteraction = {
      name: interaction.name,
      action: interaction?.action,
      ignored: interaction?.ignored,
    };
    log.debug(
      `Updated unmapped interaction: ${JSON.stringify(
        basicInteration,
        null,
        2
      )}`
    );
    this.interactionRepository.setInteraction(basicInteration);
    notifyUnmappedInteractionChanged();
  }

  getJsonBlock(): string {
    const modifiedInteractions: { [key: string]: InteractionDescription } = {};

    this.getModifiedUnmappedDescriptions().forEach((interaction) => {
      const description: InteractionDescription = {
        ignored: interaction.ignored,
      };
      if (interaction.action) {
        description.pre_actions = [interaction.action];
      }
      modifiedInteractions[interaction.name] = description;
    });
    const jsonBlock = JSON.stringify(modifiedInteractions, null, 2);
    const lines = jsonBlock.split('\n');

    if (lines.length <= 2) {
      return '';
    }

    // Remove first and last line
    lines.shift();
    lines.pop();

    return lines.join('\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteInteraction(name: string) {
    throw new Error('deleteInteraction not implemented');
  }

  async getIgnoredInteractions() {
    return this.interactionRepository.getIgnoredInteractions();
  }
}
