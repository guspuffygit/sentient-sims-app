import { Request, Response } from 'express';
import log from 'electron-log';
import { InteractionEvents } from '../models/InteractionEvents';
import { playTTS, sendChatGeneration } from '../util/notifyRenderer';
import { AIService } from '../services/AIService';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { InteractionEventStatus } from '../models/InteractionEventResult';
import { BuffEventRequest, BuffDescriptionRequest, ClassificationRequest } from '../models/OpenAIRequestBuilder';
import { CatchErrors } from './decorators/CatchError';
import { DbService } from '../services/DbService';

export class AIController {
  private readonly aiService: AIService;

  private readonly dbService: DbService;

  constructor(aiService: AIService, dbService: DbService) {
    this.aiService = aiService;
    this.dbService = dbService;

    this.sentientSimsGenerate = this.sentientSimsGenerate.bind(this);
    this.interactionEvent = this.interactionEvent.bind(this);
    this.classificationEvent = this.classificationEvent.bind(this);
    this.buffEvent = this.buffEvent.bind(this);
    this.getModels = this.getModels.bind(this);
    this.tts = this.tts.bind(this);
  }

  @CatchErrors()
  async sentientSimsGenerate(req: Request, res: Response) {
    const promptRequest: OpenAICompatibleRequest = req.body;
    const response = await this.aiService.generate(promptRequest);
    log.debug(response);
    res.json({ text: response.text });
    sendChatGeneration({
      text: response.text,
      status: InteractionEventStatus.GENERATED,
      request: promptRequest,
    });
  }

  @CatchErrors()
  async interactionEvent(req: Request, res: Response) {
    const event: InteractionEvents = req.body;

    const result = await this.aiService.interactionEvent(event);
    result.input = event;
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  }

  @CatchErrors()
  async classificationEvent(req: Request, res: Response) {
    const event: ClassificationRequest = req.body;

    const result = await this.aiService.runClassification(event);
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  }

  @CatchErrors()
  async buffDescription(req: Request, res: Response) {
    const event: BuffDescriptionRequest = req.body;

    const result = await this.aiService.runBuffDescription(event);
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  }

  @CatchErrors()
  async buffEvent(req: Request, res: Response) {
    const event: BuffEventRequest = req.body;

    res.json({ ok: 'ok' });
    await this.aiService.runBuff(event);
  }

  @CatchErrors({ statusCode: 500 })
  async getModels(req: Request, res: Response) {
    const result = await this.aiService.getModels();
    res.json(result);
  }

  @CatchErrors()
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
