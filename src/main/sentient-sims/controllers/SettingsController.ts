/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { notifySettingChanged } from '../util/notifyRenderer';

export class SettingsController {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;

    this.updateSetting = this.updateSetting.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.resetSetting = this.resetSetting.bind(this);
  }

  async updateSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    const { value } = req.body;
    res.json({ value: this.settingsService.setSetting(appSetting, value) });
    notifySettingChanged(appSetting, value);
  }

  async getSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.settingsService.getSetting(appSetting) });
  }

  async resetSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    res.json({ value: this.settingsService.resetSetting(appSetting) });
  }
}
