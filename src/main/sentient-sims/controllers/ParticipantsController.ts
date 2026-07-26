import { Request, Response } from 'express';
import log from 'electron-log';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { sendModNotification } from '../websocketServer';
import { ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { SaveGame, ToSaveGameType } from '../models/SaveGame';
import { ApiContext } from '../services/ApiContext';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

type UpdateParticipantBody = {
  description?: string;
  name?: string;
  voiceId?: string;
  voiceName?: string;
};

export class ParticipantsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  getParticipant = (req: Request<{ participantId: string }>, res: Response) => {
    try {
      const { participantId } = req.params;
      const fullName = req.query.fullName as string;
      const result = this.ctx.participantRepository.getParticipant({
        id: participantId,
        fullName,
      });
      return res.json(result);
    } catch (err) {
      log.error('Error getting participant', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getAllParticipants = (req: Request, res: Response) => {
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
      const result = this.ctx.participantRepository.getAllParticipants(saveGame);
      return res.json(result);
    } catch (err) {
      log.error('Error getting all participants', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  updateParticipant = (req: Request<{ participantId: string }>, res: Response) => {
    try {
      const { participantId } = req.params;
      const body = req.body as UpdateParticipantBody;
      const { description, name } = body;
      const participant: ParticipantDTO = {
        id: participantId,
        description,
        name,
      };

      this.ctx.participantRepository.updateParticipant(participant);
      // The mod's participant updates never carry voice fields, so only the app's
      // Sims tab (which always sends voiceId) can change or clear a voice pin
      if ('voiceId' in body) {
        this.ctx.participantRepository.setParticipantVoice(participantId, {
          voiceId: body.voiceId,
          voiceName: body.voiceName,
        });
      }
      res.json({
        text: `Updated participant with id ${participant.id}`,
      });
      sendModNotification({ type: ModWebsocketMessageType.CLEAR_SIM_CACHE });
    } catch (err) {
      log.error('Error updating participant', err);
      res.json({ error: errorMessage(err) });
    }
  };

  deleteParticipant = (req: Request<{ participantId: string }>, res: Response) => {
    try {
      const { participantId } = req.params;
      const participant: ParticipantDTO = { id: participantId };

      this.ctx.participantRepository.deleteParticipant(participant);
      res.json({ text: 'Deleted' });
      sendModNotification({ type: ModWebsocketMessageType.CLEAR_SIM_CACHE });
    } catch (err) {
      log.error('Error deleting participant', err);
      res.json({ error: errorMessage(err) });
    }
  };
}
