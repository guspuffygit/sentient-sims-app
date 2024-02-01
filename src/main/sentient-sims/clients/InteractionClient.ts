import { InteractionDTO } from '../db/dto/InteractionDTO';
import { ApiClient } from './ApiClient';

export class InteractionClient extends ApiClient {
  async deleteInteraction(name: string) {
    return fetch(`${this.apiUrl}/interactions/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

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

  async getModifiedInteractions(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/interactions/modified`);
    return response.text();
  }
}
