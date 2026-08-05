import fs from 'fs';
import { Request, Response } from 'express';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { Animation } from 'main/sentient-sims/models/Animation';
import { mockApiContext, mockEnvironment } from './util';
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
      appVersion: '1.0.0',
    });
  });

  it('OpenAI Not selected Returns True', () => {
    ctx.settings.aiApiType = ApiType.NovelAI;

    const req = {} as Request;
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(),
    } as unknown as Response;

    ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });

  it('OpenAI ApiType NSFW Disabled Returns False', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.nsfwEnabled = false;

    const req = {} as Request;
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(),
    } as unknown as Response;

    ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: false });
  });

  it('Force NSFW Enabled Returns True', () => {
    ctx.settings.aiApiType = ApiType.OpenAI;
    ctx.settings.nsfwEnabled = true;

    const req = {} as Request;
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(),
    } as unknown as Response;

    ctx.controller.animations.isNsfwEnabled(req, res);

    expect(res.json).toHaveBeenCalledWith({ value: true });
  });
});

describe('AnimationsService local overrides', () => {
  let ctx: ApiContext;

  const onlineAnimations = new Map<string, Animation>(
    Object.entries({
      'author1:anim1': { id: 'anim1', name: 'Hug', author: 'author1', act: 'online hug act' },
      'author2:anim2': { id: 'anim2', name: 'Wave', author: 'author2', act: 'online wave act' },
    }),
  );

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    vi.spyOn(ctx.animations, 'getAnimations').mockResolvedValue(onlineAnimations);
  });

  it('browsable animations merge online and local sources', async () => {
    ctx.animations.saveLocalAnimation({ id: 'anim1', name: 'Hug', author: 'author1', act: 'local hug act' });

    const browsable = await ctx.animations.getBrowsableAnimations();

    expect(browsable.get('author1:anim1')).toEqual({
      id: 'anim1',
      name: 'Hug',
      author: 'author1',
      act: 'local hug act',
      source: 'local',
    });
    expect(browsable.get('author2:anim2')).toEqual({
      id: 'anim2',
      name: 'Wave',
      author: 'author2',
      act: 'online wave act',
      source: 'online',
    });
  });

  it('removing a local override restores the online animation', async () => {
    const animation: Animation = { id: 'anim1', name: 'Hug', author: 'author1', act: 'local hug act' };
    ctx.animations.saveLocalAnimation(animation);

    expect((await ctx.animations.getAnimation('author1', 'anim1'))?.act).toEqual('local hug act');

    ctx.animations.deleteLocalAnimation(animation);

    expect((await ctx.animations.getAnimation('author1', 'anim1'))?.act).toEqual('online hug act');
  });

  it('saving a local animation without an id throws', () => {
    expect(() => {
      ctx.animations.saveLocalAnimation({ name: 'Hug', author: 'author1', act: 'act' });
    }).toThrow();
  });
});
