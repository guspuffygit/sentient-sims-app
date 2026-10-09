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
  }

  getMemory = (req: Request<{ memoryId: string }>, res: Response) => {
    try {
      const { memoryId } = req.params;
      const result = this.ctx.memoryRepository.getMemory({
        id: memoryId,
      });
      return res.json(result);
    } catch (err) {
      log.error('Error getting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  getMemories = (req: Request, res: Response) => {
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
  };

  updateMemory = (req: Request<{ memoryId: string }>, res: Response) => {
    try {
      const { memoryId } = req.params;
      const memory = req.body as MemoryEntity;
      memory.id = memoryId;

      this.ctx.memoryRepository.updateMemory(memory);
      return res.json({
        text: `Updated memory with id ${memory.id}`,
      });
    } catch (err) {
      log.error('Error updating memory', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  createMemory = (req: Request, res: Response) => {
    try {
      const createMemoryRequest = req.body as CreateMemoryRequest;

      // A solo scene's inner monologue rides the mod's normal memory round-trip (the mod
      // can't send index metadata), so ownership is stamped here: a monologue with exactly
      // one participant is that sim's private thought — no other sim may retrieve it.
      if (
        !createMemoryRequest.index &&
        createMemoryRequest.memory.event_type === 'monologue' &&
        createMemoryRequest.participants.length === 1
      ) {
        createMemoryRequest.index = { owner: createMemoryRequest.participants[0].id };
      }

      const memory = this.ctx.memoryRepository.createMemory(createMemoryRequest);
      if (!memory) {
        // A hygiene rejection (empty, refusal, scaffolding) is a NORMAL outcome, not a
        // fault: the mod treats `error` as fatal and pauses the game (5 UI pauses in the
        // 08-04..08-14 playtest came from this line). `rejected` is the non-fatal shape.
        return res.json({ rejected: true, reason: 'Memory rejected by hygiene gate (empty, refusal, or scaffolding)' });
      }
      return res.json(memory);
    } catch (err) {
      log.error('Error creating memory', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  deleteMemory = (req: Request<{ memoryId: string }>, res: Response) => {
    try {
      const { memoryId } = req.params;

      this.ctx.memoryRepository.deleteMemory({ id: memoryId });
      return res.json({ text: `Deleted memory with id: ${memoryId}` });
    } catch (err) {
      log.error('Error deleting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  };

  deleteAllMemories = (req: Request, res: Response) => {
    try {
      this.ctx.memoryRepository.deleteAllMemories();
      return res.json({ text: `Deleted all memories` });
    } catch (err) {
      log.error('Error deleting memory', err);
      return res.json({ error: errorMessage(err) });
    }
  };
}
