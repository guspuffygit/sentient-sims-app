import { Server } from 'http';
import { runApi } from 'main/sentient-sims/api';
import { AIClient } from 'main/sentient-sims/clients/AIClient';
import { SettingsClient } from 'main/sentient-sims/clients/SettingsClient';
import { AIActionType } from 'main/sentient-sims/models/AIActionType';
import { AIProviderConfig, autoConfigId } from 'main/sentient-sims/models/AIProviderConfig';
import { AIHealthCheckResponse } from 'main/sentient-sims/models/AIHealthCheckResponse';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { InteractionEventResult, InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { mockApiContext } from './util';

describe('Provider Config API', () => {
  const ctx = mockApiContext();
  const apiUrl = `http://localhost:${ctx.port}`;
  const settingsClient = new SettingsClient(apiUrl);
  let server: Server;

  beforeAll(() => {
    ctx.settings.runMigrations();
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('serves the seeded provider config over the settings api', async () => {
    const response = await settingsClient.getSetting(SettingsEnum.AI_PROVIDER_CONFIGS);
    const configs = response.value as AIProviderConfig[];
    expect(configs.length).toBeGreaterThan(0);

    const defaultId = await settingsClient.getSetting(SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID);
    expect(configs.some((config) => config.id === defaultId.value)).toBeTruthy();
  });

  it('changing the default config over http syncs the legacy api type', async () => {
    const geminiConfig: AIProviderConfig = {
      id: 'gemini-e2e',
      name: 'Gemini E2E',
      apiType: ApiType.Gemini,
      model: 'gemini-2.0-flash-exp',
    };
    await settingsClient.updateSetting(SettingsEnum.AI_PROVIDER_CONFIGS, [
      ...ctx.settings.aiProviderConfigs,
      geminiConfig,
    ]);
    await settingsClient.updateSetting(SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID, 'gemini-e2e');

    const apiType = await settingsClient.getSetting(SettingsEnum.AI_API_TYPE);
    expect(apiType.value).toEqual(ApiType.Gemini.toString());
  });

  it('lists models for an explicit api type', async () => {
    const aiClient = new AIClient(apiUrl);
    const models = await aiClient.getModels(ApiType.OpenAI);
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((model) => model.name.startsWith('gpt-'))).toBeTruthy();
  });

  it('health checks a specific config by id', async () => {
    await settingsClient.updateSetting(SettingsEnum.AI_API_TYPE, ApiType.OpenAI.toString());

    const query = new URLSearchParams({ configId: autoConfigId(ApiType.OpenAI) });
    const response = await fetch(`${apiUrl}/debug/test-ai?${query.toString()}`);
    const result = (await response.json()) as AIHealthCheckResponse;
    expect(result.status).toEqual('OK');
  });

  it('routes classification through the per-action override', async () => {
    // Default provider is Sentient Sims AI (auth gated, would fail if used),
    // classification is overridden to OpenAI, proving per-action routing works
    await settingsClient.updateSetting(SettingsEnum.AI_API_TYPE, ApiType.SentientSimsAI.toString());
    await settingsClient.updateSetting(SettingsEnum.AI_PROVIDER_CONFIGS, [
      ...ctx.settings.aiProviderConfigs,
      {
        id: 'openai-e2e',
        name: 'OpenAI E2E',
        apiType: ApiType.OpenAI,
        model: 'gpt-4o-mini',
      },
    ]);
    await settingsClient.updateSetting(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {
      [AIActionType.CLASSIFICATION]: 'openai-e2e',
    });

    const response = await fetch(`${apiUrl}/ai/v2/event/classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob',
        classifiers: ['happy', 'sad'],
        messages: ['Bob won the lottery and celebrated all night with his friends.'],
      }),
    });

    const result = (await response.json()) as InteractionEventResult;
    expect(result.status).toEqual(InteractionEventStatus.CLASSIFIED);
    expect(result.text?.toLowerCase()).toEqual('happy');
  });
});
