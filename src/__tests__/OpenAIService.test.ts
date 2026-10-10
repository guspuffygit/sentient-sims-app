import { vi } from 'vitest';
import OpenAI from 'openai';
import { ChatCompletion } from 'openai/resources/index.js';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { OpenRouterService } from 'main/sentient-sims/services/OpenRouterService';
import { mockApiContext } from './util';

type SentRequest = { model: string; max_tokens?: number; reasoning?: { effort: string } };

function completion(content: string | null, overrides: Partial<ChatCompletion> = {}): ChatCompletion {
  return {
    id: 'gen-1',
    object: 'chat.completion',
    created: 0,
    model: 'test/model',
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        logprobs: null,
        message: { role: 'assistant', content, refusal: null },
      },
    ],
    ...overrides,
  };
}

function reasonedToTheLimit(): ChatCompletion {
  return completion(null, {
    choices: [
      {
        index: 0,
        finish_reason: 'length',
        logprobs: null,
        message: { role: 'assistant', content: null, refusal: null },
      },
    ],
    usage: {
      prompt_tokens: 332,
      completion_tokens: 60,
      total_tokens: 392,
      completion_tokens_details: { reasoning_tokens: 57 },
    },
  });
}

function mandatoryReasoningError() {
  return OpenAI.APIError.generate(
    400,
    { error: { message: 'Reasoning is mandatory for this endpoint and cannot be disabled.', code: 400 } },
    undefined,
    new Headers(),
  );
}

describe('OpenAIService', () => {
  let ctx: ApiContext;

  const request: OpenAICompatibleRequest = {
    messages: [{ role: 'user', content: 'Say hello', tokens: 2 }],
    maxResponseTokens: 90,
  };

  beforeEach(() => {
    ctx = mockApiContext();
    ctx.settings.localizationEnabled = false;
  });

  function mockCreate(service: OpenAIService) {
    const create = vi.fn<(params: SentRequest) => Promise<ChatCompletion>>().mockResolvedValue(completion('Hello'));
    vi.spyOn(service, 'getOpenAIClient').mockReturnValue({
      chat: { completions: { create } },
    } as unknown as OpenAI);
    return create;
  }

  it('getOpenAIModel default', () => {
    const openAIService = new OpenAIService(ctx);
    expect(openAIService.getOpenAIModel()).toEqual('gpt-4o-mini');
  });

  it('sends no reasoning control to OpenAI', async () => {
    const service = new OpenAIService(ctx);
    const create = mockCreate(service);

    await service.sentientSimsGenerate(request);

    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].reasoning).toBeUndefined();
  });

  it('names the cause when a model reasons to the reply limit and writes nothing', () => {
    const service = new OpenAIService(ctx);

    expect(() => service.getOutputFromGeneration(reasonedToTheLimit())).toThrow(
      'test/model spent its whole reply limit on reasoning',
    );
    expect(() => service.getOutputFromGeneration(completion(null))).toThrow('Output wasnt truthy');
  });

  describe('through OpenRouter', () => {
    let service: OpenRouterService;

    beforeEach(() => {
      service = new OpenRouterService(ctx);
    });

    it('turns reasoning off so the reply limit goes to the reply', async () => {
      const create = mockCreate(service);

      const response = await service.sentientSimsGenerate(request);

      expect(response.text).toEqual('Hello');
      expect(create).toHaveBeenCalledOnce();
      expect(create.mock.calls[0][0].reasoning).toEqual({ effort: 'none' });
      expect(create.mock.calls[0][0].max_tokens).toEqual(90);
    });

    it('turns reasoning off for the translation pass too', async () => {
      ctx.settings.localizationEnabled = true;
      const create = mockCreate(service);

      await service.sentientSimsGenerate(request);

      expect(create).toHaveBeenCalledTimes(2);
      expect(create.mock.calls[1][0].reasoning).toEqual({ effort: 'none' });
      expect(create.mock.calls[1][0].max_tokens).toBeUndefined();
    });

    it('falls back to minimal reasoning with headroom for a model that must reason', async () => {
      const create = mockCreate(service);
      create.mockRejectedValueOnce(mandatoryReasoningError());

      const response = await service.sentientSimsGenerate(request);

      expect(response.text).toEqual('Hello');
      expect(create).toHaveBeenCalledTimes(2);
      expect(create.mock.calls[1][0].reasoning).toEqual({ effort: 'minimal' });
      expect(create.mock.calls[1][0].max_tokens).toEqual(90 + 1024);
    });

    it('remembers a model that must reason and skips the refused attempt', async () => {
      const create = mockCreate(service);
      create.mockRejectedValueOnce(mandatoryReasoningError());

      await service.sentientSimsGenerate(request);
      await service.sentientSimsGenerate(request);
      await service.sentientSimsGenerate({ ...request, model: 'other/model' });

      expect(create.mock.calls.map(([params]) => params.reasoning?.effort)).toEqual([
        'none',
        'minimal',
        'minimal',
        'none',
      ]);
    });

    it('does not retry other request errors', async () => {
      const create = mockCreate(service);
      create.mockRejectedValueOnce(
        OpenAI.APIError.generate(
          400,
          { error: { message: 'No endpoints found', code: 400 } },
          undefined,
          new Headers(),
        ),
      );

      await expect(service.sentientSimsGenerate(request)).rejects.toThrow('No endpoints found');
      expect(create).toHaveBeenCalledOnce();
    });
  });
});
