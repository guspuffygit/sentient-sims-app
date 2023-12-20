/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { AnimationsService } from 'main/sentient-sims/services/AnimationsService';
import { SettingsService } from 'main/sentient-sims/services/SettingsService';
import { AnimationsController } from 'main/sentient-sims/controllers/AnimationsController';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { Request, Response } from 'express';

describe('AnimationsController', () => {
  let settingsService: SettingsService;
  let animationsController: AnimationsController;

  beforeEach(() => {
    settingsService = new SettingsService();
    const animationsService = new AnimationsService(settingsService);
    animationsController = new AnimationsController(animationsService);
  });

  it('CustomLLM Enabled Returns True', async () => {
    settingsService.set(SettingsEnum.CUSTOM_LLM_ENABLED, true);

    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await animationsController.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });

  it('Custom LLM Disabled NSFW Disabled Returns False', async () => {
    settingsService.set(SettingsEnum.CUSTOM_LLM_ENABLED, false);
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
    settingsService.set(SettingsEnum.CUSTOM_LLM_ENABLED, false);
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
