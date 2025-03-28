/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { InteractionEvents } from '../models/InteractionEvents';
import {
  playTTS,
  sendChatGeneration,
  sendPopUpNotification,
} from '../util/notifyRenderer';
import { AIService } from '../services/AIService';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { InteractionEventStatus } from '../models/InteractionEventResult';
import {
  BuffRequest,
  ClassificationRequest,
} from '../models/OpenAIRequestBuilder';

export class AIController {
  private readonly aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;

    this.sentientSimsGenerate = this.sentientSimsGenerate.bind(this);
    this.interactionEvent = this.interactionEvent.bind(this);
    this.classificationEvent = this.classificationEvent.bind(this);
    this.buffEvent = this.buffEvent.bind(this);
    this.getModels = this.getModels.bind(this);
    this.tts = this.tts.bind(this);
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
      result.input = event;
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

    log.debug(`Sims: ${JSON.stringify(event.sentient_sims, null, 2)}`);
  }

  async classificationEvent(req: Request, res: Response) {
    const event: ClassificationRequest = req.body;

    try {
      const result = await this.aiService.runClassification(event);
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

  async buffEvent(req: Request, res: Response) {
    const event: BuffRequest = req.body;

    try {
      const result = await this.aiService.runBuff(event);
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

  async getModels(req: Request, res: Response) {
    try {
      const result = await this.aiService.getModels();
      res.json(result);
    } catch (err: any) {
      log.error('Error getting models', err);
      // sendPopUpNotification(err?.message);
      res.status(500).json({
        error: err?.message,
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async tts(req: Request, res: Response) {
    const { text } = req.query;

    if (!text) {
      res.status(400).json({ error: 'Must include text query parameter' });
      return;
    }

    playTTS(text as string);

    res.status(200).json({ text });
  }
}
