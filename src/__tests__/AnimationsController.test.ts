/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { AnimationsService } from 'main/sentient-sims/services/AnimationsService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { AnimationsController } from 'main/sentient-sims/controllers/AnimationsController';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { Request, Response } from 'express';
import { ApiType } from 'main/sentient-sims/models/ApiType';

describe('AnimationsController', () => {
  let settingsService: SettingsService;
  let animationsController: AnimationsController;

  beforeEach(() => {
    settingsService = new SettingsService();
    const animationsService = new AnimationsService(settingsService);
    animationsController = new AnimationsController(animationsService);
  });

  it('OpenAI Not selected Returns True', async () => {
    settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.NovelAI);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });

  it('OpenAI ApiType NSFW Disabled Returns False', async () => {
    settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
    settingsService.set(SettingsEnum.NSFW_ENABLED, false);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: false });
  });

  it('Force NSFW Enabled Returns True', async () => {
    settingsService.set(SettingsEnum.AI_API_TYPE, ApiType.OpenAI);
    settingsService.set(SettingsEnum.NSFW_ENABLED, true);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });
});
