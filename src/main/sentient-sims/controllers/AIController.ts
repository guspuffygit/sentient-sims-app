/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import log from 'electron-log';
import electron from 'electron';
import { OpenAIService } from '../services/OpenAIService';
import { defaultSystemPrompt } from '../constants';
import { PromptRequest } from '../models/PromptRequest';
import { CustomLLMService } from '../services/CustomLLMService';
import { createPromptFormatter } from '../formatter/PromptFormatterFactory';

function sendChatGeneration(
  promptRequest: PromptRequest,
  output: string,
  err?: any
) {
  electron?.BrowserWindow?.getAllWindows().forEach((window) => {
    if (window.webContents?.isDestroyed() === false) {
      log.debug('Sending on-chat-generation from ai controller');
      window.webContents.send('on-chat-generation', {
        prompt: promptRequest,
        output,
        err: err ? err.message : null,
      });
    }
  });
}

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
    const promptFormatter = createPromptFormatter(customLLMEnabled);
    promptRequest.max_tokens = undefined;
    const prompt = promptFormatter.formatPrompt(promptRequest);
    log.debug(`prompt: ${prompt}`);

    if (customLLMEnabled) {
      try {
        const response = await this.customLLMService.generate(prompt);
        response.results[0].text = promptFormatter.formatOutput(
          response.results[0].text
        );
        log.debug(response);
        res.json(response);
        sendChatGeneration(promptRequest, response.results[0].text);
      } catch (err: any) {
        log.error('Error getting customllm response', err);
        res.status(400).json({
          results: [
            {
              text: err?.message,
            },
          ],
        });
      }
    } else {
      const response = await this.openAIService.generate(
        prompt,
        promptRequest.model,
        promptRequest.systemPrompt,
        90
      );
      res.json(response);
      let error: any;
      if (response?.results?.[0] && 'error' in response.results[0]) {
        error = response?.results?.[0]?.error;
      }
      let output: any;
      if (response?.results?.[0] && 'text' in response.results[0]) {
        output = response?.results?.[0].text;
      }
      sendChatGeneration(promptRequest, output, error);
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
