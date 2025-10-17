import '@testing-library/jest-dom';
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
    ctx.settings.aiApiType = ApiType.NovelAI;

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });

  it('OpenAI ApiType NSFW Disabled Returns False', async () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.nsfwEnabled = false;

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: false });
  });

  it('Force NSFW Enabled Returns True', async () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.nsfwEnabled = true;

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });
});
