/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import electron from 'electron';
import { OpenAIService } from '../services/OpenAIService';
import { PromptRequest } from '../models/PromptRequest';
import { CustomLLMService } from '../services/CustomLLMService';
import { GenerationService } from '../services/GenerationService';
import { GenerationResult } from '../formatter/GenerationResult';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { sendPopUpNotification } from '../util/popupNotification';
import { EventRequest } from '../models/EventRequest';
import { PromptRequestBuilderService } from '../services/PromptRequestBuilderService';

function sendChatGeneration(
  promptRequest: PromptRequest,
  response: SimsGenerateResponse,
  err?: any
) {
  electron?.BrowserWindow?.getAllWindows().forEach((window) => {
    if (window.webContents?.isDestroyed() === false) {
      log.debug('Sending on-chat-generation from ai controller');
      const generationResult: GenerationResult = {
        prompt: promptRequest,
        systemPrompt: response.systemPrompt,
        output: response.text,
        err: err ? err.message : null,
      };
      window.webContents.send('on-chat-generation', generationResult);
    }
  });
}

export class AIController {
  private readonly openAIService: OpenAIService;

  private readonly customLLMService: CustomLLMService;

  private readonly promptRequestBuilderService: PromptRequestBuilderService;

  constructor(
    openAIService: OpenAIService,
    customLLMService: CustomLLMService,
    promptRequestBuilderService: PromptRequestBuilderService
  ) {
    this.openAIService = openAIService;
    this.customLLMService = customLLMService;
    this.promptRequestBuilderService = promptRequestBuilderService;

    this.sentientSimsGenerate = this.sentientSimsGenerate.bind(this);
    this.sentientSimsWants = this.sentientSimsWants.bind(this);
    this.interactionEvent = this.interactionEvent.bind(this);
    this.wantsEvent = this.wantsEvent.bind(this);
    this.translate = this.translate.bind(this);
  }

  async sentientSimsGenerate(req: Request, res: Response) {
    const promptRequest: PromptRequest = req.body;
    const customLLMEnabled = this.customLLMService.customLLMEnabled();

    const service: GenerationService = customLLMEnabled
      ? this.customLLMService
      : this.openAIService;
    const logMessage = customLLMEnabled
      ? 'Error getting customllm response'
      : 'Error getting response';

    try {
      const response = await service.sentientSimsGenerate(promptRequest);
      log.debug(response);
      res.json({ text: response.text });
      sendChatGeneration(promptRequest, response);
    } catch (err: any) {
      log.error(logMessage, err);
      res.json({
        error: err?.message,
      });
      sendPopUpNotification(err?.message);
    }
  }

  async interactionEvent(req: Request, res: Response) {
    const eventRequest: EventRequest = req.body;
    const promptRequest =
      this.promptRequestBuilderService.buildPromptRequest(eventRequest);
    req.body = promptRequest;
    return this.sentientSimsGenerate(req, res);
  }

  async sentientSimsWants(req: Request, res: Response) {
    const promptRequest: PromptRequest = req.body;
    const customLLMEnabled = this.customLLMService.customLLMEnabled();

    const service: GenerationService = customLLMEnabled
      ? this.customLLMService
      : this.openAIService;
    const logMessage = customLLMEnabled
      ? 'Error getting customllm response'
      : 'Error getting response';

    try {
      const response = await service.sentientSimsWants(promptRequest);
      log.debug(response);
      res.json({ text: response.text });
      sendChatGeneration(promptRequest, response);
    } catch (err: any) {
      log.error(logMessage, err);
      res.json({
        error: err?.message,
      });
      sendPopUpNotification(err?.message);
    }
  }

  async wantsEvent(req: Request, res: Response) {
    const eventRequest: EventRequest = req.body;
    const promptRequest =
      this.promptRequestBuilderService.buildPromptRequest(eventRequest);
    req.body = promptRequest;
    return this.sentientSimsWants(req, res);
  }

  async translate(req: Request, res: Response) {
    const { body } = req;
    const { prompt, language } = body;

    try {
      const response = await this.openAIService.translate(prompt, language);
      res.json({ text: response });
    } catch (err: any) {
      log.error(`Unable to translate ${prompt} to ${language}`, err);
      res.json({
        error: err?.message,
      });
      sendPopUpNotification(err?.message);
    }
  }
}
