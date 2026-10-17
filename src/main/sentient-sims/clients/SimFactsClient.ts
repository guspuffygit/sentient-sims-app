import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';
import { SimFactRecord } from '../db/SimFactRepository';

// `names` resolves the sim ids inside the facts, so the caller never has to render a
// bare 64-bit handle at a person.
export type SimFactsResponse = {
  simId: string;
  names: Record<string, string>;
  // The game's Species name (DOG, CAT, ...) for each named sim that is a pet
  species?: Record<string, string>;
  // The live relationship with each sim met (scores and the game's bits), for sorting
  relationships?: Record<string, { friendship?: number; romance?: number; bits?: string[] }>;
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

// `edges` is the subset of `predicates` whose object is another sim; `help` says what
// each predicate means, in the player's words.
export type FactPredicatesResponse = {
  predicates: string[];
  edges: string[];
  help?: Record<string, string>;
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

  // Rewords a fact. The old row is retired and the new one takes its place.
  async editFact(
    simId: string,
    factId: number,
    changes: { objectText?: string },
  ): Promise<{ ok: boolean; id: number }> {
    const response = await axiosClient.put<{ ok: boolean; id: number }>(
      `${this.apiUrl}/sims/${simId}/facts/${factId}`,
      changes,
    );
    return response.data;
  }

  // Retires the fact. The row survives as history; nothing here deletes.
  async retireFact(simId: string, factId: number): Promise<void> {
    await axiosClient.delete(`${this.apiUrl}/sims/${simId}/facts/${factId}`);
  }

  async getPredicates(): Promise<FactPredicatesResponse> {
    const response = await axiosClient.get<FactPredicatesResponse>(`${this.apiUrl}/facts/predicates`);
    return response.data;
  }
}
