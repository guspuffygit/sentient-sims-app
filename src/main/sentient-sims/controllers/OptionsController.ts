import * as fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';

export class OptionsController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
    this.getOptionsStatus = this.getOptionsStatus.bind(this);
    this.fixOptions = this.fixOptions.bind(this);
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
  async fixOptions(_req: Request, res: Response) {
    const optionsPath = path.join(this.ctx.directory.getSims4Folder(), 'Options.ini');

    if (!fs.existsSync(optionsPath)) {
      res.status(404).json({ error: `Options.ini not found at ${optionsPath}` });
      return;
    }

    let content = fs.readFileSync(optionsPath, 'utf-8');

    content = setIniValue(content, 'modsdisabled', 0);
    content = setIniValue(content, 'scriptmodsenabled', 1);

    fs.writeFileSync(optionsPath, content);

    res.json({ modsEnabled: true, scriptModsOn: true });
  }
}

function setIniValue(content: string, key: string, value: number): string {
  const regex = new RegExp(`^(${key}\\s*=\\s*)\\d+`, 'im');
  if (regex.test(content)) {
    return content.replace(regex, `$1${value}`);
  }
  const trimmed = content.endsWith('\n') ? content : `${content}\n`;
  return `${trimmed}${key} = ${value}\n`;
}

function parseIniValue(content: string, key: string): number | null {
  const match = content.match(new RegExp(`^${key}\\s*=\\s*(\\d+)`, 'im'));
  return match ? parseInt(match[1], 10) : null;
}
