import { describe, expect, it } from 'vitest';
import { responseToAIModels } from '../main/sentient-sims/models/AIModel';
import { AllModelSettings } from '../main/sentient-sims/modelSettings';

const llama33 = 'meta-llama/Llama-3.3-70B-Instruct';
const llama33Turbo = `${llama33}:turbo`;

describe('model variants', () => {
  it('lists every model from the models response', () => {
    const models = responseToAIModels({ data: [{ id: llama33 }, { id: llama33Turbo }] });

    expect(models).toEqual([
      { name: llama33, displayName: llama33 },
      { name: llama33Turbo, displayName: llama33Turbo },
    ]);
  });

  it('keeps the subscription marker the server sets for a founder', () => {
    const models = responseToAIModels({
      data: [{ id: llama33 }, { id: 'moonshotai/Kimi-K2-Instruct-0905', subscriberOnly: true }],
    });

    expect(models).toEqual([
      { name: llama33, displayName: llama33 },
      {
        name: 'moonshotai/Kimi-K2-Instruct-0905',
        displayName: 'moonshotai/Kimi-K2-Instruct-0905',
        subscriberOnly: true,
      },
    ]);
  });

  it('ships the same settings for the turbo variant as the base model', () => {
    expect(AllModelSettings[llama33Turbo]).toEqual(AllModelSettings[llama33]);
  });

  it('ships settings for the baseline Haiku model', () => {
    expect(AllModelSettings['anthropic/claude-haiku-5.5']).toEqual({ temperature: 0.8, max_tokens: 16384 });
  });
});
