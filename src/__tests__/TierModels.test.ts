import { describe, expect, it } from 'vitest';
import { responseToAIModels } from '../main/sentient-sims/models/AIModel';
import { PatreonUser } from '../main/sentient-sims/wrappers/PatreonUser';
import { tierUpgradeMessage } from '../main/sentient-sims/clients/AxiosClient';
import { AllModelSettings } from '../main/sentient-sims/modelSettings';

const llama33 = 'meta-llama/Llama-3.3-70B-Instruct';
const llama33Turbo = `${llama33}:turbo`;

function userWith(attributes: { subscriptionLevel?: string; founderStatus?: string }) {
  return new PatreonUser({ sub: 'abc', emailVerified: true, ...attributes });
}

describe('tier gated models', () => {
  it('keeps requiresTier from the models response', () => {
    const models = responseToAIModels({
      data: [{ id: llama33 }, { id: llama33Turbo, requiresTier: 'tier2' }],
    });

    expect(models).toEqual([
      { name: llama33, displayName: llama33 },
      { name: llama33Turbo, displayName: llama33Turbo, requiresTier: 'tier2' },
    ]);
  });

  it('grants tier 2 access to tier 2 subscribers and devs only', () => {
    expect(userWith({ subscriptionLevel: 'tier2' }).hasTier2Access()).toBe(true);
    expect(userWith({ founderStatus: 'dev' }).hasTier2Access()).toBe(true);
    expect(userWith({ subscriptionLevel: 'tier1' }).hasTier2Access()).toBe(false);
    expect(userWith({ founderStatus: 'founder' }).hasTier2Access()).toBe(false);
    expect(userWith({ founderStatus: 'founder', subscriptionLevel: 'tier1' }).hasTier2Access()).toBe(false);
    expect(userWith({}).hasTier2Access()).toBe(false);
    expect(new PatreonUser(undefined).hasTier2Access()).toBe(false);
  });

  it('lets every member use ungated models and only tier 2 use gated ones', () => {
    const base = { name: llama33, displayName: llama33 };
    const turbo = { name: llama33Turbo, displayName: llama33Turbo, requiresTier: 'tier2' };

    expect(userWith({ subscriptionLevel: 'tier1' }).canUseModel(base)).toBe(true);
    expect(userWith({ subscriptionLevel: 'tier1' }).canUseModel(turbo)).toBe(false);
    expect(userWith({ founderStatus: 'founder' }).canUseModel(turbo)).toBe(false);
    expect(userWith({ subscriptionLevel: 'tier2' }).canUseModel(turbo)).toBe(true);
    expect(userWith({ founderStatus: 'dev' }).canUseModel(turbo)).toBe(true);
  });

  it('turns the 453 body into an upgrade hint', () => {
    expect(tierUpgradeMessage({ error: `${llama33Turbo} needs a Tier 2 subscription` })).toBe(
      `${llama33Turbo} needs a Tier 2 subscription. Upgrade on Patreon or pick another model in the AI provider settings.`,
    );
    expect(tierUpgradeMessage('not json')).toBe(
      'This model needs a higher Patreon tier. Upgrade on Patreon or pick another model in the AI provider settings.',
    );
  });

  it('ships the same settings for the turbo variant as the base model', () => {
    expect(AllModelSettings[llama33Turbo]).toEqual(AllModelSettings[llama33]);
  });
});
