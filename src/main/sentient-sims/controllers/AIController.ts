import { Request, Response } from 'express';
import log from 'electron-log';
import { InteractionEvents } from '../models/InteractionEvents';
import { DirectedSceneRequest } from '../models/DirectedSceneRequest';
import { playTTS, sendChatGeneration } from '../util/notifyRenderer';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { InteractionEventStatus } from '../models/InteractionEventResult';
import { BuffEventRequest, BuffDescriptionRequest, ClassificationRequest } from '../models/OpenAIRequestBuilder';
import { CatchErrors } from './decorators/CatchError';
import { ApiContext } from '../services/ApiContext';
import { ApiTypeFromValue } from '../models/ApiType';

export class AIController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  @CatchErrors()
  sentientSimsGenerate = async (req: Request, res: Response) => {
    const promptRequest = req.body as OpenAICompatibleRequest;
    const response = await this.ctx.ai.generate(promptRequest);
    log.debug(response);
    res.json({ text: response.text });
    sendChatGeneration({
      text: response.text,
      status: InteractionEventStatus.GENERATED,
      request: promptRequest,
    });
  };

  @CatchErrors()
  interactionEvent = async (req: Request, res: Response) => {
    const event = req.body as InteractionEvents;

    log.debug(`Interaction event: ${JSON.stringify(req.body)}`);

    const result = await this.ctx.ai.interactionEvent(event);
    result.input = event;
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  };

  @CatchErrors()
  directedSceneEvent = async (req: Request, res: Response) => {
    const request = req.body as DirectedSceneRequest;

    log.debug(`Directed scene event: ${JSON.stringify(req.body)}`);

    const result = await this.ctx.ai.runDirectedScene(request);
    result.input = request.event;
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  };

  @CatchErrors()
  classificationEvent = async (req: Request, res: Response) => {
    const event = req.body as ClassificationRequest;

    const result = await this.ctx.ai.runClassification(event);
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  };

  @CatchErrors()
  buffDescription = async (req: Request, res: Response) => {
    const event = req.body as BuffDescriptionRequest;

    const result = await this.ctx.ai.runBuffDescription(event);
    res.json(result);
    if (result.text) {
      sendChatGeneration(result);
    }
  };

  @CatchErrors()
  buffEvent = async (req: Request, res: Response) => {
    const event = req.body as BuffEventRequest;

    res.json({ ok: 'ok' });
    await this.ctx.ai.runBuff(event);
  };

  @CatchErrors({ statusCode: 500 })
  getModels = async (req: Request, res: Response) => {
    const { apiType } = req.query;
    const result = await this.ctx.ai.getModels(
      typeof apiType === 'string' && apiType !== '' ? ApiTypeFromValue(apiType) : undefined,
    );
    res.json(result);
  };

  @CatchErrors()
  tts = (req: Request, res: Response) => {
    const { text } = req.query;

    if (!text) {
      res.status(400).json({ error: 'Must include text query parameter' });
      return;
    }

    playTTS(text as string);

    res.status(200).json({ text });
  };
}
