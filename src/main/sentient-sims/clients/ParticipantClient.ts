import { ApiClient } from './ApiClient';
import { ParticipantDTO } from '../db/dto/ParticipantDTO';
import { SaveGameType } from '../models/SaveGame';
import { axiosClient } from './AxiosClient';

export class ParticipantClient extends ApiClient {
  /**
   * GET /participants
   * Retrieves all participants, optionally filtered by save game.
   */
  async getParticipants(saveGameId?: string, saveGameType?: SaveGameType): Promise<ParticipantDTO[]> {
    const params: Record<string, string> = {};
    if (saveGameId && saveGameType) {
      params.saveGameId = saveGameId;
      params.saveGameType = saveGameType.toString();
    }

    const response = await axiosClient<ParticipantDTO[]>(`${this.apiUrl}/participants`, { params });
    return response.data;
  }

  /**
   * GET /participants/:participantId
   * Retrieves a single participant by ID.
   */
  async getParticipant(participantId: string, fullName?: string): Promise<ParticipantDTO> {
    const params: Record<string, string> = {};
    if (fullName) params.fullName = fullName;

    const response = await axiosClient<ParticipantDTO>(`${this.apiUrl}/participants/${participantId}`, { params });
    return response.data;
  }

  /**
   * POST /participants/:participantId
   * Updates a participant's name or description.
   */
  async updateParticipant(participant: ParticipantDTO): Promise<{ text: string }> {
    const response = await axiosClient.post<{ text: string }>(
      `${this.apiUrl}/participants/${participant.id}`,
      participant,
    );
    return response.data;
  }

  /**
   * DELETE /participants/:participantId
   * Deletes a participant.
   */
  async deleteParticipant(participantId: string): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/participants/${participantId}`);
    return response.data;
  }
}
