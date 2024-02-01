/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { InteractionEvents } from '../models/InteractionEvents';
import {
  sendChatGeneration,
  sendPopUpNotification,
} from '../util/notifyRenderer';
import { AIService } from '../services/AIService';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { InteractionEventStatus } from '../models/InteractionEventResult';

export class AIController {
  private readonly aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;

    this.sentientSimsGenerate = this.sentientSimsGenerate.bind(this);
    this.interactionEvent = this.interactionEvent.bind(this);
  }

  async sentientSimsGenerate(req: Request, res: Response) {
    const promptRequest: OpenAICompatibleRequest = req.body;

    try {
      const response = await this.aiService.generate(promptRequest);
      log.debug(response);
      res.json({ text: response.text });
      sendChatGeneration({
        text: response.text,
        status: InteractionEventStatus.GENERATED,
        request: promptRequest,
      });
    } catch (err: any) {
      log.error('Error getting response', err);
      res.json({
        error: err?.message,
      });
      sendPopUpNotification(err?.message);
    }
  }

  async interactionEvent(req: Request, res: Response) {
    const event: InteractionEvents = req.body;

    try {
      const result = await this.aiService.interactionEvent(event);
      res.json(result);
      if (result.text) {
        sendChatGeneration(result);
      }
    } catch (err: any) {
      log.error('Error getting response', err);
      res.json({
        error: err?.message,
      });
      sendPopUpNotification(err?.message);
    }
  }
}
