/* eslint-disable promise/always-return */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { ParticipantRepository } from '../db/ParticipantRepository';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { SaveGame, ToSaveGameType } from '../models/SaveGame';

export class ParticipantsController {
  private readonly participantRepository: ParticipantRepository;

  constructor(participantRepository: ParticipantRepository) {
    this.participantRepository = participantRepository;

    this.getParticipant = this.getParticipant.bind(this);
    this.getAllParticipants = this.getAllParticipants.bind(this);
    this.updateParticipant = this.updateParticipant.bind(this);
    this.deleteParticipant = this.deleteParticipant.bind(this);
  }

  async getParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const fullName = req.query.fullName as string;
      const result = await this.participantRepository.getParticipant({
        id: participantId,
        fullName,
      });
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting participant', err);
      return res.json({ error: err.message });
    }
  }

  async getAllParticipants(req: Request, res: Response) {
    try {
      const saveGameName = req.query.saveGameId as string | undefined;
      const saveGameType = req.query.saveGameType as string | undefined;
      let saveGame: SaveGame | undefined;
      if (saveGameName && saveGameType) {
        saveGame = {
          name: saveGameName,
          type: ToSaveGameType(saveGameType),
        };
      }
      const result = this.participantRepository.getAllParticipants(saveGame);
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting all participants', err);
      return res.json({ error: err.message });
    }
  }

  async updateParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const { description, name } = req.body;
      const participant: ParticipantDTO = {
        id: participantId,
        description,
        name,
      };

      this.participantRepository.updateParticipant(participant);
      res.json({
        text: `Updated participant with id ${participant.id}`,
      });
      sendModNotification({ type: ModWebsocketMessageType.CLEAR_SIM_CACHE });
    } catch (err: any) {
      log.error('Error updating participant', err);
      res.json({ error: err.message });
    }
  }

  async deleteParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const participant: ParticipantDTO = { id: participantId };

      this.participantRepository.deleteParticipant(participant);
      res.json({ text: 'Deleted' });
      sendModNotification({ type: ModWebsocketMessageType.CLEAR_SIM_CACHE });
    } catch (err: any) {
      log.error('Error deleting participant', err);
      res.json({ error: err.message });
    }
  }
}
