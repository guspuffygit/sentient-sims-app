import { InteractionDTO } from '../db/dto/InteractionDTO';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class InteractionClient extends ApiClient {
  async updateInteraction(interaction: InteractionDTO) {
    return axiosClient.post(`${this.apiUrl}/interactions`, interaction);
  }

  async getInteractions(): Promise<InteractionDTO[]> {
    const response = await axiosClient<InteractionDTO[]>(`${this.apiUrl}/interactions`);
    return response.data;
  }
}
