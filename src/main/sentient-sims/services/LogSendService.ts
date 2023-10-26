/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import * as fs from 'fs';
import log from 'electron-log';
import os from 'os';
import { app } from 'electron';
import { DirectoryService } from './DirectoryService';
import { LastExceptionService } from './LastExceptionService';
import { OpenAIService } from './OpenAIService';
import { SettingsService } from './SettingsService';
import { VersionService } from './VersionService';
import { SettingsEnum } from '../models/SettingsEnum';
import { InteractionBugReport } from '../models/InteractionBugReport';

export const webhookUrl = [
  'https://d',
  'is',
  'cor',
  'd.co',
  'm/api/web',
  'hooks/111726887',
  '1007703041/7FZtuRpab',
  'IQ6SqQ_-Wsl',
  '0UfW1akAlbgnNVLW10',
  'eA5x_XDyyt6MTK36i',
  '1Ee5jO7kVJkyo',
].join('');

export class LogSendService {
  private settingsService: SettingsService;

  private directoryService: DirectoryService;

  private lastExceptionService: LastExceptionService;

  private versionService: VersionService;

  private openAIService: OpenAIService;

  constructor(
    settingsService: SettingsService,
    directoryService: DirectoryService,
    lastExceptionService: LastExceptionService,
    versionService: VersionService,
    openAIService: OpenAIService
  ) {
    this.settingsService = settingsService;
    this.directoryService = directoryService;
    this.lastExceptionService = lastExceptionService;
    this.versionService = versionService;
    this.openAIService = openAIService;
  }

  static newLogId() {
    return Array.from({ length: 10 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
  }

  async sendLogsToDiscord(url: string) {
    const logId = LogSendService.newLogId();
    const errors: any[] = [];

    try {
      const formData = new FormData();

      this.appendInformationToFormData(formData, logId, errors);
      this.appendFilesListToFormData(formData, errors);
      this.appendLogsFileToFormData(formData, errors);
      this.appendLastExceptionFilesToFormData(formData, errors);
      this.appendAppLogsToFormData(formData, errors);
      this.appendConfigFileToFormData(formData, errors);

      const response = await this.sendFormData(formData, errors, url);

      log.info('Sent logs for debugging');

      if (!response || !response.ok) {
        errors.push(
          `Failed to post message: ${response?.status} ${response?.statusText}.`
        );
        if (response) {
          errors.push(await response.json());
        }
      }
    } catch (err: any) {
      const message = 'Error sending logs';
      log.error(message, err);
      errors.push(message, err);
    }

    return {
      logId,
      errors,
    };
  }

  async sendBugReport(url: string, bugReport: InteractionBugReport) {
    const logId = LogSendService.newLogId();
    const errors: any[] = [];

    try {
      const formData = new FormData();
      const interactionBugInfo = [
        `INTERACTION BUG REPORT:`,
        `Interaction Title: ${bugReport.interactionTitle}`,
        `Bug Notes: ${bugReport.bugDetails}`,
        `Username: ${bugReport.username}`,
        `Pre Action: ${bugReport?.memory.pre_action}`,
        `Content: ${bugReport?.memory.content}`,
      ];

      this.appendInformationToFormData(
        formData,
        logId,
        errors,
        interactionBugInfo
      );

      const response = await this.sendFormData(formData, errors, url);

      log.info('Sent interaction bug report');

      if (!response || !response.ok) {
        errors.push(
          `Failed to post message: ${response?.status} ${response?.statusText}.`
        );
        if (response) {
          errors.push(await response.json());
        }
      }
    } catch (err: any) {
      const message = 'Error sending logs';
      log.error(message, err);
      errors.push(message, err);
    }

    if (errors) {
      return { error: errors.join('\n') };
    }

    return { text: logId };
  }

  private appendInformationToFormData(
    formData: FormData,
    logId: string,
    errors: any[],
    extraInfo: string[] = []
  ) {
    try {
      formData.append(
        'content',
        [
          ...extraInfo,
          `Log id: ${logId}`,
          `Platform: ${os.platform()}`,
          `Architecture: ${os.arch()}`,
          `OS Release: ${os.release()}`,
          `Mods Folder: ${this.directoryService.getModsFolder()}`,
          `OpenAI Model: ${this.settingsService.get(
            SettingsEnum.OPENAI_MODEL
          )}`,
          `Custom LLM Enabled: ${this.settingsService.get(
            SettingsEnum.CUSTOM_LLM_ENABLED
          )}`,
          `Custom LLM Hostname: ${this.settingsService.get(
            SettingsEnum.CUSTOM_LLM_HOSTNAME
          )}`,
          `Release Type: ${this.settingsService.get(SettingsEnum.MOD_RELEASE)}`,
          `Mod Version: ${this.versionService.getModVersion().version}`,
          `App Version: ${app.getVersion()}`,
        ].join('\n')
      );
    } catch (err: any) {
      this.handleAppendError('Error attaching log information', err, errors);
    }
  }

  private appendFilesListToFormData(formData: FormData, errors: any[]) {
    try {
      const filesList = this.directoryService.listFilesRecursively(
        this.directoryService.getModsFolder()
      );
      const fileListBlob = new Blob([filesList.join('\n')], {
        type: 'text/plain',
      });
      formData.append('fileList', fileListBlob, 'fileList.txt');
    } catch (err: any) {
      this.handleAppendError('Error attaching file list', err, errors);
    }
  }

  private appendLogsFileToFormData(formData: FormData, errors: any[]) {
    try {
      const logFile = this.directoryService.getLogsFileBuffer();
      const blob = new Blob([logFile], { type: 'application/octet-stream' });
      formData.append('logs', blob, 'logs.txt');
    } catch (err: any) {
      this.handleAppendError('Error attaching mod log file', err, errors);
    }
  }

  private appendLastExceptionFilesToFormData(
    formData: FormData,
    errors: any[]
  ) {
    try {
      this.lastExceptionService
        .getParsedLastExceptionFiles()
        .forEach((lastExceptionFile) => {
          const lastExceptionBlob = new Blob([lastExceptionFile.text], {
            type: 'text/plain',
          });

          formData.append(
            lastExceptionFile.filename,
            lastExceptionBlob,
            lastExceptionFile.filename
          );
        });
    } catch (err: any) {
      this.handleAppendError(
        'Error attaching lastException files',
        err,
        errors
      );
    }
  }

  private appendAppLogsToFormData(formData: FormData, errors: any[]) {
    try {
      const appLogFile = log.transports.file.getFile();
      const appLogs = fs.readFileSync(appLogFile.path, 'utf-8');
      const appLogsBlob = new Blob([appLogs], {
        type: 'text/plain',
      });
      formData.append('app-logs.log', appLogsBlob, 'app-logs.log');
    } catch (err: any) {
      this.handleAppendError('Error attaching app log file', err, errors);
    }
  }

  private appendConfigFileToFormData(formData: FormData, errors: any[]) {
    try {
      const configFile = this.directoryService.getConfigFile();
      const blob = new Blob([configFile], {
        type: 'application/octet-stream',
      });
      formData.append('config', blob, 'Config.log');
    } catch (err: any) {
      this.handleAppendError('Error attaching Config.log file', err, errors);
    }
  }

  private async sendFormData(formData: FormData, errors: any[], url: string) {
    try {
      return await fetch(url, {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      this.handleAppendError('Error sending logs', err, errors);
      return null;
    }
  }

  private handleAppendError(message: string, err: any, errors: any[]) {
    log.error(message, err);
    errors.push(message, err);
  }
}
