import express from 'express';
import { encode } from '@nem035/gpt-3-encoder';
import log from 'electron-log';
import { app, BrowserWindow } from 'electron';
import {
  generate,
  generateChatCompletion,
  OpenAIKeyNotSetError,
  testOpenAI,
} from './openai';
import { get, getSetting, setSetting, SettingsEnum } from './settings';
import { systemPrompt as defaultSystemPrompt } from './contants';
import sendLogs from './discordLogSend';
import {
  deleteLastExceptionFiles,
  getParsedLastExceptionFiles,
} from './lastException';
import { getSettings, writeSettings } from './directories';
import { getModVersion, updateMod } from './updater';

export default function runApi(mainWindow: BrowserWindow | null) {
  const expressApp = express();
  expressApp.use(express.json());
  const port = 25148;

  expressApp.get('/health', (req, res) => {
    res.send('OK');
  });

  expressApp.get('/test-open-ai', async (req, res) => {
    try {
      const response = await testOpenAI();
      res.send(response);
    } catch (e: any) {
      if (e instanceof OpenAIKeyNotSetError) {
        res.status(400).send({ status: 'API key not set!' });
      } else {
        res.status(500).send({ error: `${e.name}: ${e.message}` });
      }
    }
  });

  expressApp.post('/api/v1/count', (req, res) => {
    res.json({ count: encode(req.body.prompt).length });
  });

  expressApp.post('/api/v1/generate', async (req, res) => {
    const { body } = req;
    const { prompt, model, systemPrompt } = body;
    const maxLength = body.max_length;

    const response = await generate(
      maxLength,
      prompt,
      model || get(SettingsEnum.OPENAI_MODEL),
      mainWindow,
      systemPrompt || defaultSystemPrompt
    );
    res.json(response);
  });

  expressApp.post('/generate', async (req, res) => {
    const { body } = req;
    const result = await generateChatCompletion(body);
    res.json(result);
  });

  expressApp.get('/send-logs', async (req, res) => {
    const result = await sendLogs();
    res.json(result);
  });

  expressApp.get('/files/last-exception', async (req, res) => {
    const lastExceptionFiles = getParsedLastExceptionFiles();
    res.json(lastExceptionFiles);
  });

  expressApp.delete('/files/last-exception', async (req, res) => {
    deleteLastExceptionFiles();
    res.json({ done: 'done' });
  });

  expressApp.get('/settings/app/:appSetting', async (req, res) => {
    const { appSetting } = req.params;
    res.json({ value: getSetting(appSetting) });
  });

  expressApp.post('/settings/app/:appSetting', async (req, res) => {
    const { appSetting } = req.params;
    const { value } = req.body;
    log.info(`Setting app setting: ${appSetting}, to value: ${value}`);
    res.json({ value: setSetting(appSetting, value) });
  });

  expressApp.get('/settings', async (req, res) => {
    res.json(getSettings());
  });

  expressApp.get('/versions/mod', async (req, res) => {
    res.json(getModVersion());
  });

  expressApp.get('/versions/app', async (req, res) => {
    res.json({ version: app.getVersion() });
  });

  expressApp.post('/settings', async (req, res) => {
    writeSettings(req.body);
    res.json(getSettings());
  });

  expressApp.post('/update/mod', async (req, res) => {
    try {
      log.info('Starting update.');
      await updateMod(req.body);
      res.json({ done: 'done' });
    } catch (err: any) {
      const response = {
        error: {
          stack: err?.stack,
          message: err?.message,
        },
      };
      log.error(`Error updating: ${response}`);
      res.status(500).json(response);
    }
  });

  expressApp.listen(port, () => {
    log.debug(`Server is running on port ${port}`);
  });
}
