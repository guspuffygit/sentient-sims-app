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
});
