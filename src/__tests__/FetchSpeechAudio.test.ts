import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express, { json } from 'express';
import { Server } from 'http';
import { errorText, fetchSpeechAudio } from 'renderer/voice/fetchSpeechAudio';
import { testPort } from './util';

const port = testPort();
const base = `http://127.0.0.1:${port}`;
const hits: Record<string, number> = {};
let server: Server;

function request(path: string, timeoutMs = 5000) {
  return { url: `${base}${path}`, headers: { 'Content-Type': 'application/json' }, body: { input: 'Hi' }, timeoutMs };
}

beforeAll(async () => {
  const app = express();
  app.use(json());
  app.use((req, _res, next) => {
    hits[req.path] = (hits[req.path] ?? 0) + 1;
    next();
  });

  app.post('/audio', (req, res) => {
    res.type('audio/wav').send(Buffer.from(JSON.stringify(req.body)));
  });
  app.post('/bad-voice', (_req, res) => {
    res.status(400).json({
      detail: { error: 'validation_error', message: 'Voice bf_nobody not found', type: 'invalid_request_error' },
    });
  });
  app.post('/restarting', (_req, res) => {
    if (hits['/restarting'] === 1) {
      res.status(503).json({ message: 'Service Unavailable' });
    } else {
      res.type('audio/wav').send(Buffer.from('RIFF'));
    }
  });
  app.post('/broken', (_req, res) => {
    res.status(500).json({ detail: { message: 'Model failed to load' } });
  });
  app.post('/gateway-page', (_req, res) => {
    res.status(200).json({ error: 'upstream down' });
  });
  app.post('/hang', () => {});
  app.post('/drop', (req) => {
    req.socket.destroy();
  });

  await new Promise<void>((resolve) => {
    server = app.listen(port, '127.0.0.1', () => {
      resolve();
    });
  });
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

describe('errorText', () => {
  it('reads the message out of a Kokoro-FastAPI error', () => {
    const body = '{"detail":{"error":"validation_error","message":"Voice bf_nobody not found","type":"invalid"}}';
    expect(errorText(body)).toBe('Voice bf_nobody not found');
  });

  it('reads the first problem out of a FastAPI validation error', () => {
    expect(errorText('{"detail":[{"loc":["body","speed"],"msg":"Input should be greater than 0.25"}]}')).toBe(
      'Input should be greater than 0.25',
    );
  });

  it('reads Sentient Sims AI errors', () => {
    expect(errorText('{"message":"Out of credits"}')).toBe('Out of credits');
    expect(errorText('{"error":"Unauthorized"}')).toBe('Unauthorized');
    expect(errorText('{"detail":"Not Found"}')).toBe('Not Found');
  });

  it('leaves a body it cannot read as it is', () => {
    expect(errorText('Bad Gateway')).toBe('Bad Gateway');
    expect(errorText('{"code":7}')).toBe('{"code":7}');
  });
});

describe('fetchSpeechAudio', () => {
  it('posts the body and returns a playable clip', async () => {
    const seen: number[] = [];
    const fetched = await fetchSpeechAudio({
      ...request('/audio'),
      onResponse: (response) => seen.push(response.status),
    });

    expect(fetched).toEqual({ url: expect.stringMatching(/^blob:/) as string });
    expect(seen).toEqual([200]);
    const clip: unknown = 'url' in fetched ? await (await fetch(fetched.url)).json() : undefined;
    expect(clip).toEqual({ input: 'Hi' });
  });

  it('reports a client error with the words the server gave, and does not retry it', async () => {
    const fetched = await fetchSpeechAudio(request('/bad-voice'));

    expect(fetched).toEqual({ failure: { kind: 'status', status: 400, message: 'Voice bf_nobody not found' } });
    expect(hits['/bad-voice']).toBe(1);
  });

  it('retries a server error once and plays the second answer', async () => {
    const fetched = await fetchSpeechAudio(request('/restarting'));

    expect(fetched).toEqual({ url: expect.stringMatching(/^blob:/) as string });
    expect(hits['/restarting']).toBe(2);
  });

  it('gives up after the second server error', async () => {
    const fetched = await fetchSpeechAudio(request('/broken'));

    expect(fetched).toEqual({ failure: { kind: 'status', status: 500, message: 'Model failed to load' } });
    expect(hits['/broken']).toBe(2);
  });

  it('rejects a 200 that carries JSON in place of audio', async () => {
    expect(await fetchSpeechAudio(request('/gateway-page'))).toEqual({ failure: { kind: 'not-audio' } });
  });

  it('stops waiting on a server that never answers', async () => {
    const startedAt = Date.now();
    const fetched = await fetchSpeechAudio(request('/hang', 300));

    expect(fetched).toEqual({ failure: { kind: 'timeout' } });
    expect(Date.now() - startedAt).toBeLessThan(3000);
  });

  it('reports a dropped connection as unreachable', async () => {
    const fetched = await fetchSpeechAudio(request('/drop'));

    expect(fetched).toEqual({ failure: { kind: 'unreachable', reason: expect.any(String) as string } });
  });
});
