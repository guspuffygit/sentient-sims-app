import '@testing-library/jest-dom';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { Request, Response } from 'express';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { mockEnvironment } from './util';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';

describe('AnimationsController', () => {
  let ctx: ApiContext;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getAssetPath = (...paths: string[]) => {
      return '';
    };
    const { directoryService, settingsService } = mockEnvironment();
    ctx = new ApiContext({
      getAssetPath,
      port: 25198,
      settingsService,
      directoryService,
    });
  });

  it('OpenAI Not selected Returns True', async () => {
    ctx.settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.NovelAI);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });

  it('OpenAI ApiType NSFW Disabled Returns False', async () => {
    ctx.settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
    ctx.settingsService.set(SettingsEnum.NSFW_ENABLED, false);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: false });
  });

  it('Force NSFW Enabled Returns True', async () => {
    ctx.settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
    ctx.settingsService.set(SettingsEnum.NSFW_ENABLED, true);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });
});
