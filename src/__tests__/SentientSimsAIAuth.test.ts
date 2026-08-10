import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { AddressInfo } from 'net';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { mockApiContext } from './util';

function fakeJwt(expDeltaSeconds: number): string {
  const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ exp: Math.floor(Date.now() / 1000) + expDeltaSeconds })}.sig`;
}

const request: OpenAICompatibleRequest = {
  messages: [{ role: 'user', content: 'hello', tokens: 5 }],
  maxResponseTokens: 20,
};

describe('SentientSimsAIService token refresh', () => {
  const ctx = mockApiContext({ port: 25196 });
  let stub: http.Server;
  // Completions succeed only for tokens in this set
  const acceptedTokens = new Set<string>();
  let onUnauthorized: (() => void) | undefined;

  beforeAll(async () => {
    stub = http.createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        if ((req.url ?? '').includes('modelsettings')) {
          res.end(JSON.stringify({}));
          return;
        }
        if ((req.url ?? '').includes('tokenize')) {
          res.end(JSON.stringify({ count: 5, max_model_len: 4096, tokens: [1, 2] }));
          return;
        }
        const auth = req.headers.authentication as string;
        if (!acceptedTokens.has(auth)) {
          onUnauthorized?.();
          res.statusCode = 401;
          res.end(JSON.stringify({ message: 'token is expired' }));
          return;
        }
        res.end(
          JSON.stringify({
            id: 'stub',
            choices: [{ index: 0, message: { role: 'assistant', content: 'generated text' }, finish_reason: 'stop' }],
          }),
        );
      });
    });
    await new Promise<void>((resolve) => {
      stub.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });
    const { port } = stub.address() as AddressInfo;
    ctx.settings.sentientSimsAIEndpoint = `http://127.0.0.1:${port}`;
    ctx.settings.aiApiType = ApiType.SentientSimsAI;
    ctx.settings.sentientSimsAIModel = 'test-model';
  }, 30000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      stub.close(() => {
        resolve();
      });
    });
  });

  it('waits for a renewed token before sending when the stored token is expired', async () => {
    const freshToken = fakeJwt(3600);
    acceptedTokens.clear();
    acceptedTokens.add(freshToken);
    ctx.settings.accessToken = fakeJwt(-3600);

    // Stand in for the renderer answering the refresh request a moment later
    setTimeout(() => {
      ctx.settings.accessToken = freshToken;
    }, 500);

    const service = ctx.getGenerationService(ApiType.SentientSimsAI);
    const response = await service.sentientSimsGenerate(request);

    expect(response.text).toEqual('generated text');
  }, 30000);

  it('retries once when the server rejects a token that gets renewed mid-request', async () => {
    const staleToken = fakeJwt(3600);
    const renewedToken = fakeJwt(7200);
    acceptedTokens.clear();
    acceptedTokens.add(renewedToken);
    ctx.settings.accessToken = staleToken;

    // The server rejecting the call is what reveals the revoked token; the renderer
    // refresh lands while the 401 is in flight
    onUnauthorized = () => {
      ctx.settings.accessToken = renewedToken;
    };
    try {
      const service = ctx.getGenerationService(ApiType.SentientSimsAI);
      const response = await service.sentientSimsGenerate(request);

      expect(response.text).toEqual('generated text');
    } finally {
      onUnauthorized = undefined;
    }
  }, 30000);

  it('surfaces the 401 when no renewed token arrives', async () => {
    acceptedTokens.clear();
    ctx.settings.accessToken = fakeJwt(3600);

    const service = ctx.getGenerationService(ApiType.SentientSimsAI);
    await expect(service.sentientSimsGenerate(request)).rejects.toThrow();
  }, 30000);
});
