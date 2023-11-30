/* eslint-disable promise/always-return */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { ParticipantRepository } from '../db/ParticipantRepository';
import { ParticipantEntity } from '../db/entities/ParticipantEntity';
import { GetParticipantsRequest } from '../models/GetParticipantsRequest';

export class ParticipantsController {
  private readonly participantRepository: ParticipantRepository;

  constructor(participantRepository: ParticipantRepository) {
    this.participantRepository = participantRepository;

    this.getParticipant = this.getParticipant.bind(this);
    this.getParticipants = this.getParticipants.bind(this);
    this.updateParticipant = this.updateParticipant.bind(this);
    this.deleteParticipant = this.deleteParticipant.bind(this);
  }

  async getParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const fullName = req.query.fullName as string;
      const result = await this.participantRepository.getParticipant({
        id: Number(participantId),
        fullName,
      });
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting participant', err);
      return res.json({ error: err.message });
    }
  }

  async getParticipants(req: Request, res: Response) {
    try {
      const getParticipantsRequest: GetParticipantsRequest = req.body;
      const result = await this.participantRepository.getParticipants(
        getParticipantsRequest
      );
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting participants', err);
      return res.json({ error: err.message });
    }
  }

  async updateParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const { description } = req.body;
      const participant: ParticipantEntity = {
        id: Number(participantId),
        description,
      };

      this.participantRepository.updateParticipant(participant);
      return res.json({
        text: `Updated participant with id ${participant.id}`,
      });
    } catch (err: any) {
      log.error('Error updating participant', err);
      return res.json({ error: err.message });
    }
  }

  async deleteParticipant(req: Request, res: Response) {
    try {
      const { participantId } = req.params;
      const participant: ParticipantEntity = { id: Number(participantId) };

      this.participantRepository.deleteParticipant(participant);
      return res.json({ text: 'Deleted' });
    } catch (err: any) {
      log.error('Error deleting participant', err);
      return res.json({ error: err.message });
    }
  }
}
