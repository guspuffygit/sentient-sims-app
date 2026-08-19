import fs from 'fs';
import path from 'path';
import { describe, test, expect } from 'vitest';
import { mockApiContext } from './util';

const MOUNT_BLOCK = ['Priority 500', 'DirectoryFiles sentient-sims/paintings autoupdate', 'FileType 0x00b2d882 dds'];

function cfgPath(ctx: ReturnType<typeof mockApiContext>) {
  return path.join(ctx.directory.getModsFolder(), 'Resource.cfg');
}

describe('PaintingMountService', () => {
  test('creates paintings folder and cfg with vanilla rules when nothing exists', () => {
    const ctx = mockApiContext();

    ctx.paintingMount.ensureMount();

    expect(fs.existsSync(ctx.paintingMount.getPaintingsFolder())).toBe(true);
    const content = fs.readFileSync(cfgPath(ctx), 'utf8');
    // A cfg we create must keep .package mods loading
    expect(content).toContain('PackedFile *.package');
    expect(content).toContain('PackedFile */*/*/*/*/*.package');
    MOUNT_BLOCK.forEach((line) => {
      expect(content).toContain(line);
    });
  });

  test('appends to an existing cfg without touching its content', () => {
    const ctx = mockApiContext();
    const existing = 'Priority 500\nPackedFile *.package\n';
    fs.mkdirSync(ctx.directory.getModsFolder(), { recursive: true });
    fs.writeFileSync(cfgPath(ctx), existing);

    ctx.paintingMount.ensureMount();

    const content = fs.readFileSync(cfgPath(ctx), 'utf8');
    expect(content.startsWith(existing)).toBe(true);
    MOUNT_BLOCK.forEach((line) => {
      expect(content).toContain(line);
    });
    // Must not duplicate the vanilla rules the user already has
    expect(content.match(/PackedFile \*\.package/g)).toHaveLength(1);
  });

  test('is idempotent', () => {
    const ctx = mockApiContext();

    ctx.paintingMount.ensureMount();
    const first = fs.readFileSync(cfgPath(ctx), 'utf8');
    ctx.paintingMount.ensureMount();

    expect(fs.readFileSync(cfgPath(ctx), 'utf8')).toEqual(first);
  });
});
