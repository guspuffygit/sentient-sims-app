import { Request, Response } from 'express';
import { notifySettingChanged } from '../util/notifyRenderer';
import { ApiContext } from '../services/ApiContext';

export class SettingsController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.updateSetting = this.updateSetting.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.resetSetting = this.resetSetting.bind(this);
  }

  updateSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    const { value } = req.body as { value: unknown };
    res.json({ value: this.ctx.settings.setSetting(appSetting, value) });
    notifySettingChanged(appSetting, value);
  }

  getSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.ctx.settings.getSetting(appSetting) });
  }

  resetSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.ctx.settings.resetSetting(appSetting) });
  }
}
