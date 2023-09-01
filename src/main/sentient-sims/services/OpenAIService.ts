/* eslint-disable max-classes-per-file,class-methods-use-this */
/* eslint-disable promise/always-return */
import * as fs from 'fs';
import log from 'electron-log';
import OpenAI from 'openai';
import {
  ChatCompletion,
  CompletionCreateParamsNonStreaming,
} from 'openai/src/resources/chat/completions';
import { DirectoryService } from './DirectoryService';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { defaultSystemPrompt } from '../constants';
import { PromptRequest } from '../models/PromptRequest';
import { OpenAIPromptFormatter } from '../formatter/OpenAIPromptFormatter';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService implements GenerationService {
  private directoryService: DirectoryService;

  private settingsService: SettingsService;

  private promptFormatter: OpenAIPromptFormatter;

  private openAIClient?: OpenAI;

  constructor(
    directoryService: DirectoryService,
    settingsService: SettingsService,
    promptFormatter: OpenAIPromptFormatter
  ) {
    this.directoryService = directoryService;
    this.settingsService = settingsService;
    this.promptFormatter = promptFormatter;
  }

  getOpenAIModel(): string {
    return this.settingsService.get(SettingsEnum.OPENAI_MODEL) as string;
  }

  getOpenAIKey(): string | undefined {
    // Check app settings
    const openAIKeyFromSettings = this.settingsService.get(
      SettingsEnum.OPENAI_KEY
    );
    if (openAIKeyFromSettings) {
      log.debug('Using openai key from settings');
      return openAIKeyFromSettings as string;
    }

    // Check environment variable
    const openAIKeyFromEnv = process.env.OPENAI_KEY;
    if (openAIKeyFromEnv) {
      log.debug('Using openai key from environment');
      return openAIKeyFromEnv;
    }

    // Read JSON file
    const sentientSimsConfigFile = this.directoryService.getModSettingsFile();
    if (fs.existsSync(sentientSimsConfigFile)) {
      const configData = fs.readFileSync(sentientSimsConfigFile, 'utf8');
      const jsonData = JSON.parse(configData);
      const openAIKeyFromJson = jsonData.openai_key;
      if (openAIKeyFromJson) {
        log.debug('Using openai key from mod settings');
        return openAIKeyFromJson;
      }
    }

    throw new OpenAIKeyNotSetError('No OpenAI Key set!');
  }

  createOpenAIClient() {
    const openAIKey = this.getOpenAIKey();
    return new OpenAI({
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
      apiKey: openAIKey,
    });
  }

  async testOpenAI(openAIKey?: string) {
    let client: OpenAI;

    if (openAIKey) {
      log.debug('Testing with openAIKey parameter');
      client = new OpenAI({
        apiKey: openAIKey as string,
      });
    } else {
      if (!this.openAIClient) {
        this.openAIClient = this.createOpenAIClient();
      }
      client = this.openAIClient;
    }

    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      temperature: 0,
      top_p: 0,
      messages: [
        {
          role: 'user',
          content: 'Return the text "OK"',
        },
      ],
    };

    try {
      const response = await client.chat.completions.create(request);
      const { message } = response.choices[0];
      if (message) {
        return {
          status: message.content?.trim(),
        };
      }
      return {
        status: 'not working, no message',
      };
    } catch (error: any) {
      log.error('Error testing OpenAI API:', error);

      return {
        status: 'not working, send logs to debug',
      };
    }
  }

  async generateChatCompletion(request: CompletionCreateParamsNonStreaming) {
    request.stream = false;

    if (!this.openAIClient) {
      this.openAIClient = this.createOpenAIClient();
    }

    log.debug(JSON.stringify(request, null, 2));

    return this.openAIClient.chat.completions.create(request);
  }

  async sentientSimsGenerate(
    promptRequest: PromptRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = this.promptFormatter.formatPrompt(promptRequest);
    const systemPrompt = promptRequest.systemPrompt || defaultSystemPrompt;
    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: promptRequest.model || this.getOpenAIModel(),
      max_tokens: 90,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
    const result = await this.generateChatCompletion(request);
    const text = this.getOutputFromGeneration(result);
    return {
      text,
      systemPrompt,
    };
  }

  getOutputFromGeneration(generation: ChatCompletion) {
    const output = generation.choices[0].message.content;
    if (output) {
      return output.trim();
    }

    throw new Error(`Output wasnt truthy ${output}`);
  }

  async translate(text: string, language: string) {
    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Translate the user input from English to ${language}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    };
    const result = await this.generateChatCompletion(request);
    return this.getOutputFromGeneration(result);
  }

  async getVector(text: string) {
    if (!this.openAIClient) {
      this.openAIClient = this.createOpenAIClient();
    }

    const response = await this.openAIClient?.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  async sentientSimsWants(
    promptRequest: PromptRequest
  ): Promise<SimsGenerateResponse> {
    const prompt = this.promptFormatter.formatPrompt(promptRequest);
    const systemPrompt =
      'If you were the character in the story, what would you want to do?';
    promptRequest.systemPrompt = systemPrompt;
    promptRequest.preResponse = 'I want to';
    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: promptRequest.model || this.getOpenAIModel(),
      max_tokens: 90,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
        {
          role: 'assistant',
          content: promptRequest.preResponse,
        },
      ],
    };
    const chatCompletion = await this.generateChatCompletion(request);
    const response = this.getOutputFromGeneration(chatCompletion);
    const output = this.promptFormatter.formatOutput(response);
    const text = [promptRequest.preResponse, output].join(' ');
    return {
      text,
      systemPrompt,
    };
  }
}
