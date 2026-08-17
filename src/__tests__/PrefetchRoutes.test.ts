import { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { mockApiContext } from './util';

describe('interaction prefetch routes', () => {
  const ctx = mockApiContext({ port: 25203 });
  const apiUrl = `http://localhost:${ctx.port}`;
  const event = { event_type: 'interaction', interaction_name: 'Chat' };
  let server: Server;

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }

  beforeAll(() => {
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  it('registers prefetch, claim, finalize, and cancel while preserving the old route', async () => {
    const prefetch = vi
      .spyOn(ctx.generationQueue, 'prefetch')
      .mockResolvedValue({ status: 'queued', pre_action_text: 'Alex waves' });
    const play = vi.fn();
    const claim = vi.spyOn(ctx.generationQueue, 'claim').mockResolvedValue({
      result: { status: InteractionEventStatus.GENERATED, text: 'Alex: Hi.' },
      play,
    });
    const finalize = vi.spyOn(ctx.generationQueue, 'finalize').mockReturnValue(true);
    const cancel = vi.spyOn(ctx.generationQueue, 'cancel').mockReturnValue(true);
    const oldRoute = vi.spyOn(ctx.ai, 'interactionEvent').mockResolvedValue({ status: InteractionEventStatus.NOOP });
    const request = { correlation_id: '42:99', event };

    expect(await post('/ai/v2/event/interaction/prefetch', request)).toMatchObject({
      status: 'queued',
      pre_action_text: 'Alex waves',
    });
    expect(await post('/ai/v2/event/interaction/claim', request)).toMatchObject({
      status: InteractionEventStatus.GENERATED,
      text: '\nAlex: Hi.',
    });
    expect(await post('/ai/v2/event/interaction/finalize', { correlation_id: '42:99' })).toMatchObject({
      ok: true,
      found: true,
    });
    expect(await post('/ai/v2/event/interaction/cancel', { correlation_id: '42:99' })).toMatchObject({
      ok: true,
      found: true,
    });
    expect(await post('/ai/v2/event/interaction', event)).toMatchObject({ status: InteractionEventStatus.NOOP });

    expect(prefetch).toHaveBeenCalledOnce();
    expect(claim).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
    expect(finalize).toHaveBeenCalledWith('42:99');
    expect(cancel).toHaveBeenCalledWith('42:99');
    expect(oldRoute).toHaveBeenCalledOnce();
  });
});
