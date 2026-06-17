import { Request, Response } from 'express';
import log from 'electron-log';
import { MemoryEntity } from '../db/entities/MemoryEntity';
import { CreateMemoryRequest } from '../models/GetMemoryRequest';
import { DatabaseNotLoadedError } from '../exceptions/DatabaseNotLoadedError';
import { ApiContext } from '../services/ApiContext';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class MemoriesController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getMemory = this.getMemory.bind(this);
    this.getMemories = this.getMemories.bind(this);
    this.updateMemory = this.updateMemory.bind(this);
    this.createMemory = this.createMemory.bind(this);
    this.deleteMemory = this.deleteMemory.bind(this);
    this.deleteAllMemories = this.deleteAllMemories.bind(this);
  }

  getMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;
      const result = this.ctx.memoryRepository.getMemory({
        id: Number(memoryId),
      });
      return res.json(result);
    } catch (err) {
      log.error('Error getting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  }

  getMemories(req: Request, res: Response) {
    try {
      const result = this.ctx.memoryRepository.getMemories();
      return res.json(result);
    } catch (err) {
      if (err instanceof DatabaseNotLoadedError) {
        log.debug('Database isnt loaded yet, returning empty list');
        return res.json([]);
      }

      log.error('Error getting memories', err);
      return res.json({ error: errorMessage(err) });
    }
  }

  updateMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;
      const memory = req.body as MemoryEntity;
      memory.id = Number(memoryId);

      this.ctx.memoryRepository.updateMemory(memory);
      return res.json({
        text: `Updated memory with id ${memory.id}`,
      });
    } catch (err) {
      log.error('Error updating memory', err);
      return res.json({ error: errorMessage(err) });
    }
  }

  createMemory(req: Request, res: Response) {
    try {
      const createMemoryRequest = req.body as CreateMemoryRequest;

      const memory = this.ctx.memoryRepository.createMemory(createMemoryRequest);
      return res.json(memory);
    } catch (err) {
      log.error('Error creating memory', err);
      return res.json({ error: errorMessage(err) });
    }
  }

  deleteMemory(req: Request, res: Response) {
    try {
      const { memoryId } = req.params;

      this.ctx.memoryRepository.deleteMemory({ id: Number(memoryId) });
      return res.json({ text: `Deleted memory with id: ${memoryId}` });
    } catch (err) {
      log.error('Error deleting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  }

  deleteAllMemories(req: Request, res: Response) {
    try {
      this.ctx.memoryRepository.deleteAllMemories();
      return res.json({ text: `Deleted all memories` });
    } catch (err) {
      log.error('Error deleting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  }
}
