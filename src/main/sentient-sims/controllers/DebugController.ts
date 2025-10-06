import { Request, Response } from 'express';
import { OpenAIKeyNotSetError } from '../services/OpenAIService';
import { LogSendService, webhookUrl } from '../services/LogSendService';
import { SettingsService } from '../services/SettingsService';
import { getGenerationService } from '../factories/generationServiceFactory';
import { SendLogsRequest } from '../models/SendLogsRequest';

export class DebugController {
  private readonly settingsService: SettingsService;

  private readonly logSendService: LogSendService;

  constructor(settingsService: SettingsService, logSendService: LogSendService) {
    this.settingsService = settingsService;
    this.logSendService = logSendService;

    this.healthCheckGenerationService = this.healthCheckGenerationService.bind(this);
    this.sendDebugLogs = this.sendDebugLogs.bind(this);
    this.sendBugReport = this.sendBugReport.bind(this);
  }

  static appHealthCheck(req: Request, res: Response) {
    res.send('OK');
  }

  async healthCheckGenerationService(req: Request, res: Response) {
    let { apiKey } = req.query;
    if (apiKey !== undefined) {
      apiKey = apiKey as string;
    }

    try {
      const generationService = getGenerationService(this.settingsService);
      const response = await generationService.healthCheck(apiKey);
      res.send(response);
    } catch (e: any) {
      if (e instanceof OpenAIKeyNotSetError) {
        res.status(400).send({ status: 'API key not set!' });
      } else {
        res.status(500).send({ error: `${e.name}: ${e.message}` });
      }
    }
  }

  async sendDebugLogs(req: Request, res: Response) {
    const sendLogsRequest: SendLogsRequest = req.body;
    res.json(await this.logSendService.sendLogsToDiscord(webhookUrl, sendLogsRequest));
  }

  async sendBugReport(req: Request, res: Response) {
    res.json(await this.logSendService.sendBugReport(webhookUrl, req.body));
  }
}
