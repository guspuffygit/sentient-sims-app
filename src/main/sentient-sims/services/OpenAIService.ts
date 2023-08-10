/* eslint-disable max-classes-per-file */
/* eslint-disable promise/always-return */
import * as fs from 'fs';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from 'openai';
import log from 'electron-log';
import electron from 'electron';
import { encode } from '@nem035/gpt-3-encoder';
import { DirectoryService } from './DirectoryService';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService {
  private directoryService: DirectoryService;

  private settingsService: SettingsService;

  private openAIClient?: OpenAIApi;

  constructor(
    directoryService: DirectoryService,
    settingsService: SettingsService
  ) {
    this.directoryService = directoryService;
    this.settingsService = settingsService;
  }

  getOpenAIModel(): string {
    return this.settingsService.get(SettingsEnum.OPENAI_MODEL) as string;
  }

  getOpenAIKey(): string | undefined {
    // Check environment variable
    const openAIKeyFromEnv = process.env.OPENAI_KEY;
    if (openAIKeyFromEnv) {
      return openAIKeyFromEnv;
    }

    // Read JSON file
    const sentientSimsConfigFile = this.directoryService.getModSettingsFile();
    if (fs.existsSync(sentientSimsConfigFile)) {
      const configData = fs.readFileSync(sentientSimsConfigFile, 'utf8');
      const jsonData = JSON.parse(configData);
      const openAIKeyFromJson = jsonData.openai_key;
      if (openAIKeyFromJson) {
        return openAIKeyFromJson;
      }
    }

    throw new OpenAIKeyNotSetError('No OpenAI Key set!');
  }

  createOpenAIClient() {
    const openAIKey = this.getOpenAIKey();
    const configuration = new Configuration({
      apiKey: openAIKey,
    });
    return new OpenAIApi(configuration);
  }

  async testOpenAI() {
    if (!this.openAIClient) {
      this.openAIClient = this.createOpenAIClient();
    }

    const request: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      temperature: 0,
      top_p: 0,
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: 'Return the text "OK"',
        },
      ],
    };

    try {
      const response = await this.openAIClient.createChatCompletion(request);
      const { message } = response.data.choices[0];
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

  async generateChatCompletion(request: CreateChatCompletionRequest) {
    if (!this.openAIClient) {
      this.openAIClient = this.createOpenAIClient();
    }

    try {
      const response = await this.openAIClient.createChatCompletion(request);
      return { request, response: response.data };
    } catch (err: any) {
      return {
        request,
        err,
      };
    }
  }

  async generate(prompt: any, model: any, systemPrompt: any, maxLength?: any) {
    const request: CreateChatCompletionRequest = {
      model: model || this.getOpenAIModel(),
      max_tokens: maxLength,
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: systemPrompt,
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: prompt,
        },
      ],
    };

    try {
      const result = await this.generateChatCompletion(request);
      try {
        electron?.BrowserWindow?.getAllWindows().forEach((window) => {
          if (window.webContents?.isDestroyed() === false) {
            window.webContents.send('on-chat-generation', result);
          }
        });
      } catch (err) {
        log.error(`Failed sending`, err);
      }
      if (result.response) {
        const { message } = result.response.choices[0];
        if (message) {
          const responseString = message.content?.trim();

          return {
            results: [{ text: responseString }],
            request,
          };
        }
      }

      const errorMessage = 'AI request failed, no message';
      log.error(errorMessage, result);
      return {
        results: [{ text: errorMessage }],
        request,
      };
    } catch (err: any) {
      const errorMessage = 'AI request failed';
      log.error(errorMessage, err.message);
      return {
        results: [{ text: errorMessage }],
        request,
      };
    }
  }

  async getVector(text: string) {
    if (!this.openAIClient) {
      this.openAIClient = this.createOpenAIClient();
    }

    const response = await this.openAIClient.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data.data[0].embedding;
  }

  static countTokens(text: string) {
    return { count: encode(text).length };
  }
}
