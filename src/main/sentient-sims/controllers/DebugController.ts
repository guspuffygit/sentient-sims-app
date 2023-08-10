/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import { OpenAIKeyNotSetError, OpenAIService } from '../services/OpenAIService';
import { LogSendService, webhookUrl } from '../services/LogSendService';

export class DebugController {
  private openAIService: OpenAIService;

  private logSendService: LogSendService;

  constructor(openAIService: OpenAIService, logSendService: LogSendService) {
    this.openAIService = openAIService;
    this.logSendService = logSendService;

    this.testOpenAI = this.testOpenAI.bind(this);
    this.sendDebugLogs = this.sendDebugLogs.bind(this);
  }

  static healthCheck(req: Request, res: Response) {
    res.send('OK');
  }

  async testOpenAI(req: Request, res: Response) {
    try {
      const response = await this.openAIService.testOpenAI();
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
    res.json(await this.logSendService.sendLogsToDiscord(webhookUrl));
  }
}
