import * as fs from 'fs';
import path from 'path';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from 'openai';
import log from 'electron-log';
import { BrowserWindow } from 'electron';
import { systemPrompt } from '../contants';
import { getSentientSimsFolder } from './directories';

export class OpenAIKeyNotSetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIKeyNotSetError';
  }
}

export function getOpenAIKey(): string | undefined {
  // Check environment variable
  const openAIKeyFromEnv = process.env.OPENAI_KEY;
  if (openAIKeyFromEnv) {
    return openAIKeyFromEnv;
  }

  const sentientSimsAppConfigFile = path.join(
    getSentientSimsFolder(),
    'app-settings.json'
  );
  if (fs.existsSync(sentientSimsAppConfigFile)) {
    const configData = fs.readFileSync(sentientSimsAppConfigFile, 'utf8');
    const jsonData = JSON.parse(configData);
    const openAIKeyFromJson = jsonData.openai_key;
    if (openAIKeyFromJson) {
      return openAIKeyFromJson;
    }
  }

  // Read JSON file
  const sentientSimsConfigFile = path.join(
    getSentientSimsFolder(),
    'settings.json'
  );
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

let openai: OpenAIApi;

function setupOpenAIClient() {
  const openAIKey = getOpenAIKey();
  const configuration = new Configuration({
    apiKey: openAIKey,
  });
  openai = new OpenAIApi(configuration);
}

export async function testOpenAI() {
  if (!openai) {
    setupOpenAIClient();
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
    const response = await openai.createChatCompletion(request);
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

export async function generateChatCompletion(
  request: CreateChatCompletionRequest
) {
  if (!openai) {
    setupOpenAIClient();
  }

  try {
    const response = await openai.createChatCompletion(request);
    return { request, response: response.data };
  } catch (err: any) {
    return {
      request,
      err,
    };
  }
}

export async function generate(
  maxLength: any,
  prompt: any,
  model: any,
  mainWindow: BrowserWindow | null
) {
  const request: CreateChatCompletionRequest = {
    model: model || 'gpt-3.5-turbo',
    max_tokens: maxLength || 100,
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
    const result = await generateChatCompletion(request);
    try {
      if (mainWindow) {
        mainWindow.webContents.send('on-chat-generation', result);
      }
    } catch (err) {
      log.error(`Failed sending`);
      /* empty */
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
    return {
      results: [{ text: 'AI request failed, no message' }],
      request,
    };
  } catch (err: any) {
    return {
      results: [{ text: 'AI request failed' }],
      request,
    };
  }
}
