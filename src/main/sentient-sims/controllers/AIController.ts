/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import { OpenAIService } from '../services/OpenAIService';
import { defaultSystemPrompt } from '../constants';
import { PromptRequest } from '../models/PromptRequest';
import { PromptFormatter } from '../promptFormatter';
import { CustomLLMService } from '../services/CustomLLMService';

export class AIController {
  private openAIService: OpenAIService;

  private customLLMService: CustomLLMService;

  constructor(
    openAIService: OpenAIService,
    customLLMService: CustomLLMService
  ) {
    this.openAIService = openAIService;
    this.customLLMService = customLLMService;

    this.generate = this.generate.bind(this);
    this.sentientSimsGenerate = this.sentientSimsGenerate.bind(this);
    this.generateChatCompletion = this.generateChatCompletion.bind(this);
    this.translate = this.translate.bind(this);
  }

  async sentientSimsGenerate(req: Request, res: Response) {
    const promptRequest: PromptRequest = req.body;

    const customLLMEnabled = this.customLLMService.customLLMEnabled();
    const promptFormatter = new PromptFormatter(customLLMEnabled);
    const prompt = promptFormatter.formatPrompt(promptRequest);
    log.debug(`prompt: ${prompt}`);

    if (customLLMEnabled) {
      this.customLLMService.generate(prompt, (err: any, result: any) => {
        if (err) {
          res.status(400).json({
            results: [
              {
                text: err.message,
              },
            ],
          });
        } else {
          res.json(result);
        }
      });
    } else {
      res.json(
        await this.openAIService.generate(
          prompt,
          promptRequest.model,
          promptRequest.systemPrompt,
          90
        )
      );
    }
  }

  async generate(req: Request, res: Response) {
    const { body } = req;
    const { prompt, model, systemPrompt } = body;
    const maxLength = body.max_length;

    const response = await this.openAIService.generate(
      prompt,
      model,
      systemPrompt || defaultSystemPrompt,
      maxLength
    );
    res.json(response);
  }

  static countTokens(req: Request, res: Response) {
    res.json(OpenAIService.countTokens(req.body.prompt));
  }

  async generateChatCompletion(req: Request, res: Response) {
    const { body } = req;
    const result = await this.openAIService.generateChatCompletion(body);
    res.json(result);
  }

  async translate(req: Request, res: Response) {
    const { body } = req;
    const { prompt, systemPrompt } = body;

    const response = await this.openAIService.generate(
      prompt,
      'gpt-3.5-turbo',
      systemPrompt
    );

    res.json(response);
  }
}
