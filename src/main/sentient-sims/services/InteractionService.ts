import log from 'electron-log';
import { interactionDescriptions, InteractionDescription } from '../descriptions/interactionDescriptions';
import { InteractionRepository } from '../db/InteractionRepository';
import { BasicInteraction, InteractionDTO } from '../db/dto/InteractionDTO';
import { notifyUnmappedInteractionChanged } from '../util/notifyRenderer';

export class InteractionService {
  private readonly interactionRepository: InteractionRepository;

  constructor(interactionRepository: InteractionRepository) {
    this.interactionRepository = interactionRepository;
  }

  async getInteractionDescription(interactionName: string): Promise<InteractionDescription | undefined> {
    let description = interactionDescriptions.get(interactionName);
    if (!description) {
      description = await this.interactionRepository.getInteraction(interactionName);
    }

    return description;
  }

  async updateUnmappedInteraction(interaction: InteractionDTO) {
    const basicInteration: BasicInteraction = {
      name: interaction.name,
      action: interaction?.action,
      ignored: interaction?.ignored,
    };
    log.debug(`Updated unmapped interaction: ${JSON.stringify(basicInteration, null, 2)}`);
    await this.interactionRepository.setInteraction(basicInteration);
    notifyUnmappedInteractionChanged();
  }

  async getIgnoredInteractions() {
    return this.interactionRepository.getIgnoredInteractions();
  }
}
