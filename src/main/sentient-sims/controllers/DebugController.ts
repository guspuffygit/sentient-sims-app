import { Request, Response } from 'express';
import { OpenAIKeyNotSetError } from '../services/OpenAIService';
import { webhookUrl } from '../services/LogSendService';
import { SendLogsRequest } from '../models/SendLogsRequest';
import { ApiContext } from '../services/ApiContext';
import { SendLogsResponse } from '../models/SendLogsResponse';
import { InteractionBugReport } from '../models/InteractionBugReport';

export class DebugController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  static appHealthCheck = (req: Request, res: Response) => {
    res.send('OK');
  };

  healthCheckGenerationService = async (req: Request, res: Response) => {
    const { apiKey } = req.query;
    const apiKeyString = typeof apiKey === 'string' ? apiKey : undefined;

    try {
      const response = await this.ctx.genai.healthCheck(apiKeyString);
      res.send(response);
    } catch (e) {
      if (e instanceof OpenAIKeyNotSetError) {
        res.status(400).send({ status: 'API key not set!' });
      } else if (e instanceof Error) {
        res.status(500).send({ error: `${e.name}: ${e.message}` });
      } else {
        res.status(500).send({ error: String(e) });
      }
    }
  };

  sendDebugLogs = async (req: Request, res: Response) => {
    const sendLogsRequest = req.body as SendLogsRequest;
    const response: SendLogsResponse = await this.ctx.logSend.sendLogsToDiscord(webhookUrl, sendLogsRequest);
    res.json(response);
  };

  sendBugReport = async (req: Request, res: Response) => {
    res.json(await this.ctx.logSend.sendBugReport(webhookUrl, req.body as InteractionBugReport));
  };
}
