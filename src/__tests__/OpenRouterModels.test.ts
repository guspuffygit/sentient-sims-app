import { compareAIModelDisplayName, compareAIModels, AIModel } from 'main/sentient-sims/models/AIModel';
import {
  buildOpenRouterModels,
  isOpenRouterEndpoint,
  openrouterRecommendedModels,
} from 'main/sentient-sims/models/OpenRouterModels';
import { openaiDefaultEndpoint, openrouterDefaultEndpoint, openrouterDefaultModel } from 'main/sentient-sims/constants';
import { ApiType, ApiTypeFromValue, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import { OpenRouterService } from 'main/sentient-sims/services/OpenRouterService';
import { OpenAIService } from 'main/sentient-sims/services/OpenAIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

const recommendedNames = openrouterRecommendedModels.map((model) => model.name);

describe('OpenRouter provider', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    ctx = mockApiContext();
  });

  it('is selected as its own provider, not as OpenAI', () => {
    ctx.settings.aiApiType = ApiType.OpenRouter;
    expect(ctx.genai).toBeInstanceOf(OpenRouterService);

    ctx.settings.aiApiType = ApiType.OpenAI;
    expect(ctx.genai).toBeInstanceOf(OpenAIService);
    expect(ctx.genai).not.toBeInstanceOf(OpenRouterService);
  });

  it('round trips through ApiTypeFromValue so a saved setting reloads', () => {
    expect(ApiTypeFromValue('openrouter')).toEqual(ApiType.OpenRouter);
    expect(ApiTypeName(ApiType.OpenRouter)).toEqual('OpenRouter');
  });

  it('defaults to the API root, since the SDK appends /chat/completions itself', () => {
    ctx.settings.aiApiType = ApiType.OpenRouter;

    expect(ctx.genai.serviceUrl()).toEqual(openrouterDefaultEndpoint);
    expect(ctx.genai.serviceUrl()).not.toContain('chat/completions');
    expect(ctx.aiModel).toEqual(openrouterDefaultModel);
  });

  it('keeps its key, endpoint, and model separate from the OpenAI ones', () => {
    ctx.settings.openaiKey = 'sk-openai';
    ctx.settings.openaiModel = 'gpt-4o-mini';
    ctx.settings.openrouterKey = 'sk-or-v1-test';
    ctx.settings.openrouterModel = 'thedrummer/rocinante-12b';

    ctx.settings.aiApiType = ApiType.OpenRouter;
    const openrouter = ctx.genai as OpenRouterService;
    expect(openrouter.getOpenAIKey()).toEqual('sk-or-v1-test');
    expect(openrouter.getOpenAIModel()).toEqual('thedrummer/rocinante-12b');

    // Switching providers must not have disturbed the OpenAI settings.
    ctx.settings.aiApiType = ApiType.OpenAI;
    const openai = ctx.genai as OpenAIService;
    expect(openai.getOpenAIKey()).toEqual('sk-openai');
    expect(openai.getOpenAIModel()).toEqual('gpt-4o-mini');
    expect(openai.serviceUrl()).toEqual(openaiDefaultEndpoint);
  });
});

describe('OpenRouterModels', () => {
  describe('isOpenRouterEndpoint', () => {
    it('detects the OpenRouter endpoint, tolerating case and trailing slashes', () => {
      expect(isOpenRouterEndpoint(openrouterDefaultEndpoint)).toBe(true);
      expect(isOpenRouterEndpoint(`${openrouterDefaultEndpoint}/`)).toBe(true);
      expect(isOpenRouterEndpoint(`  ${openrouterDefaultEndpoint.toUpperCase()}  `)).toBe(true);
    });

    it('does not match other endpoints', () => {
      expect(isOpenRouterEndpoint(openaiDefaultEndpoint)).toBe(false);
      expect(isOpenRouterEndpoint('http://localhost:8000/v1')).toBe(false);
      expect(isOpenRouterEndpoint('')).toBe(false);
    });
  });

  describe('buildOpenRouterModels', () => {
    it('pins recommended models ahead of the rest of the catalog in curated order', () => {
      const models = buildOpenRouterModels([...recommendedNames, 'openai/gpt-4o', 'anthropic/claude-sonnet-4']);

      expect(models.slice(0, recommendedNames.length).map((model) => model.name)).toEqual(recommendedNames);
      models.slice(0, recommendedNames.length).forEach((model, index) => {
        expect(model.sortOrder).toBe(index);
      });
    });

    it('keeps the rest of the catalog selectable without a sort order', () => {
      const models = buildOpenRouterModels([...recommendedNames, 'openai/gpt-4o']);

      const extra = models.find((model) => model.name === 'openai/gpt-4o');
      expect(extra).toEqual({ name: 'openai/gpt-4o', displayName: 'openai/gpt-4o' });
    });

    it('never lists a recommended model OpenRouter has retired', () => {
      const models = buildOpenRouterModels(['openai/gpt-4o']);

      expect(models.map((model) => model.name)).toEqual(['openai/gpt-4o']);
    });

    it('does not duplicate a recommended model that is also in the catalog', () => {
      const models = buildOpenRouterModels([...recommendedNames, ...recommendedNames]);
      const names = models.map((model) => model.name);

      expect(names).toEqual(recommendedNames);
    });
  });

  describe('model comparators', () => {
    it('sorts recommended models first and leaves the rest alphabetical', () => {
      const models = buildOpenRouterModels(['zz/last-model', ...recommendedNames, 'aa/first-model']);

      const byName = [...models].sort(compareAIModels).map((model) => model.name);
      expect(byName).toEqual([...recommendedNames, 'aa/first-model', 'zz/last-model']);

      const byDisplayName = [...models].sort(compareAIModelDisplayName).map((model) => model.name);
      expect(byDisplayName).toEqual([...recommendedNames, 'aa/first-model', 'zz/last-model']);
    });

    it('still sorts alphabetically when no model sets a sort order', () => {
      const models: AIModel[] = [
        { name: 'b', displayName: 'b' },
        { name: 'a', displayName: 'a' },
      ];

      expect([...models].sort(compareAIModels).map((model) => model.name)).toEqual(['a', 'b']);
      expect([...models].sort(compareAIModelDisplayName).map((model) => model.name)).toEqual(['a', 'b']);
    });
  });
});
