/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { SettingsService } from '../services/SettingsService';
import { DirectoryService } from '../services/DirectoryService';
import notifySettingChanged from '../util/notifyRenderer';

export class SettingsController {
  private directoryService: DirectoryService;

  private settingsService: SettingsService;

  constructor(
    directoryService: DirectoryService,
    settingsService: SettingsService
  ) {
    this.directoryService = directoryService;
    this.settingsService = settingsService;

    this.updateSetting = this.updateSetting.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.resetSetting = this.resetSetting.bind(this);
  }

  async updateSetting(req: Request, res: Response) {
    const { appSetting } = req.params;
    const { value } = req.body;
    log.info(`Setting app setting: ${appSetting}, to value: ${value}`);
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
