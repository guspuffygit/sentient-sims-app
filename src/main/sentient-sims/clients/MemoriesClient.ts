import { MemoryEntity } from '../db/entities/MemoryEntity';
import { CreateMemoryRequest } from '../models/GetMemoryRequest';
import { ApiClient } from './ApiClient';
import { axiosClient } from './AxiosClient';

export class MemoriesClient extends ApiClient {
  /**
   * GET /memories
   * Retrieves all memories.
   */
  async getMemories(): Promise<MemoryEntity[]> {
    const response = await axiosClient.get<MemoryEntity[]>(`${this.apiUrl}/memories`);
    return response.data;
  }

  /**
   * GET /memories/:memoryId
   * Retrieves a specific memory by ID.
   */
  async getMemory(memoryId: number): Promise<MemoryEntity> {
    const response = await axiosClient.get<MemoryEntity>(`${this.apiUrl}/memories/${memoryId}`);
    return response.data;
  }

  /**
   * POST /memories
   * Creates a new memory.
   */
  async createMemory(request: CreateMemoryRequest): Promise<MemoryEntity> {
    const response = await axiosClient.post<MemoryEntity>(`${this.apiUrl}/memories`, request);
    return response.data;
  }

  /**
   * POST /memories/:memoryId
   * Updates an existing memory.
   */
  async updateMemory(memory: MemoryEntity): Promise<{ text: string }> {
    if (!memory.id) {
      throw new Error('Memory ID is required to update a memory.');
    }
    const response = await axiosClient.post<{ text: string }>(`${this.apiUrl}/memories/${memory.id}`, memory);
    return response.data;
  }

  /**
   * DELETE /memories/:memoryId
   * Deletes a specific memory by ID.
   */
  async deleteMemory(memoryId: number): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/memories/${memoryId}`);
    return response.data;
  }

  /**
   * DELETE /memories
   * Deletes all memories.
   */
  async deleteAllMemories(): Promise<{ text: string }> {
    const response = await axiosClient.delete<{ text: string }>(`${this.apiUrl}/memories`);
    return response.data;
  }
}
