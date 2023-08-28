/* eslint-disable max-classes-per-file */
/* eslint-disable promise/always-return */
import * as fs from 'fs';
import log from 'electron-log';
import { encode } from '@nem035/gpt-3-encoder';
import OpenAI from 'openai';
import { CompletionCreateParamsNonStreaming } from 'openai/src/resources/chat/completions';
import { DirectoryService } from './DirectoryService';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { defaultSystemPrompt } from '../constants';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export class OpenAIService {
  private directoryService: DirectoryService;

  private settingsService: SettingsService;

  private openAIClient?: OpenAI;

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

    try {
      const response = await this.openAIClient.chat.completions.create(request);
      return { request, response };
    } catch (err: any) {
      return {
        request,
        err,
      };
    }
  }

  async generate(prompt: any, model: any, systemPrompt: any, maxLength?: any) {
    const request: CompletionCreateParamsNonStreaming = {
      stream: false,
      model: model || this.getOpenAIModel(),
      max_tokens: maxLength,
      messages: [
        {
          role: 'system',
          content: systemPrompt || defaultSystemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    try {
      const result = await this.generateChatCompletion(request);
      if (result.response) {
        const { message } = result.response.choices[0];
        if (message) {
          const responseString = message.content?.trim();

          log.debug(`Result:\n${responseString}`);
          return {
            results: [{ text: responseString }],
            request,
          };
        }
      } else if (result.err) {
        log.error(`OpenAI Request failed`, result.err);
        return {
          results: [{ error: result.err?.message }],
          request,
        };
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

    const response = await this.openAIClient?.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  static countTokens(text: string) {
    return { count: encode(text).length };
  }
}
