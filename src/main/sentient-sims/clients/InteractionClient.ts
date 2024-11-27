import { InteractionDTO } from '../db/dto/InteractionDTO';
import { ApiClient } from './ApiClient';

export class InteractionClient extends ApiClient {
  async updateInteraction(interaction: InteractionDTO) {
    return fetch(`${this.apiUrl}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interaction),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getInteractions(): Promise<InteractionDTO[]> {
    const response = await fetch(`${this.apiUrl}/interactions`);
    return response.json();
  }
}
