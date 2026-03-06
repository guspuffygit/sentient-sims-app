import '@testing-library/jest-dom';
import * as fs from 'fs';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { runApi } from 'main/sentient-sims/api';
import { mockApiContext } from './util';

describe('OptionsController', () => {
  const ctx = mockApiContext({ port: 25199 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: any) => (err ? reject(err) : resolve()));
    });
  });

  it('returns 404 when Options.ini does not exist', async () => {
    const res = await fetch(`${apiUrl}/options/status`);
    expect(res.status).toBe(404);
  });

  it('returns modsEnabled and scriptModsOn when both settings present', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    fs.mkdirSync(sims4Folder, { recursive: true });
    fs.writeFileSync(`${sims4Folder}/Options.ini`, 'modsdisabled = 0\nscriptmodsenabled = 1\n');

    const res = await fetch(`${apiUrl}/options/status`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: true, scriptModsOn: true });
  });

  it('returns false values when mods are disabled', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    fs.writeFileSync(`${sims4Folder}/Options.ini`, 'modsdisabled = 1\nscriptmodsenabled = 0\n');

    const res = await fetch(`${apiUrl}/options/status`);
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: false, scriptModsOn: false });
  });

  it('returns null for missing settings', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    fs.writeFileSync(`${sims4Folder}/Options.ini`, 'someothersetting = 5\n');

    const res = await fetch(`${apiUrl}/options/status`);
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: null, scriptModsOn: null });
  });

  it('fix returns 404 when Options.ini does not exist', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    const optionsPath = `${sims4Folder}/Options.ini`;
    if (fs.existsSync(optionsPath)) fs.unlinkSync(optionsPath);

    const res = await fetch(`${apiUrl}/options/fix`, { method: 'POST' });
    expect(res.status).toBe(404);
  });

  it('fix updates existing wrong values', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    fs.mkdirSync(sims4Folder, { recursive: true });
    fs.writeFileSync(`${sims4Folder}/Options.ini`, 'modsdisabled = 1\nscriptmodsenabled = 0\n');

    const res = await fetch(`${apiUrl}/options/fix`, { method: 'POST' });
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: true, scriptModsOn: true });

    const content = fs.readFileSync(`${sims4Folder}/Options.ini`, 'utf-8');
    expect(content).toContain('modsdisabled = 0');
    expect(content).toContain('scriptmodsenabled = 1');
  });

  it('fix adds missing settings', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    fs.writeFileSync(`${sims4Folder}/Options.ini`, 'someothersetting = 5\n');

    const res = await fetch(`${apiUrl}/options/fix`, { method: 'POST' });
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: true, scriptModsOn: true });

    const content = fs.readFileSync(`${sims4Folder}/Options.ini`, 'utf-8');
    expect(content).toContain('someothersetting = 5');
    expect(content).toContain('modsdisabled = 0');
    expect(content).toContain('scriptmodsenabled = 1');
  });

  it('fix preserves already correct values', async () => {
    const sims4Folder = ctx.directory.getSims4Folder();
    const original = 'modsdisabled = 0\nscriptmodsenabled = 1\n';
    fs.writeFileSync(`${sims4Folder}/Options.ini`, original);

    const res = await fetch(`${apiUrl}/options/fix`, { method: 'POST' });
    const body = await res.json();
    expect(body).toEqual({ modsEnabled: true, scriptModsOn: true });

    const content = fs.readFileSync(`${sims4Folder}/Options.ini`, 'utf-8');
    expect(content).toBe(original);
  });
});
