import axios from 'axios';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { ApiClient } from './ApiClient';
import { GetMemoryParticipantsRequest, GetParticipantsForMemoriesRequest } from '../models/GetMemoryRequest';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { MemoryParticipantDTO } from '../db/dto/MemoryParticipantDTO';

export class MemoryClient extends ApiClient {
  async getMemories(): Promise<MemoryEntity[]> {
    const response = await axios<MemoryEntity[]>(`${this.apiUrl}/memories`);
    return response.data;
  }

  async getMemoryParticipants(request: GetMemoryParticipantsRequest): Promise<MemoryParticipantDTO[]> {
    const response = await axios(`${this.apiUrl}/memories/${request.memory_id}/participants`);
    return response.data;
  }

  async getParticipantsForMemoriesRequest(request: GetParticipantsForMemoriesRequest) {
    const response = await axios.post<ParticipantDTO[]>(`${this.apiUrl}/memories/participants`, request);
    return response.data;
  }

  async debugRunCommand(command: string) {
    const response = await axios.post(`${this.apiUrl}/memories/debug-run-command`, {
      command,
    });
    return response.data;
  }
}
