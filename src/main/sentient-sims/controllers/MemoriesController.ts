/* eslint-disable promise/always-return */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { MemoryRepository } from '../db/MemoryRepository';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { CreateMemoryRequest } from '../models/GetMemoryRequest';
import { DatabaseNotLoadedError } from '../exceptions/DatabaseNotLoadedError';

export class MemoriesController {
  private readonly memoryRepository: MemoryRepository;

  constructor(memoryRepository: MemoryRepository) {
    this.memoryRepository = memoryRepository;

    this.getMemory = this.getMemory.bind(this);
    this.getMemories = this.getMemories.bind(this);
    this.updateMemory = this.updateMemory.bind(this);
    this.createMemory = this.createMemory.bind(this);
    this.deleteMemory = this.deleteMemory.bind(this);
    this.deleteAllMemories = this.deleteAllMemories.bind(this);
  }

  async getMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;
      const result = this.memoryRepository.getMemory({
        id: Number(memoryId),
      });
      return res.json(result);
    } catch (err: any) {
      log.error('Error getting memory', err);
      return res.json({ error: err.message });
    }
  }

  async getMemories(req: Request, res: Response) {
    try {
      const result = this.memoryRepository.getMemories();
      return res.json(result);
    } catch (err: any) {
      if (err instanceof DatabaseNotLoadedError) {
        log.debug('Database isnt loaded yet, returning empty list');
        return res.json([]);
      }

      log.error('Error getting memories', err);
      return res.json({ error: err.message });
    }
  }

  async updateMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;
      const memory: MemoryEntity = req.body;
      memory.id = Number(memoryId);

      this.memoryRepository.updateMemory(memory);
      return res.json({
        text: `Updated memory with id ${memory.id}`,
      });
    } catch (err: any) {
      log.error('Error updating memory', err);
      return res.json({ error: err.message });
    }
  }

  async createMemory(req: Request, res: Response) {
    try {
      const createMemoryRequest: CreateMemoryRequest = req.body;

      const memory = this.memoryRepository.createMemory(createMemoryRequest);
      return res.json(memory);
    } catch (err: any) {
      log.error('Error creating memory', err);
      return res.json({ error: err.message });
    }
  }

  async deleteMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;

      this.memoryRepository.deleteMemory({ id: Number(memoryId) });
      return res.json({ text: `Deleted memory with id: ${memoryId}` });
    } catch (err: any) {
      log.error('Error deleting memory', err);
      return res.json({ error: err.message });
    }
  }

  async deleteAllMemories(req: Request, res: Response) {
    try {
      this.memoryRepository.deleteAllMemories();
      return res.json({ text: `Deleted all memories` });
    } catch (err: any) {
      log.error('Error deleting memory', err);
      return res.json({ error: err.message });
    }
  }
}
