/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import {
  interactionDescriptions,
  InteractionDescription,
} from '../descriptions/interactionDescriptions';
import { InteractionRepository } from '../db/InteractionRepository';
import { InteractionDTO } from '../db/dto/InteractionDTO';
import { notifyUnmappedInteractionChanged } from '../util/notifyRenderer';

export class InteractionService {
  private readonly interactionRepository: InteractionRepository;

  constructor(interactionRepository: InteractionRepository) {
    this.interactionRepository = interactionRepository;
  }

  getInteractionDescription(interactionName: string) {
    let description = interactionDescriptions.get(interactionName);
    if (!description) {
      description = this.interactionRepository.getInteraction(interactionName);
    }

    return description;
  }

  getUnmappedDescriptions(): InteractionDTO[] {
    return this.interactionRepository.getAllInteractions();
  }

  getModifiedUnmappedDescriptions(): InteractionDTO[] {
    return this.interactionRepository.getModifiedInteractions();
  }

  updateUnmappedInteraction(interaction: InteractionDTO) {
    log.debug(
      `Updated unmapped interaction: ${JSON.stringify(interaction, null, 2)}`
    );
    this.interactionRepository.updateInteraction(interaction);
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

  deleteInteraction(name: string) {
    this.interactionRepository.deleteInteraction(name);
    notifyUnmappedInteractionChanged();
  }

  getIgnoredInteractions() {
    return this.interactionRepository.getIgnoredInteractions();
  }
}
