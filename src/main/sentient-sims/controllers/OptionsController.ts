import * as fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';

export class OptionsController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.getOptionsStatus = this.getOptionsStatus.bind(this);
  }

  async getOptionsStatus(_req: Request, res: Response) {
    const optionsPath = path.join(this.ctx.directory.getSims4Folder(), 'Options.ini');

    if (!fs.existsSync(optionsPath)) {
      res.status(404).json({ error: `Options.ini not found at ${optionsPath}` });
      return;
    }

    const content = fs.readFileSync(optionsPath, 'utf-8');

    const modsDisabled = parseIniValue(content, 'modsdisabled');
    const scriptModsEnabled = parseIniValue(content, 'scriptmodsenabled');

    res.json({
      modsEnabled: modsDisabled !== null ? modsDisabled === 0 : null,
      scriptModsOn: scriptModsEnabled !== null ? scriptModsEnabled === 1 : null,
    });
  }
}

function parseIniValue(content: string, key: string): number | null {
  const match = content.match(new RegExp(`^${key}\\s*=\\s*(\\d+)`, 'im'));
  return match ? parseInt(match[1], 10) : null;
}
