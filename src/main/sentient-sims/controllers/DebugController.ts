import { Request, Response } from 'express';
import { ApiTypeFromValue } from '../models/ApiType';
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
    const { apiKey, configId, apiType } = req.query;
    const apiKeyString = typeof apiKey === 'string' ? apiKey : undefined;
    const configIdString = typeof configId === 'string' ? configId : undefined;

    try {
      // apiType supports draft tests from the config dialog: exercise a
      // provider connection before any config referencing it is saved
      const serviceApiType =
        typeof apiType === 'string' && apiType !== ''
          ? ApiTypeFromValue(apiType)
          : this.ctx.providerConfigs.getResolvedConfig(configIdString).apiType;
      const response = await this.ctx.getGenerationService(serviceApiType).healthCheck(apiKeyString);
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
