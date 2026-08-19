import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { ApiContext } from './ApiContext';

// The game reads Mods/Resource.cfg once at boot, and never rewrites the file
// if it already exists — so this must run before the game launches (app
// startup and mod install both qualify).
const MOUNT_DIRECTIVE = 'DirectoryFiles sentient-sims/paintings';

const MOUNT_BLOCK = ['', 'Priority 500', `${MOUNT_DIRECTIVE} autoupdate`, 'FileType 0x00b2d882 dds', ''].join('\n');

// If the file is missing the game would regenerate it with these rules at
// boot, but it treats an existing file as authoritative — so when we create
// it ourselves we must include them or every .package mod stops loading.
const VANILLA_RULES = [
  'Priority 500',
  'PackedFile *.package',
  'PackedFile */*.package',
  'PackedFile */*/*.package',
  'PackedFile */*/*/*.package',
  'PackedFile */*/*/*/*.package',
  'PackedFile */*/*/*/*/*.package',
  '',
].join('\n');

export class PaintingMountService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  // Mount Mods/sentient-sims/paintings into the game's resource system:
  // create the directory and append the DirectoryFiles block to
  // Mods/Resource.cfg. Idempotent; safe while the game is running (the cfg
  // is only read at boot, and the mod tolerates a missing directory).
  ensureMount(): void {
    const modsFolder = this.ctx.directory.getModsFolder();
    fs.mkdirSync(this.getPaintingsFolder(), { recursive: true });

    const cfgPath = path.join(modsFolder, 'Resource.cfg');
    const content = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf8') : VANILLA_RULES;
    if (content.includes(MOUNT_DIRECTIVE)) {
      return;
    }
    fs.writeFileSync(cfgPath, content + MOUNT_BLOCK);
    log.info(`Added paintings texture mount to ${cfgPath}`);
  }

  getPaintingsFolder(): string {
    return path.join(this.ctx.directory.getSentientSimsFolder(), 'paintings');
  }
}
