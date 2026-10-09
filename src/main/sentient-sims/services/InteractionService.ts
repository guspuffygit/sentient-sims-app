import log from 'electron-log';
import { interactionDescriptions, InteractionDescription } from '../descriptions/interactionDescriptions';
import { BasicInteraction, InteractionDTO } from '../db/dto/InteractionDTO';
import { notifyUnmappedInteractionChanged } from '../util/notifyRenderer';
import { findSavedNames } from '../util/savedNames';
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

  // Thrown rather than returned because this is the one place every online publish
  // passes through - the mapping browser and the old in-game modal both land here - and
  // a caller that forgets to look at a result would publish the name anyway
  static readonly NAMES_FROM_SAVE = 'NAMES_FROM_SAVE';

  // The names in the loaded save that this text would carry out to everyone. Empty when
  // no save is loaded: nothing to compare against is not the same as nothing to find, but
  // refusing every publish while the game is closed would be worse than the risk.
  namesFromSaveIn(text: string | undefined): string[] {
    if (!this.ctx.db.isLoaded()) {
      return [];
    }
    try {
      return findSavedNames(text, this.ctx.participantRepository.getAllNames());
    } catch (err) {
      log.error('[Interactions] Could not check text against the save for names:', err);
      return [];
    }
  }

  async updateUnmappedInteraction(interaction: InteractionDTO, force = false) {
    const names = force ? [] : this.namesFromSaveIn(interaction.action);
    if (names.length > 0) {
      log.warn(`[Interactions] Refused to publish '${interaction.name}': names from this save (${names.join(', ')})`);
      throw new Error(InteractionService.NAMES_FROM_SAVE);
    }
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
