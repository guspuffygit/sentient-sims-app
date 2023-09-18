/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import { OpenAIKeyNotSetError, OpenAIService } from '../services/OpenAIService';
import { LogSendService, webhookUrl } from '../services/LogSendService';
import { CustomLLMService } from '../services/CustomLLMService';

export class DebugController {
  private openAIService: OpenAIService;

  private logSendService: LogSendService;

  private customLLMService: CustomLLMService;

  constructor(
    openAIService: OpenAIService,
    logSendService: LogSendService,
    customLLMService: CustomLLMService
  ) {
    this.openAIService = openAIService;
    this.logSendService = logSendService;
    this.customLLMService = customLLMService;

    this.testOpenAI = this.testOpenAI.bind(this);
    this.sendDebugLogs = this.sendDebugLogs.bind(this);
    this.testCustomLLM = this.testCustomLLM.bind(this);
    this.getCustomLLMWorkers = this.getCustomLLMWorkers.bind(this);
    this.sendBugReport = this.sendBugReport.bind(this);
  }

  static healthCheck(req: Request, res: Response) {
    res.send('OK');
  }

  async testOpenAI(req: Request, res: Response) {
    let { openAIKey } = req.query;
    if (openAIKey !== undefined) {
      openAIKey = openAIKey as string;
    }

    try {
      const response = await this.openAIService.testOpenAI(openAIKey);
      res.send(response);
    } catch (e: any) {
      if (e instanceof OpenAIKeyNotSetError) {
        res.status(400).send({ status: 'API key not set!' });
      } else {
        res.status(500).send({ error: `${e.name}: ${e.message}` });
      }
    }
  }

  async testCustomLLM(req: Request, res: Response) {
    const status = await this.customLLMService.testHealth();
    res.send({ status });
  }

  async getCustomLLMWorkers(req: Request, res: Response) {
    const workers = await this.customLLMService.getWorkers();
    res.send(workers);
  }

  async sendDebugLogs(req: Request, res: Response) {
    res.json(await this.logSendService.sendLogsToDiscord(webhookUrl));
  }

  async sendBugReport(req: Request, res: Response) {
    res.json(await this.logSendService.sendBugReport(webhookUrl, req.body));
  }
}
