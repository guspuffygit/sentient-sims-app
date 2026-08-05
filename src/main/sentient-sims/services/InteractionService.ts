import log from 'electron-log';
import { interactionDescriptions, InteractionDescription } from '../descriptions/interactionDescriptions';
import { BasicInteraction, InteractionDTO } from '../db/dto/InteractionDTO';
import { notifyUnmappedInteractionChanged } from '../util/notifyRenderer';
import { ApiContext } from './ApiContext';

export class InteractionService {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  async getInteractionDescription(interactionName: string): Promise<InteractionDescription | undefined> {
    // Local and online overrides win over the built-in descriptions so that
    // edits made in the mapping browser actually take effect in-game
    const description = await this.ctx.interactionRepository.getInteraction(interactionName);

    return description ?? interactionDescriptions.get(interactionName);
  }

  async updateUnmappedInteraction(interaction: InteractionDTO) {
    const basicInteration: BasicInteraction = {
      name: interaction.name,
      action: interaction.action,
      ignored: interaction.ignored,
      sub: interaction.sub,
    };
    log.debug(`Updated unmapped interaction: ${JSON.stringify(basicInteration, null, 2)}`);
    await this.ctx.interactionRepository.setInteraction(basicInteration);
    notifyUnmappedInteractionChanged();
  }

  async getIgnoredInteractions() {
    return this.ctx.interactionRepository.getIgnoredInteractions();
  }
}
