import { Request, Response } from 'express';
import { UpdateController, UpdateModResponse } from 'main/sentient-sims/controllers/UpdateController';
import { mockApiContext } from './util';

const gameProcess = vi.hoisted(() => ({
  isGameRunning: vi.fn<() => Promise<boolean>>(),
}));
vi.mock('main/sentient-sims/util/gameProcess', () => gameProcess);

const notify = vi.hoisted(() => ({
  sendPopUpNotification: vi.fn(),
}));
vi.mock('main/sentient-sims/util/notifyRenderer', () => notify);

type MockResponse = Response & { statusCode: number; body: UpdateModResponse };

function mockResponse(): MockResponse {
  const res = {
    statusCode: 200,
    body: undefined as unknown as UpdateModResponse,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(value: UpdateModResponse) {
      res.body = value;
      return res;
    },
  };
  return res as unknown as MockResponse;
}

function updateRequest(auto?: boolean): Request {
  return {
    body: {
      type: 'main',
      auto,
      credentials: {
        accessKeyId: 'a',
        secretAccessKey: 'b',
        expiration: '2026-01-01T00:00:00Z',
      },
    },
  } as Request;
}

describe('UpdateController', () => {
  beforeEach(() => {
    gameProcess.isGameRunning.mockReset();
    gameProcess.isGameRunning.mockResolvedValue(false);
    notify.sendPopUpNotification.mockReset();
  });

  it('updates the mod and converts the credential expiration to a Date', async () => {
    const ctx = mockApiContext();
    const updateMod = vi.spyOn(ctx.update, 'updateMod').mockResolvedValue();
    const controller = new UpdateController(ctx);
    const res = mockResponse();

    await controller.updateMod(updateRequest(), res);

    expect(res.body).toEqual({ done: 'done' });
    expect(updateMod).toHaveBeenCalledTimes(1);
    expect(updateMod.mock.calls[0][0].credentials.expiration).toBeInstanceOf(Date);
  });

  it('silently skips an auto update while the game is running', async () => {
    const ctx = mockApiContext();
    gameProcess.isGameRunning.mockResolvedValue(true);
    const updateMod = vi.spyOn(ctx.update, 'updateMod').mockResolvedValue();
    const controller = new UpdateController(ctx);
    const res = mockResponse();

    await controller.updateMod(updateRequest(true), res);

    expect(res.body).toEqual({ skipped: 'game-running' });
    expect(updateMod).not.toHaveBeenCalled();
    expect(notify.sendPopUpNotification).not.toHaveBeenCalled();
  });

  it('refuses a manual update while the game is running, with a popup', async () => {
    const ctx = mockApiContext();
    gameProcess.isGameRunning.mockResolvedValue(true);
    const updateMod = vi.spyOn(ctx.update, 'updateMod').mockResolvedValue();
    const controller = new UpdateController(ctx);
    const res = mockResponse();

    await controller.updateMod(updateRequest(), res);

    expect(res.body.error?.message).toMatch(/Close The Sims 4/);
    expect(updateMod).not.toHaveBeenCalled();
    expect(notify.sendPopUpNotification).toHaveBeenCalledWith(expect.stringMatching(/Close The Sims 4/));
  });

  it('pops up manual update failures but only logs auto ones', async () => {
    const ctx = mockApiContext();
    vi.spyOn(ctx.update, 'updateMod').mockRejectedValue(new Error('boom'));
    const controller = new UpdateController(ctx);

    const manualRes = mockResponse();
    await controller.updateMod(updateRequest(), manualRes);
    expect(manualRes.body.error?.message).toEqual('boom');
    expect(notify.sendPopUpNotification).toHaveBeenCalledWith('boom');

    notify.sendPopUpNotification.mockReset();
    const autoRes = mockResponse();
    await controller.updateMod(updateRequest(true), autoRes);
    expect(autoRes.body.error?.message).toEqual('boom');
    expect(notify.sendPopUpNotification).not.toHaveBeenCalled();
  });
});
