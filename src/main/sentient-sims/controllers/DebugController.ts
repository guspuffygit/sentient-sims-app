import { Request, Response } from 'express';
import { OpenAIKeyNotSetError } from '../services/OpenAIService';
import { webhookUrl } from '../services/LogSendService';
import { SendLogsRequest } from '../models/SendLogsRequest';
import { ApiContext } from '../services/ApiContext';

export class DebugController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

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
      const response = await this.ctx.genai.healthCheck(apiKey);
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
    res.json(await this.ctx.logSend.sendLogsToDiscord(webhookUrl, sendLogsRequest));
  }

  async sendBugReport(req: Request, res: Response) {
    res.json(await this.ctx.logSend.sendBugReport(webhookUrl, req.body));
  }
}
