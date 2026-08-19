import * as fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import AdmZip from 'adm-zip';
import { mockApiContext } from './util';

// Every S3 GetObject resolves through this so tests can serve different zip
// content per release type and slow the stream down to force overlap windows
const s3 = vi.hoisted(() => ({
  send: vi.fn<(command: { input: { Key: string } }) => Promise<{ Body: Readable }>>(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = s3.send;
  },
  GetObjectCommand: class {
    input: { Key: string };

    constructor(input: { Key: string }) {
      this.input = input;
    }
  },
}));

const credentials = {
  accessKeyId: 'test',
  secretAccessKey: 'test',
};

function buildModZip(marker: string): Buffer {
  const zip = new AdmZip();
  // Big enough to span many stream chunks, like the real ~15MB artifact
  const scriptContent = Buffer.alloc(256 * 1024, marker);
  zip.addFile('sentient-sims/sentient-sims.ts4script', scriptContent);
  zip.addFile('sentient-sims/sentient-sims.package', Buffer.from(`package-${marker}`));
  zip.addFile('sentient-sims/mod-version.json', Buffer.from(JSON.stringify({ version: marker })));
  return zip.toBuffer();
}

function slowStream(buffer: Buffer, chunkSize = 8 * 1024): Readable {
  let offset = 0;
  return new Readable({
    read() {
      setImmediate(() => {
        if (offset >= buffer.length) {
          this.push(null);
        } else {
          this.push(buffer.subarray(offset, offset + chunkSize));
          offset += chunkSize;
        }
      });
    },
  });
}

function serveZips(zipsByType: Record<string, Buffer>) {
  s3.send.mockImplementation((command) => {
    const type = command.input.Key.replace(/^sentient-sims-/, '').replace(/\.zip$/, '');
    if (!(type in zipsByType)) {
      return Promise.reject(new Error(`No test zip for ${command.input.Key}`));
    }
    return Promise.resolve({ Body: slowStream(zipsByType[type]) });
  });
}

function installedVersion(ctx: ReturnType<typeof mockApiContext>): string {
  const raw = fs.readFileSync(ctx.directory.getModVersionFile(), 'utf-8');
  return (JSON.parse(raw) as { version: string }).version;
}

describe('UpdateService', () => {
  beforeEach(() => {
    s3.send.mockReset();
  });

  it('installs the mod from the release zip', async () => {
    const ctx = mockApiContext();
    serveZips({ main: buildModZip('aaaa') });

    await ctx.update.updateMod({ type: 'main', credentials });

    const folder = ctx.directory.getSentientSimsFolder();
    expect(fs.readdirSync(folder)).toEqual(
      expect.arrayContaining(['sentient-sims.ts4script', 'sentient-sims.package', 'mod-version.json']),
    );
    expect(installedVersion(ctx)).toEqual('aaaa');
    // The extracted script survives a byte-for-byte comparison — the corruption
    // this service used to produce showed up here as interleaved downloads
    const script = fs.readFileSync(path.join(folder, 'sentient-sims.ts4script'));
    expect(script.equals(Buffer.alloc(256 * 1024, 'aaaa'))).toBe(true);
  });

  it('joins concurrent updates for the same release into one download', async () => {
    const ctx = mockApiContext();
    serveZips({ main: buildModZip('bbbb') });

    await Promise.all([
      ctx.update.updateMod({ type: 'main', credentials }),
      ctx.update.updateMod({ type: 'main', credentials }),
      ctx.update.updateMod({ type: 'main', credentials }),
    ]);

    expect(s3.send).toHaveBeenCalledTimes(1);
    expect(installedVersion(ctx)).toEqual('bbbb');
  });

  it('serializes concurrent updates for different releases without corrupting either', async () => {
    const ctx = mockApiContext();
    serveZips({ main: buildModZip('cccc'), develop: buildModZip('dddd') });

    await Promise.all([
      ctx.update.updateMod({ type: 'main', credentials }),
      ctx.update.updateMod({ type: 'develop', credentials }),
    ]);

    expect(s3.send).toHaveBeenCalledTimes(2);
    // develop queued behind main, so it wins the final state — intact
    expect(installedVersion(ctx)).toEqual('dddd');
    const script = fs.readFileSync(path.join(ctx.directory.getSentientSimsFolder(), 'sentient-sims.ts4script'));
    expect(script.equals(Buffer.alloc(256 * 1024, 'dddd'))).toBe(true);
  });

  it('runs again after a completed update instead of joining a finished one', async () => {
    const ctx = mockApiContext();
    serveZips({ main: buildModZip('eeee') });
    await ctx.update.updateMod({ type: 'main', credentials });

    serveZips({ main: buildModZip('ffff') });
    await ctx.update.updateMod({ type: 'main', credentials });

    expect(s3.send).toHaveBeenCalledTimes(2);
    expect(installedVersion(ctx)).toEqual('ffff');
  });

  it('keeps an existing Scripts folder authoritative over the packaged ts4script', async () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsScriptsFolder(), { recursive: true });
    serveZips({ main: buildModZip('gggg') });

    await ctx.update.updateMod({ type: 'main', credentials });

    const folder = ctx.directory.getSentientSimsFolder();
    expect(fs.existsSync(path.join(folder, 'sentient-sims.ts4script'))).toBe(false);
    expect(fs.existsSync(path.join(folder, 'sentient-sims.package'))).toBe(true);
  });

  it('reports a friendly error when the download fails and recovers on retry', async () => {
    const ctx = mockApiContext();
    s3.send.mockRejectedValueOnce(new Error('network down'));

    await expect(ctx.update.updateMod({ type: 'main', credentials })).rejects.toThrow(/check your internet connection/);

    serveZips({ main: buildModZip('hhhh') });
    await ctx.update.updateMod({ type: 'main', credentials });
    expect(installedVersion(ctx)).toEqual('hhhh');
  });

  it('reports a friendly error when the stream dies mid-download', async () => {
    const ctx = mockApiContext();
    s3.send.mockImplementation(() => {
      const dying = new Readable({
        read() {
          this.push(Buffer.alloc(1024));
          this.destroy(new Error('connection reset'));
        },
      });
      return Promise.resolve({ Body: dying });
    });

    await expect(ctx.update.updateMod({ type: 'main', credentials })).rejects.toThrow(/Unable to save the mod update/);
    // Nothing half-installed
    expect(fs.existsSync(ctx.directory.getModVersionFile())).toBe(false);
  });
});
