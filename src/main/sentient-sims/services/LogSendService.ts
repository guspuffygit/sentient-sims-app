import log from 'electron-log';
import os from 'os';
import { app } from 'electron';
import AdmZip from 'adm-zip';
import { SettingsEnum } from '../models/SettingsEnum';
import { InteractionBugReport } from '../models/InteractionBugReport';
import { SSEventType, WWInteractionEvent } from '../models/InteractionEvents';
import { sendPopUpNotification } from '../util/notifyRenderer';
import { SendLogsRequest } from '../models/SendLogsRequest';
import { GetPatreonDebugText } from '../util/patreonUtil';
import { CaughtError } from '../models/CaughtError';
import { ApiContext } from './ApiContext';

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
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  static newLogId() {
    return Array.from({ length: 10 }, () => Math.random().toString(36).charAt(2)).join('');
  }

  async sendLogsToDiscord(url: string, sendLogsRequest: SendLogsRequest) {
    const logId = LogSendService.newLogId();
    const errors: any[] = [];

    try {
      const logZip = new AdmZip();

      const formData = new FormData();

      const extraData = [
        `Discord Username: ${sendLogsRequest.discordUsername}`,
        `Error Description: ${sendLogsRequest.errorDescription}`,
      ];

      if (sendLogsRequest.userAttributes) {
        const patreonDebugTexts: string[] = GetPatreonDebugText(sendLogsRequest.userAttributes);
        patreonDebugTexts.forEach((text) => extraData.push(text));
      }

      const endData: string[] = [];

      if (sendLogsRequest.caughtError) {
        try {
          endData.push(`CaughtError: ${JSON.stringify(sendLogsRequest.caughtError, null, 2)}`);
        } catch (err) {
          log.error(`Error attaching caughtError info to debug logs`, err);
        }
      }

      const content = this.getContent(logId, extraData, endData);

      this.appendInformationToFormData(formData, errors, content);
      this.appendContentToZipFile(content, logZip, errors);
      this.appendFilesListToZipFile(logZip, errors);
      this.appendLogsFileToZipFile(logZip, errors);
      this.appendErrorDatabaseToZipFile(logZip, errors, sendLogsRequest?.caughtError);
      this.appendLastExceptionFilesToZipFile(logZip, errors);
      this.appendAppLogsToZipFile(logZip, errors);
      this.appendConfigFileToZipFile(logZip, errors);
      this.appendZipFileToFormData(logZip, formData, errors);

      const response = await this.sendFormData(formData, errors, url);

      log.info('Sent logs for debugging');

      if (!response || !response.ok) {
        errors.push(`Failed to post message: ${response?.status} ${response?.statusText}.`);
        if (response) {
          const responseJson = await response.json();
          log.error(`Response JSON Error:\n${JSON.stringify(responseJson, null, 2)}`);
          errors.push(responseJson);
        }
      }
    } catch (err: any) {
      const message = 'Error sending logs';
      log.error(message, err);
      errors.push(message, err);
    }

    if (errors.length === 0) {
      this.ctx.lastExceptionService.deleteLastExceptionFiles();
    }

    return {
      logId,
      errors,
    };
  }

  getContent(logId: string, extraData: string[] = [], endData: string[] = []) {
    return [
      ...extraData,
      `Log id: ${logId}`,
      `Platform: ${os.platform()}`,
      `Architecture: ${os.arch()}`,
      `OS Release: ${os.release()}`,
      `Mods Folder: ${this.ctx.directoryService.getModsFolder()}`,
      `Mod Version: ${this.ctx.versionService.getModVersion().version}`,
      `App Version: ${app.getVersion()}`,
      `Game Version: ${this.ctx.versionService.getGameVersion().version}`,
      ...this.getSettings(),
      ...endData,
    ].join('\n');
  }

  async sendBugReport(url: string, { event, username, memory, bugDetails }: InteractionBugReport) {
    const logId = LogSendService.newLogId();
    const errors: any[] = [];

    try {
      const formData = new FormData();
      const interactionBugInfo = [
        `INTERACTION BUG REPORT:`,
        `Username: ${username}`,
        `Bug Notes: ${bugDetails}`,
        `Location ID: ${memory.location_id}`,
        `Event Type: ${event.event_type}`,
      ];

      if (memory?.pre_action) {
        interactionBugInfo.push(`Pre Action: ${memory.pre_action}`);
      }
      if (memory?.content) {
        interactionBugInfo.push(`Content: ${memory.content}`);
      }
      if (memory?.observation) {
        interactionBugInfo.push(`Observation: ${memory.observation}`);
      }

      if (event.event_type === SSEventType.WICKED_WHIMS) {
        const wwEvent = event as WWInteractionEvent;
        interactionBugInfo.push(
          [
            `Animation Id: ${wwEvent.animation_identifier}`,
            `Animation Author: ${wwEvent.animation_author}`,
            `Animation Name: ${wwEvent.animation_name}`,
            `WW Event Type: ${wwEvent.ww_event_type}`,
            `Sex Category: ${wwEvent.sex_category}`,
            `Sex Location: ${wwEvent.sex_location}`,
          ].join('\n'),
        );
      }

      const content = this.getContent(logId, interactionBugInfo);
      this.appendInformationToFormData(formData, errors, content);

      const response = await this.sendFormData(formData, errors, url);

      log.info('Sent interaction bug report');

      if (!response || !response.ok) {
        errors.push(`Failed to post message: ${response?.status} ${response?.statusText}.`);
        if (response) {
          errors.push(await response.json());
        }
      }
    } catch (err: any) {
      const message = 'Error sending logs';
      log.error(message, err);
      errors.push(message, err);
      sendPopUpNotification(`Error sending logs: ${err.message}`);
    }

    return { text: logId };
  }

  private getSettings(): string[] {
    const settings: string[] = [];

    Object.values(SettingsEnum).forEach((settingsEnum) => {
      // Dont send tokens or secrets in the logs
      if (!settingsEnum.includes('Key') && !settingsEnum.includes('Token')) {
        const settingsValue = this.ctx.settingsService.getSetting(settingsEnum);
        if (Object.prototype.toString.call(settingsValue) === '[object Object]') {
          settings.push(`${settingsEnum}: ${JSON.stringify(settingsValue)}`);
        } else {
          settings.push(`${settingsEnum}: ${settingsValue}`);
        }
      }
    });

    return settings;
  }

  private appendInformationToFormData(formData: FormData, errors: any[], content: string) {
    try {
      formData.append('content', content.slice(0, 1900));
    } catch (err: any) {
      this.handleAppendError('Error attaching log information', err, errors);
    }
  }

  private appendFilesListToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const filesList = this.ctx.directoryService.listFilesRecursively(this.ctx.directoryService.getModsFolder());
      zipFile.addFile('fileList.txt', Buffer.from(filesList.join('\n'), 'utf-8'));
    } catch (err: any) {
      this.handleAppendError('Error adding file list', err, errors);
    }
  }

  private appendLogsFileToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      const logFile = this.ctx.directoryService.getLogsFile();
      zipFile.addLocalFile(logFile);
    } catch (err: any) {
      this.handleAppendError('Error attaching mod log file', err, errors);
    }
  }

  private appendErrorDatabaseToZipFile(zipFile: AdmZip, errors: any[], caughtError?: CaughtError) {
    try {
      if (caughtError?.databaseSession) {
        const errorDb = this.ctx.directoryService.getSentientSimsErrorDb(caughtError.databaseSession);
        zipFile.addLocalFile(errorDb);
      }
    } catch (err: any) {
      this.handleAppendError('Error attaching error db file', err, errors);
    }
  }

  private appendContentToZipFile(content: string, zipFile: AdmZip, errors: any[]) {
    try {
      zipFile.addFile('systemconfig.txt', Buffer.from(content, 'utf-8'));
    } catch (err: any) {
      this.handleAppendError('Error attaching mod log file', err, errors);
    }
  }

  private appendLastExceptionFilesToZipFile(zipFile: AdmZip, errors: any[]) {
    try {
      this.ctx.lastExceptionService.getParsedLastExceptionFiles().forEach((lastExceptionFile) => {
        zipFile.addFile(
          lastExceptionFile.filename,
          Buffer.from(lastExceptionFile.text, 'utf-8'),
          `Created ${lastExceptionFile.created.toUTCString()}`,
        );
      });
    } catch (err: any) {
      this.handleAppendError('Error attaching lastException files', err, errors);
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
      const configFile = this.ctx.directoryService.getConfigFile();
      zipFile.addLocalFile(configFile);
    } catch (err: any) {
      this.handleAppendError('Error attaching Config.log file', err, errors);
    }
  }

  private appendZipFileToFormData(zipFile: AdmZip, formData: FormData, errors: any[]) {
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
