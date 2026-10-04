import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';
import { SimFactRecord } from '../db/SimFactRepository';

// `names` resolves the sim ids inside the facts, so the caller never has to render a
// bare 64-bit handle at a person.
export type SimFactsResponse = {
  simId: string;
  names: Record<string, string>;
  facts: SimFactRecord[];
};

export type AddFactRequest = {
  predicate: string;
  objectText?: string;
  objectSimId?: string;
  // `game` is refused by the route: it belongs to the dossier alone.
  source?: 'player' | 'told' | 'inferred' | 'reflection';
  confidence?: number;
};

export class SimFactsClient extends ApiClient {
  async getFacts(simId: string, options: { about?: string; history?: boolean } = {}): Promise<SimFactsResponse> {
    const query = new URLSearchParams();
    if (options.about) {
      query.set('about', options.about);
    }
    if (options.history) {
      query.set('all', '1');
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await axiosClient.get<SimFactsResponse>(`${this.apiUrl}/sims/${simId}/facts${suffix}`);
    return response.data;
  }

  async addFact(simId: string, request: AddFactRequest): Promise<{ ok: boolean; id: number }> {
    const response = await axiosClient.post<{ ok: boolean; id: number }>(`${this.apiUrl}/sims/${simId}/facts`, request);
    return response.data;
  }

  // Retires the fact. The row survives as history; nothing here deletes.
  async retireFact(simId: string, factId: number): Promise<void> {
    await axiosClient.delete(`${this.apiUrl}/sims/${simId}/facts/${factId}`);
  }

  async getPredicates(): Promise<string[]> {
    const response = await axiosClient.get<{ predicates: string[] }>(`${this.apiUrl}/facts/predicates`);
    return response.data.predicates;
  }
}
