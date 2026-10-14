import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { GenerationCallControl } from 'main/sentient-sims/services/GenerationService';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { SceneAbortedError } from 'main/sentient-sims/exceptions/SceneAbortedError';
import { interactionDeadlineMs, minimumGenerationMs } from 'main/sentient-sims/constants';
import { mockApiContext } from './util';

function interaction(): InteractionEvent {
  return {
    event_id: 'event-1',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: {
      location_id: 5,
      world_id: 0,
      time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 },
    },
    sentient_sims: [],
    interaction_name: 'social_Chat',
  };
}

// The mod abandons an interaction 80 s after sending it. A job that reaches the front of
// the queue with no time left must not spend a generation on a request nobody will read,
// and a job that does run must keep each provider call inside the time it has left.
describe('the interaction deadline', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.openaiKey = 'sk-test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips an interaction that waited past its deadline instead of generating for it', async () => {
    const handler = vi.spyOn(ctx.ai, 'handleInteraction');
    const arrivedAt = Date.now() - (interactionDeadlineMs - minimumGenerationMs + 1000);

    const result = await ctx.ai.interactionEvent(interaction(), { arrivedAt });

    expect(result.status).toBe(InteractionEventStatus.NOOP);
    expect(handler).not.toHaveBeenCalled();
  });

  it('still answers an interaction that has enough time left', async () => {
    const handler = vi
      .spyOn(ctx.ai, 'handleInteraction')
      .mockResolvedValue({ status: InteractionEventStatus.GENERATED, text: 'hi' });

    const result = await ctx.ai.interactionEvent(interaction(), { arrivedAt: Date.now() - 5_000 });

    expect(result.status).toBe(InteractionEventStatus.GENERATED);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('caps each provider call at the time left before the deadline', async () => {
    ctx.settings.generationTimeoutSeconds = 60;
    const controls: GenerationCallControl[] = [];
    vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate').mockImplementation(
      (request: OpenAICompatibleRequest, control?: GenerationCallControl) => {
        controls.push(control ?? {});
        return Promise.resolve({ text: 'ok', request });
      },
    );

    await ctx.ai.runOneShot('Director Briefing', 'brief', 'scene', 50, undefined, undefined, undefined, {
      deadlineAt: Date.now() + 20_000,
    });
    await ctx.ai.runOneShot('Director Briefing', 'brief', 'scene', 50);

    expect(controls[0].timeoutMs).toBeGreaterThan(18_000);
    expect(controls[0].timeoutMs).toBeLessThanOrEqual(20_000);
    expect(controls[1].timeoutMs).toBeUndefined();
  });

  it('never lets the deadline cap exceed the provider timeout', async () => {
    ctx.settings.generationTimeoutSeconds = 10;
    const controls: GenerationCallControl[] = [];
    vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate').mockImplementation(
      (request: OpenAICompatibleRequest, control?: GenerationCallControl) => {
        controls.push(control ?? {});
        return Promise.resolve({ text: 'ok', request });
      },
    );

    await ctx.ai.runOneShot('Director Briefing', 'brief', 'scene', 50, undefined, undefined, undefined, {
      deadlineAt: Date.now() + 60_000,
    });

    expect(controls[0].timeoutMs).toBe(10_000);
  });

  it('turns a provider rejection under an aborted scene into SceneAbortedError', async () => {
    const abort = new AbortController();
    vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate').mockImplementation(
      (_request: OpenAICompatibleRequest, control?: GenerationCallControl) =>
        new Promise((_resolve, reject) => {
          const abortedRequest = () => {
            reject(new Error('Request was aborted.'));
          };
          if (control?.signal?.aborted) {
            abortedRequest();
          }
          control?.signal?.addEventListener('abort', abortedRequest);
        }),
    );

    const call = ctx.ai.runOneShot('Actor: Alex Doe', 'act', 'scene', 50, undefined, undefined, undefined, {
      signal: abort.signal,
    });
    abort.abort();

    await expect(call).rejects.toBeInstanceOf(SceneAbortedError);
  });

  it('does not call the provider at all for a scene that is already stopped', async () => {
    const generate = vi.spyOn(OpenAIService.prototype, 'sentientSimsGenerate');
    const abort = new AbortController();
    abort.abort();

    await expect(
      ctx.ai.runOneShot('Actor: Alex Doe', 'act', 'scene', 50, undefined, undefined, undefined, {
        signal: abort.signal,
      }),
    ).rejects.toBeInstanceOf(SceneAbortedError);
    expect(generate).not.toHaveBeenCalled();
  });
});
