import { randomUUID } from 'crypto';
import { Repository } from './Repository';
import { PaintingEntity } from './entities/PaintingEntity';
import { PaintingManifestDTO } from './dto/PaintingManifestDTO';
import { allocateTextureInstanceId } from '../image/paintingInstanceId';

export type CreatePaintingRequest = {
  prompt?: string;
  image: Buffer;
  metadata?: string;
};

export class PaintingRepository extends Repository {
  getManifest(): PaintingManifestDTO[] {
    return this.dbService
      .getDb()
      .prepare('SELECT uuid, instance_id, created_at FROM painting ORDER BY created_at')
      .all() as PaintingManifestDTO[];
  }

  getPaintingByInstanceId(instanceId: string): PaintingEntity | undefined {
    const results = this.dbService
      .getDb()
      .prepare('SELECT * FROM painting WHERE instance_id = ?')
      .all([instanceId]) as PaintingEntity[];
    return results.length > 0 ? results[0] : undefined;
  }

  instanceIdExists(instanceId: string): boolean {
    const results = this.dbService.getDb().prepare('SELECT 1 FROM painting WHERE instance_id = ?').all([instanceId]);
    return results.length > 0;
  }

  createPainting(createPaintingRequest: CreatePaintingRequest): PaintingEntity {
    const uuid = randomUUID();
    const instanceId = allocateTextureInstanceId(uuid, (candidate) => this.instanceIdExists(candidate));
    this.dbService
      .getDb()
      .prepare('INSERT INTO painting(uuid, instance_id, prompt, image, metadata) VALUES(?, ?, ?, ?, ?)')
      .run([
        uuid,
        instanceId,
        createPaintingRequest.prompt ?? null,
        createPaintingRequest.image,
        createPaintingRequest.metadata ?? null,
      ]);
    return this.getPaintingByInstanceId(instanceId) as PaintingEntity;
  }
}
