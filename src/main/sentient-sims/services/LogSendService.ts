/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import os from 'os';
import { app } from 'electron';
import AdmZip from 'adm-zip';
import { DirectoryService } from './DirectoryService';
import { LastExceptionService } from './LastExceptionService';
import { OpenAIService } from './OpenAIService';
import { SettingsService } from './SettingsService';
import { VersionService } from './VersionService';
import { SettingsEnum } from '../models/SettingsEnum';
import { InteractionBugReport } from '../models/InteractionBugReport';
import { sendPopUpNotification } from '../util/popupNotification';

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
      const logZip = new AdmZip();

      this.appendFilesListToZipFile(logZip, errors);
      this.appendLogsFileToZipFile(logZip, errors);
      this.appendLastExceptionFilesToZipFile(logZip, errors);
      this.appendAppLogsToZipFile(logZip, errors);
      this.appendConfigFileToZipFile(logZip, errors);

      const formData = new FormData();

      this.appendInformationToFormData(formData, logId, errors);
      this.appendZipFileToFormData(logZip, formData, errors);

      const response = await this.sendFormData(formData, errors, url);

      log.info('Sent logs for debugging');

      if (!response || !response.ok) {
        errors.push(
          `Failed to post message: ${response?.status} ${response?.statusText}.`
        );
        if (response) {
          const responseJson = await response.json();
          log.error(
            `Response JSON Error:\n${JSON.stringify(responseJson, null, 2)}`
          );
          errors.push(responseJson);
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

  private appendFilesListToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const filesList = this.directoryService.listFilesRecursively(
        this.directoryService.getModsFolder()
      );
      zipFile.addFile(
        'fileList.txt',
        Buffer.from(filesList.join('\n'), 'utf-8')
      );
    } catch (err: any) {
      this.handleAppendError('Error adding file list', err, errors);
    }
  }

  private appendLogsFileToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const logFile = this.directoryService.getLogsFile();
      zipFile.addLocalFile(logFile);
    } catch (err: any) {
      this.handleAppendError('Error attaching mod log file', err, errors);
    }
  }

  private appendLastExceptionFilesToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      this.lastExceptionService
        .getParsedLastExceptionFiles()
        .forEach((lastExceptionFile) => {
          zipFile.addFile(
            lastExceptionFile.filename,
            Buffer.from(lastExceptionFile.text, 'utf-8')
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

  private appendAppLogsToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const appLogFile = log.transports.file.getFile();
      zipFile.addLocalFile(appLogFile.path);
    } catch (err: any) {
      this.handleAppendError('Error attaching app log file', err, errors);
    }
  }

  private appendConfigFileToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const configFile = this.directoryService.getConfigFile();
      zipFile.addLocalFile(configFile);
    } catch (err: any) {
      this.handleAppendError('Error attaching Config.log file', err, errors);
    }
  }

  private appendZipFileToFormData(
    zipFile: AdmZip,
    formData: FormData,
    errors: any[]
  ) {
    try {
      const blob = new Blob([zipFile.toBuffer()], { type: 'application/zip' });
      formData.append('logs', blob, 'logs.zip');
    } catch (err: any) {
      this.handleAppendError('Error attaching logs zip file', err, errors);
    }
  }

  private async sendFormData(formData: FormData, errors: any[], url: string) {
    try {
      return await fetch(url, {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      this.handleAppendError('Error sending log data', err, errors);
      sendPopUpNotification(`Error sending log data: ${err.message}`);
      return null;
    }
  }

  private handleAppendError(message: string, err: any, errors: any[]) {
    log.error(message, err);
    errors.push(message, err);
  }
}
