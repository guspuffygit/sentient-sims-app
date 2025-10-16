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

  async updateSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    const { value } = req.body;
    res.json({ value: this.ctx.settingsService.setSetting(appSetting, value) });
    notifySettingChanged(appSetting, value);
  }

  async getSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.ctx.settingsService.getSetting(appSetting) });
  }

  async resetSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.ctx.settingsService.resetSetting(appSetting) });
  }
}
