import axios from 'axios';
import { ApiClient } from './ApiClient';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';

export class ParticipantClient extends ApiClient {
  async getParticipants(): Promise<ParticipantDTO[]> {
    const response = await axios<ParticipantDTO[]>(`${this.apiUrl}/participants`);
    return response.data;
  }
}
