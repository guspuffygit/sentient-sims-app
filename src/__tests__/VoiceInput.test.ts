import * as http from 'http';
import { AddressInfo } from 'net';
import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from 'vitest';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { VOICE_INPUT_LANGUAGES, normalizeVoiceInputLanguage } from 'main/sentient-sims/models/VoiceInputLanguages';
import { mockEnvironment } from './util';

const openaiMocks = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
  constructorConfigs: [] as unknown[],
}));

vi.mock('openai', () => {
  class MockOpenAI {
    audio = { transcriptions: { create: openaiMocks.create } };

    models = { list: openaiMocks.list };

    constructor(config: unknown) {
      openaiMocks.constructorConfigs.push(config);
    }
  }
  return {
    default: MockOpenAI,
    toFile: vi.fn((buffer: Buffer, name: string, opts: unknown) => Promise.resolve({ buffer, name, opts })),
  };
});

const geminiMocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  list: vi.fn(),
  apiKeys: [] as string[],
}));

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  GoogleGenAI: class {
    models = { generateContent: geminiMocks.generateContent, list: geminiMocks.list };

    constructor(config: { apiKey: string }) {
      geminiMocks.apiKeys.push(config.apiKey);
    }
  },
}));

const notifyMocks = vi.hoisted(() => ({
  sendPlayerVoiceMessageToMod: vi.fn(),
  sendPlayerVoiceDraftToMod: vi.fn(),
  sendPlayerVoiceStatusToMod: vi.fn(),
  sendPopUpNotification: vi.fn(),
  sendVoiceHotkeysToMod: vi.fn(),
}));

vi.mock('main/sentient-sims/util/notifyRenderer', () => notifyMocks);

const websocketMocks = vi.hoisted(() => ({
  isWebSocketConnected: vi.fn(() => true),
  setVoiceKeySink: vi.fn(),
}));

vi.mock('main/sentient-sims/websocketServer', () => websocketMocks);

const windowSend = vi.hoisted(() => vi.fn());

vi.mock('main/sentient-sims/util/browserWindows', () => ({
  getAllBrowserWindows: () => [{ webContents: { isDestroyed: () => false, send: windowSend } }],
}));

// Imports resolve the mocks above

import { TranscriptionService, TranscriptionError } from 'main/sentient-sims/services/TranscriptionService';

import { HotkeyCallbacks, VoiceHotkeyService } from 'main/sentient-sims/services/VoiceHotkeyService';

import { VoiceInputService } from 'main/sentient-sims/services/VoiceInputService';

import {
  defaultVoiceInputHotkeyFor,
  geminiDefaultTranscriptionModel,
  openaiDefaultTranscriptionModel,
  openrouterDefaultEndpoint,
  openrouterDefaultTranscriptionModel,
} from 'main/sentient-sims/constants';

import { voiceHotkeyFromKey, voiceHotkeyLabel, voiceHotkeyPresets } from 'main/sentient-sims/models/VoiceHotkeyPresets';

import { SentientSimsAIService } from 'main/sentient-sims/services/SentientSimsAIService';

import {
  customVoiceInputProvider,
  defaultVoiceInputModelFor,
  voiceInputModelSuggestions,
  voiceInputProviderFromValue,
  voiceInputProviders,
} from 'main/sentient-sims/models/VoiceInputProvider';

type CallbackSpies = { [K in keyof HotkeyCallbacks]: Mock<() => void> };

function callbackSpies(): CallbackSpies {
  return { onDown: vi.fn<() => void>(), onUp: vi.fn<() => void>(), onToggle: vi.fn<() => void>() };
}

// The overlay reports the bound chord's edges; the service only has to turn them into
// hold or toggle semantics and tell the mod which chords to listen for
describe('VoiceHotkeyService', () => {
  beforeEach(() => {
    notifyMocks.sendVoiceHotkeysToMod.mockReset();
  });

  it('publishes the chords to the mod when armed, re-armed, and on connect', () => {
    const service = new VoiceHotkeyService();
    service.arm('Ctrl+S', 'hold', callbackSpies());
    expect(notifyMocks.sendVoiceHotkeysToMod).toHaveBeenLastCalledWith({ talk: 'Ctrl+S', command: '' });

    service.armCommand('Alt+V', callbackSpies());
    expect(notifyMocks.sendVoiceHotkeysToMod).toHaveBeenLastCalledWith({ talk: 'Ctrl+S', command: 'Alt+V' });

    notifyMocks.sendVoiceHotkeysToMod.mockReset();
    service.onModConnected();
    expect(notifyMocks.sendVoiceHotkeysToMod).toHaveBeenCalledWith({ talk: 'Ctrl+S', command: 'Alt+V' });

    service.disarm();
    expect(notifyMocks.sendVoiceHotkeysToMod).toHaveBeenLastCalledWith({ talk: '', command: '' });
  });

  it('maps press and release to down and up in hold mode', () => {
    const service = new VoiceHotkeyService();
    const talk = callbackSpies();
    service.arm('F13', 'hold', talk);

    service.onKey({ id: 'talk', down: true });
    service.onKey({ id: 'talk', down: false });

    expect(talk.onDown).toHaveBeenCalledTimes(1);
    expect(talk.onUp).toHaveBeenCalledTimes(1);
    expect(talk.onToggle).not.toHaveBeenCalled();
  });

  it('toggles on press only in toggle mode', () => {
    const service = new VoiceHotkeyService();
    const talk = callbackSpies();
    service.arm('F13', 'toggle', talk);

    service.onKey({ id: 'talk', down: true });
    service.onKey({ id: 'talk', down: false });

    expect(talk.onToggle).toHaveBeenCalledTimes(1);
    expect(talk.onDown).not.toHaveBeenCalled();
    expect(talk.onUp).not.toHaveBeenCalled();
  });

  it('routes the command chord to its own callbacks and ignores it when unarmed', () => {
    const service = new VoiceHotkeyService();
    const talk = callbackSpies();
    const command = callbackSpies();
    service.arm('Ctrl+S', 'hold', talk);

    service.onKey({ id: 'command', down: true });
    expect(command.onDown).not.toHaveBeenCalled();

    service.armCommand('Alt+V', command);
    service.onKey({ id: 'command', down: true });
    expect(command.onDown).toHaveBeenCalledTimes(1);
    expect(talk.onDown).not.toHaveBeenCalled();
  });

  it('holds the dictate button in toggle mode too, and keeps it through disarm', () => {
    const service = new VoiceHotkeyService();
    const dictate = callbackSpies();
    service.arm('F13', 'toggle', callbackSpies());
    service.armDictate(dictate);
    service.disarm();

    service.onKey({ id: 'dictate', down: true });
    service.onKey({ id: 'dictate', down: false });

    expect(dictate.onDown).toHaveBeenCalledTimes(1);
    expect(dictate.onUp).toHaveBeenCalledTimes(1);
    expect(dictate.onToggle).not.toHaveBeenCalled();
  });

  it('does nothing once disarmed', () => {
    const service = new VoiceHotkeyService();
    const talk = callbackSpies();
    service.arm('F13', 'hold', talk);
    service.disarm();

    service.onKey({ id: 'talk', down: true });

    expect(talk.onDown).not.toHaveBeenCalled();
  });
});

describe('voice hotkey presets', () => {
  it('spells a captured key the way the overlay parses it', () => {
    const key = (code: string, mods: Partial<Parameters<typeof voiceHotkeyFromKey>[0]> = {}) =>
      voiceHotkeyFromKey({ code, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });
    expect(key('KeyV', { altKey: true })).toBe('Alt+V');
    expect(key('Digit7', { ctrlKey: true, shiftKey: true })).toBe('Ctrl+Shift+7');
    expect(key('F7')).toBe('F7');
    expect(key('Numpad0')).toBe('Numpad0');
    expect(key('Space', { ctrlKey: true, altKey: true })).toBe('Ctrl+Alt+Space');
    expect(key('ControlLeft', { ctrlKey: true })).toBeUndefined();
    expect(key('MediaPlayPause')).toBeUndefined();
    expect(key('KeyV', { metaKey: true })).toBeUndefined();
  });

  it('defaults to a chord macOS leaves alone on a Mac', () => {
    expect(defaultVoiceInputHotkeyFor(true)).toBe('Alt+V');
    expect(defaultVoiceInputHotkeyFor(false)).toBe('Ctrl+S');
  });

  it('offers no chord with Space, which The Sims 4 binds', () => {
    for (const isMac of [true, false]) {
      const values = voiceHotkeyPresets(isMac).map((preset) => preset.value);
      expect(values.filter((value) => value.split('+').includes('Space'))).toEqual([]);
      expect(values).toContain('Ctrl+S');
    }
    expect(voiceHotkeyPresets(false)[0]).toEqual({ value: 'Ctrl+S', label: 'Ctrl+S' });
  });

  it('names the Alt key Opt on a Mac and keeps the stored chord', () => {
    expect(voiceHotkeyLabel('Alt+V', true)).toBe('Opt+V');
    expect(voiceHotkeyLabel('Alt+V', false)).toBe('Alt+V');
    expect(voiceHotkeyLabel('Ctrl+Alt+Space', true)).toBe('Ctrl+Opt+Space');
    expect(voiceHotkeyPresets(true)[0]).toEqual({ value: 'Alt+V', label: 'Opt+V' });
  });

  it('offers a Mac only keys it has and macOS does not take', () => {
    const values = voiceHotkeyPresets(true).map((preset) => preset.value);
    expect(values).toContain(defaultVoiceInputHotkeyFor(true));
    for (const absent of ['Insert', 'ScrollLock', 'Ctrl+Space', 'Ctrl+Alt+Space']) {
      expect(values).not.toContain(absent);
    }
    expect(voiceHotkeyPresets(false).map((preset) => preset.value)).toContain(defaultVoiceInputHotkeyFor(false));
  });

  it('keeps a saved chord the platform list no longer offers', () => {
    expect(voiceHotkeyPresets(true, 'Ctrl+Space')).toContainEqual({ value: 'Ctrl+Space', label: 'Ctrl+Space' });
    expect(voiceHotkeyPresets(false, 'Ctrl+Alt+Space')).toContainEqual({
      value: 'Ctrl+Alt+Space',
      label: 'Ctrl+Alt+Space',
    });
    expect(voiceHotkeyPresets(true, 'Alt+V')).toHaveLength(voiceHotkeyPresets(true).length);
  });
});

describe('voice input settings', () => {
  it('has working defaults', () => {
    const { settingsService } = mockEnvironment();
    expect(settingsService.voiceInputEnabled).toBe(false);
    expect(settingsService.voiceInputProvider).toBe(ApiType.SentientSimsAI);
    expect(settingsService.voiceInputEndpoint).toBe('https://api.openai.com/v1');
    expect(settingsService.voiceInputModel).toBe('whisper-1');
    expect(settingsService.voiceInputHotkey).toBe(process.platform === 'darwin' ? 'Alt+V' : 'Ctrl+S');
    expect(settingsService.voiceInputHotkeyMode).toBe('hold');
    expect(settingsService.voiceInputLanguage).toBe('');
  });

  it('round-trips values', () => {
    const { settingsService } = mockEnvironment();
    settingsService.set(SettingsEnum.VOICE_INPUT_ENABLED, true);
    settingsService.set(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'toggle');
    expect(settingsService.voiceInputEnabled).toBe(true);
    expect(settingsService.voiceInputHotkeyMode).toBe('toggle');
  });

  it('reads a free-text language as its code', () => {
    const { settingsService } = mockEnvironment();
    settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'English');
    expect(settingsService.voiceInputLanguage).toBe('en');
  });

  it('offers a default model per provider and keeps a saved pick', () => {
    const { settingsService } = mockEnvironment();
    expect(settingsService.voiceInputModelFor(ApiType.OpenAI)).toBe(openaiDefaultTranscriptionModel);
    expect(settingsService.voiceInputModelFor(ApiType.OpenRouter)).toBe(openrouterDefaultTranscriptionModel);
    expect(settingsService.voiceInputModelFor(ApiType.Gemini)).toBe(geminiDefaultTranscriptionModel);
    expect(settingsService.voiceInputModelFor(customVoiceInputProvider)).toBe('whisper-1');
    expect(settingsService.voiceInputModelFor(ApiType.SentientSimsAI)).toBeUndefined();

    settingsService.voiceInputModels = { [ApiType.OpenRouter]: 'openai/whisper-large-v3' };
    settingsService.set(SettingsEnum.VOICE_INPUT_MODEL, 'Systran/faster-whisper-small');
    expect(settingsService.voiceInputModelFor(ApiType.OpenRouter)).toBe('openai/whisper-large-v3');
    expect(settingsService.voiceInputModelFor(ApiType.OpenAI)).toBe(openaiDefaultTranscriptionModel);
    expect(settingsService.voiceInputModelFor(customVoiceInputProvider)).toBe('Systran/faster-whisper-small');
  });

  it('reads every provider back and treats unknown values as Sentient Sims AI', () => {
    const { settingsService } = mockEnvironment();
    for (const provider of voiceInputProviders) {
      settingsService.voiceInputProvider = provider;
      expect(settingsService.voiceInputProvider).toBe(provider);
    }
    settingsService.set(SettingsEnum.VOICE_INPUT_PROVIDER, 'koboldai');
    expect(settingsService.voiceInputProvider).toBe(ApiType.SentientSimsAI);
  });

  it('migrates a legacy openai provider pointed at a custom server to the custom provider', () => {
    const { settingsService } = mockEnvironment();
    settingsService.set(SettingsEnum.VOICE_INPUT_PROVIDER, ApiType.OpenAI);
    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'http://localhost:8000/v1');
    settingsService.set(SettingsEnum.VOICE_INPUT_MODEL, 'Systran/faster-whisper-small');

    settingsService.runMigrations();

    expect(settingsService.voiceInputProvider).toBe(customVoiceInputProvider);
    expect(settingsService.voiceInputModelFor(customVoiceInputProvider)).toBe('Systran/faster-whisper-small');
    expect(settingsService.voiceInputModels).toEqual({});
  });

  it('migrates a legacy openai provider on the OpenAI endpoint and keeps its model', () => {
    const { settingsService } = mockEnvironment();
    settingsService.set(SettingsEnum.VOICE_INPUT_PROVIDER, ApiType.OpenAI);

    settingsService.runMigrations();

    expect(settingsService.voiceInputProvider).toBe(ApiType.OpenAI);
    expect(settingsService.voiceInputModelFor(ApiType.OpenAI)).toBe('whisper-1');

    // A second launch leaves a later pick alone
    settingsService.voiceInputModels = { [ApiType.OpenAI]: 'gpt-4o-transcribe' };
    settingsService.runMigrations();
    expect(settingsService.voiceInputModelFor(ApiType.OpenAI)).toBe('gpt-4o-transcribe');
  });
});

describe('voice input providers', () => {
  it('maps the legacy openai value by endpoint', () => {
    expect(voiceInputProviderFromValue(ApiType.OpenAI, 'https://api.openai.com/v1')).toBe(ApiType.OpenAI);
    expect(voiceInputProviderFromValue(ApiType.OpenAI, 'http://localhost:8000/v1')).toBe(customVoiceInputProvider);
    expect(voiceInputProviderFromValue(ApiType.OpenAI)).toBe(ApiType.OpenAI);
    expect(voiceInputProviderFromValue(undefined)).toBe(ApiType.SentientSimsAI);
  });

  it('suggests models that start with each provider default', () => {
    for (const provider of voiceInputProviders) {
      const fallback = defaultVoiceInputModelFor(provider);
      const suggestions = voiceInputModelSuggestions(provider);
      if (provider === ApiType.SentientSimsAI) {
        expect(fallback).toBeUndefined();
        expect(suggestions).toEqual([]);
      } else {
        expect(suggestions[0]).toBe(fallback);
      }
    }
    expect(voiceInputModelSuggestions(ApiType.OpenRouter).every((model) => model.includes('/'))).toBe(true);
  });
});

describe('normalizeVoiceInputLanguage', () => {
  it.each([
    ['en', 'en'],
    ['EN', 'en'],
    [' de ', 'de'],
    ['English', 'en'],
    ['english', 'en'],
    ['en-US', 'en'],
    ['pt_BR', 'pt'],
    ['', ''],
    [undefined, ''],
    ['zz', ''],
    ['Klingon', ''],
  ])('maps %j to %j', (value, code) => {
    expect(normalizeVoiceInputLanguage(value)).toBe(code);
  });

  it('keeps every listed code and resolves every listed name', () => {
    for (const language of VOICE_INPUT_LANGUAGES) {
      expect(normalizeVoiceInputLanguage(language.code)).toBe(language.code);
      expect(normalizeVoiceInputLanguage(language.name)).toBe(language.code);
    }
  });
});

function transcriptionContext(provider: string = customVoiceInputProvider) {
  const { settingsService } = mockEnvironment();
  settingsService.set(SettingsEnum.VOICE_INPUT_PROVIDER, provider);
  const ctx = { settings: settingsService } as unknown as ApiContext;
  return { settingsService, service: new TranscriptionService(ctx) };
}

type OpenAIClientConfig = { apiKey: string; baseURL: string; defaultHeaders?: Record<string, string> };

describe('TranscriptionService on a custom OpenAI-compatible endpoint', () => {
  beforeEach(() => {
    openaiMocks.create.mockReset();
    openaiMocks.constructorConfigs.length = 0;
  });

  it('sends model and returns trimmed text', async () => {
    const { service } = transcriptionContext();
    openaiMocks.create.mockResolvedValue({ text: '  Hello there.  ' });

    const text = await service.transcribe(new ArrayBuffer(16));

    expect(text).toBe('Hello there.');
    const request = openaiMocks.create.mock.calls[0][0] as { model: string; language?: string };
    expect(request.model).toBe('whisper-1');
    expect(request.language).toBeUndefined();
  });

  it('passes a configured language hint', async () => {
    const { settingsService, service } = transcriptionContext();
    settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'de');
    openaiMocks.create.mockResolvedValue({ text: 'Hallo' });

    await service.transcribe(new ArrayBuffer(16));

    const request = openaiMocks.create.mock.calls[0][0] as { language?: string };
    expect(request.language).toBe('de');
  });

  it('wraps provider failures in TranscriptionError', async () => {
    const { service } = transcriptionContext();
    openaiMocks.create.mockRejectedValue(new Error('401 Unauthorized'));

    await expect(service.transcribe(new ArrayBuffer(16))).rejects.toThrow(TranscriptionError);
  });

  it('never sends the app OpenAI key to a custom endpoint', async () => {
    const { settingsService, service } = transcriptionContext();
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'http://localhost:8000/v1');
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const config = openaiMocks.constructorConfigs[0] as OpenAIClientConfig;
    expect(config.apiKey).toBe('not-set');
    expect(config.baseURL).toBe('http://localhost:8000/v1');
  });

  it('sends the voice key the user typed', async () => {
    const { settingsService, service } = transcriptionContext();
    settingsService.set(SettingsEnum.VOICE_INPUT_KEY, 'gsk-groq');
    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'https://api.groq.com/openai/v1');
    settingsService.set(SettingsEnum.VOICE_INPUT_MODEL, 'whisper-large-v3-turbo');
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const config = openaiMocks.constructorConfigs[0] as OpenAIClientConfig;
    expect(config.apiKey).toBe('gsk-groq');
    const request = openaiMocks.create.mock.calls[0][0] as { model: string };
    expect(request.model).toBe('whisper-large-v3-turbo');
  });

  it('rebuilds the client when endpoint or key changes', async () => {
    const { settingsService, service } = transcriptionContext();
    openaiMocks.create.mockResolvedValue({ text: 'one' });

    await service.transcribe(new ArrayBuffer(16));
    await service.transcribe(new ArrayBuffer(16));
    expect(openaiMocks.constructorConfigs).toHaveLength(1);

    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'http://localhost:8000/v1');
    await service.transcribe(new ArrayBuffer(16));
    expect(openaiMocks.constructorConfigs).toHaveLength(2);
  });
});

describe('TranscriptionService on OpenAI', () => {
  beforeEach(() => {
    openaiMocks.create.mockReset();
    openaiMocks.constructorConfigs.length = 0;
  });

  it('uses the app OpenAI key and endpoint with the OpenAI transcription model', async () => {
    const { settingsService, service } = transcriptionContext(ApiType.OpenAI);
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    // The custom endpoint settings play no part here
    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'http://localhost:8000/v1');
    settingsService.set(SettingsEnum.VOICE_INPUT_KEY, 'local-key');
    settingsService.set(SettingsEnum.VOICE_INPUT_MODEL, 'Systran/faster-whisper-small');
    openaiMocks.create.mockResolvedValue({ text: ' Hello ' });

    const text = await service.transcribe(new ArrayBuffer(16));

    expect(text).toBe('Hello');
    const config = openaiMocks.constructorConfigs[0] as OpenAIClientConfig;
    expect(config.apiKey).toBe('sk-app-key');
    expect(config.baseURL).toBe('https://api.openai.com/v1');
    expect(config.defaultHeaders).toBeUndefined();
    const request = openaiMocks.create.mock.calls[0][0] as { model: string };
    expect(request.model).toBe(openaiDefaultTranscriptionModel);
  });

  it('sends the model picked for OpenAI', async () => {
    const { settingsService, service } = transcriptionContext(ApiType.OpenAI);
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    settingsService.voiceInputModels = { [ApiType.OpenAI]: 'whisper-1', [ApiType.OpenRouter]: 'openai/whisper-1' };
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const request = openaiMocks.create.mock.calls[0][0] as { model: string };
    expect(request.model).toBe('whisper-1');
  });

  it('rebuilds the client when the provider changes', async () => {
    const { settingsService, service } = transcriptionContext(ApiType.OpenAI);
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    settingsService.set(SettingsEnum.OPENROUTER_KEY, 'sk-or-key');
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));
    settingsService.voiceInputProvider = ApiType.OpenRouter;
    await service.transcribe(new ArrayBuffer(16));

    expect(openaiMocks.constructorConfigs).toHaveLength(2);
    expect((openaiMocks.constructorConfigs[1] as OpenAIClientConfig).apiKey).toBe('sk-or-key');
  });
});

describe('TranscriptionService on OpenRouter', () => {
  beforeEach(() => {
    openaiMocks.create.mockReset();
    openaiMocks.constructorConfigs.length = 0;
  });

  it('uses the OpenRouter key, endpoint, attribution headers and model', async () => {
    const { settingsService, service } = transcriptionContext(ApiType.OpenRouter);
    settingsService.set(SettingsEnum.OPENROUTER_KEY, 'sk-or-key');
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'fr');
    openaiMocks.create.mockResolvedValue({ text: 'Bonjour' });

    const text = await service.transcribe(new ArrayBuffer(16));

    expect(text).toBe('Bonjour');
    const config = openaiMocks.constructorConfigs[0] as OpenAIClientConfig;
    expect(config.apiKey).toBe('sk-or-key');
    expect(config.baseURL).toBe(openrouterDefaultEndpoint);
    expect(config.defaultHeaders).toEqual({
      'HTTP-Referer': 'https://sentientsimulations.com',
      'X-Title': 'Sentient Sims',
    });
    const request = openaiMocks.create.mock.calls[0][0] as { model: string; language?: string };
    expect(request.model).toBe(openrouterDefaultTranscriptionModel);
    expect(request.language).toBe('fr');
  });

  it('sends the model picked for OpenRouter', async () => {
    const { settingsService, service } = transcriptionContext(ApiType.OpenRouter);
    settingsService.set(SettingsEnum.OPENROUTER_KEY, 'sk-or-key');
    settingsService.voiceInputModels = { [ApiType.OpenRouter]: 'openai/whisper-large-v3' };
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const request = openaiMocks.create.mock.calls[0][0] as { model: string };
    expect(request.model).toBe('openai/whisper-large-v3');
  });
});

type GeminiRequest = {
  model: string;
  config?: { temperature?: number };
  contents: { parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[];
};

function geminiContext(onLotNames: string[] = []) {
  const { settingsService } = mockEnvironment();
  settingsService.set(SettingsEnum.VOICE_INPUT_PROVIDER, ApiType.Gemini);
  settingsService.geminiKeys = 'gm-key-1, gm-key-2';
  const ctx = {
    settings: settingsService,
    simStateCache: { getReport: () => ({ sims: onLotNames.map((name) => ({ sim_name: name, sims: [] })) }) },
  } as unknown as ApiContext;
  return { settingsService, service: new TranscriptionService(ctx) };
}

describe('TranscriptionService on Gemini', () => {
  beforeEach(() => {
    openaiMocks.create.mockReset();
    geminiMocks.generateContent.mockReset();
    geminiMocks.apiKeys.length = 0;
  });

  it('hands the recording to a text model inline and returns the bare transcript', async () => {
    const { settingsService, service } = geminiContext(['Bella Goth']);
    settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'de');
    geminiMocks.generateContent.mockResolvedValue({ text: ' "Hallo Bella." ' });
    const audio = new Uint8Array([1, 2, 3, 4]);

    const text = await service.transcribe(audio.buffer, 'audio/webm;codecs=opus');

    expect(text).toBe('Hallo Bella.');
    expect(openaiMocks.create).not.toHaveBeenCalled();
    expect(['gm-key-1', 'gm-key-2']).toContain(geminiMocks.apiKeys[0]);
    const request = geminiMocks.generateContent.mock.calls[0][0] as GeminiRequest;
    expect(request.model).toBe(geminiDefaultTranscriptionModel);
    expect(request.config?.temperature).toBe(0);
    const [instruction, inline] = request.contents[0].parts;
    expect(instruction.text).toContain('Transcribe');
    expect(instruction.text).toContain('German');
    expect(instruction.text).toContain('Bella Goth');
    expect(inline.inlineData).toEqual({ mimeType: 'audio/webm', data: Buffer.from(audio).toString('base64') });
  });

  it('sends the model picked for Gemini', async () => {
    const { settingsService, service } = geminiContext();
    settingsService.voiceInputModels = { [ApiType.Gemini]: 'gemini-flash-lite-latest' };
    geminiMocks.generateContent.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const request = geminiMocks.generateContent.mock.calls[0][0] as GeminiRequest;
    expect(request.model).toBe('gemini-flash-lite-latest');
  });

  it('treats an empty answer as hearing nothing', async () => {
    const { service } = geminiContext();
    geminiMocks.generateContent.mockResolvedValue({ text: undefined });

    expect(await service.transcribe(new ArrayBuffer(16))).toBe('');
  });

  it('fails clearly without a Gemini key', async () => {
    const { settingsService, service } = geminiContext();
    settingsService.geminiKeys = '';

    const failure = service.transcribe(new ArrayBuffer(16));

    await expect(failure).rejects.toThrow(TranscriptionError);
    await expect(failure).rejects.toThrow('No Gemini API key set');
    expect(geminiMocks.generateContent).not.toHaveBeenCalled();
  });

  it('wraps Gemini failures in TranscriptionError', async () => {
    const { service } = geminiContext();
    geminiMocks.generateContent.mockRejectedValue(new Error('429 quota'));

    await expect(service.transcribe(new ArrayBuffer(16))).rejects.toThrow(TranscriptionError);
  });
});

type CapturedTranscription = {
  headers: http.IncomingHttpHeaders;
  body: { model?: string; input_audio: { data: string; format: string }; language?: string; prompt?: string };
};

// Minimal stand-in for the Sentient Sims AI server's /v1/audio/transcriptions endpoint
async function startTranscriptionServer(status: number, reply: object) {
  const requests: CapturedTranscription[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      requests.push({
        headers: req.headers,
        body: JSON.parse(Buffer.concat(chunks).toString()) as CapturedTranscription['body'],
      });
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(reply));
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
}

function sentientSimsTranscriptionContext(endpoint: string, onLotNames: string[] = []) {
  const { settingsService } = mockEnvironment();
  settingsService.sentientSimsAIEndpoint = endpoint;
  settingsService.accessToken = 'test-token';
  const ctx = {
    settings: settingsService,
    version: { getVersionHeaders: () => ({}) },
    db: { sessionId: undefined },
    simStateCache: { getReport: () => ({ sims: onLotNames.map((name) => ({ sim_name: name, sims: [] })) }) },
  } as unknown as ApiContext;
  (ctx as { sentientSimsTranscription: unknown }).sentientSimsTranscription = new SentientSimsAIService(ctx);
  return { settingsService, service: new TranscriptionService(ctx) };
}

describe('TranscriptionService on Sentient Sims AI', () => {
  beforeEach(() => {
    openaiMocks.create.mockReset();
  });

  it('posts base64 JSON with the login token and leaves the model to the server', async () => {
    const server = await startTranscriptionServer(200, { text: '  Hello Bella.  ' });
    try {
      const { settingsService, service } = sentientSimsTranscriptionContext(server.url);
      settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'de');
      const audio = new Uint8Array([1, 2, 3, 4]);

      const text = await service.transcribe(audio.buffer, 'audio/webm;codecs=opus');

      expect(text).toBe('Hello Bella.');
      expect(openaiMocks.create).not.toHaveBeenCalled();
      expect(server.requests).toHaveLength(1);
      expect(server.requests[0].headers.authentication).toBe('test-token');
      expect(server.requests[0].headers.authorization).toBeUndefined();
      expect(server.requests[0].body).toEqual({
        input_audio: { data: Buffer.from(audio).toString('base64'), format: 'webm' },
        language: 'de',
      });
    } finally {
      await server.close();
    }
  });

  it('sends a language name saved as free text as its code', async () => {
    const server = await startTranscriptionServer(200, { text: 'Hello' });
    try {
      const { settingsService, service } = sentientSimsTranscriptionContext(server.url);
      settingsService.set(SettingsEnum.VOICE_INPUT_LANGUAGE, 'English');

      await service.transcribe(new Uint8Array([1, 2, 3, 4]).buffer);

      expect(server.requests[0].body.language).toBe('en');
    } finally {
      await server.close();
    }
  });

  it('sends the names in play as the prompt', async () => {
    const server = await startTranscriptionServer(200, { text: 'Hello Lillie' });
    try {
      const { service } = sentientSimsTranscriptionContext(server.url, ['Lillie Chatman', 'Mika Sol']);

      await service.transcribe(new ArrayBuffer(16));

      expect(server.requests[0].body.prompt).toContain('Lillie Chatman');
      expect(server.requests[0].body.prompt).toContain('Mika Sol');
    } finally {
      await server.close();
    }
  });

  it('surfaces the server error reason', async () => {
    const server = await startTranscriptionServer(400, { error: 'Transcription audio is larger than the 25MB limit' });
    try {
      const { service } = sentientSimsTranscriptionContext(server.url);

      const failure = service.transcribe(new ArrayBuffer(16));

      await expect(failure).rejects.toThrow(TranscriptionError);
      await expect(failure).rejects.toThrow('Transcription audio is larger than the 25MB limit');
    } finally {
      await server.close();
    }
  });
});

class FakeHotkeyService extends VoiceHotkeyService {
  capturedCallbacks?: HotkeyCallbacks;

  armed?: { hotkey: string; mode: string };

  disarmed = 0;

  commandArmed?: string;

  override armCommand(hotkey: string, callbacks: HotkeyCallbacks) {
    this.commandArmed = hotkey;
    super.armCommand(hotkey, callbacks);
  }

  override arm(hotkey: string, mode: 'hold' | 'toggle', callbacks: HotkeyCallbacks) {
    this.armed = { hotkey, mode };
    this.capturedCallbacks = callbacks;
  }

  override disarm() {
    this.disarmed += 1;
  }
}

// voiceCommand: false is a build without the autonomy tier, which has nobody to carry an
// order out (ApiContext.ext.voiceCommand stays empty)
function voiceInputContext(options?: { enabled?: boolean; voiceCommand?: boolean }) {
  const { settingsService } = mockEnvironment();
  settingsService.set(SettingsEnum.VOICE_INPUT_ENABLED, options?.enabled ?? true);
  const transcribe = vi.fn();
  const ext = options?.voiceCommand === false ? {} : { voiceCommand: { handleCommand: vi.fn() } };
  const ctx = { settings: settingsService, transcription: { transcribe }, ext } as unknown as ApiContext;
  const hotkey = new FakeHotkeyService();
  const service = new VoiceInputService(ctx, hotkey);
  service.initialize();
  return { settingsService, service, hotkey, transcribe };
}

function bigAudio(): ArrayBuffer {
  return new ArrayBuffer(4096);
}

describe('VoiceInputService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notifyMocks.sendPlayerVoiceMessageToMod.mockReset();
    notifyMocks.sendPlayerVoiceStatusToMod.mockReset();
    notifyMocks.sendPopUpNotification.mockReset();
    websocketMocks.isWebSocketConnected.mockReset().mockReturnValue(true);
    windowSend.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('arms the command chord when a tier can carry out orders', () => {
    const { hotkey } = voiceInputContext();
    expect(hotkey.commandArmed).toBeDefined();
  });

  it('never arms the command chord in a build without the autonomy tier', () => {
    const { hotkey } = voiceInputContext({ voiceCommand: false });
    expect(hotkey.armed).toBeDefined();
    expect(hotkey.commandArmed).toBeUndefined();
  });

  it('does not arm the hotkey while disabled', () => {
    const { hotkey } = voiceInputContext({ enabled: false });
    expect(hotkey.armed).toBeUndefined();
    expect(hotkey.disarmed).toBeGreaterThan(0);
  });

  it('refuses to record when the mod is disconnected', () => {
    websocketMocks.isWebSocketConnected.mockReturnValue(false);
    const { service } = voiceInputContext();

    service.startListening();

    expect(notifyMocks.sendPopUpNotification).toHaveBeenCalled();
    expect(notifyMocks.sendPlayerVoiceStatusToMod).not.toHaveBeenCalled();
    expect(windowSend).not.toHaveBeenCalledWith('voice-record-start');
  });

  it('runs the listen/stop/transcribe/send pipeline', async () => {
    const { service, transcribe } = voiceInputContext();
    transcribe.mockResolvedValue('Hello Bella');

    service.startListening();
    expect(windowSend).toHaveBeenCalledWith('voice-record-start');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith(
      'listening',
      undefined,
      expect.objectContaining({ mode: 'chat' }),
    );

    service.stopListening();
    expect(windowSend).toHaveBeenCalledWith('voice-record-stop');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('transcribing');

    const text = await service.handleAudio(bigAudio());
    expect(text).toBe('Hello Bella');
    expect(notifyMocks.sendPlayerVoiceMessageToMod).toHaveBeenCalledWith('Hello Bella');
    expect(windowSend).toHaveBeenCalledWith('voice-transcript', 'Hello Bella');
  });

  it('sends a dictation back as a draft, never to the sim', async () => {
    const { service, hotkey, transcribe } = voiceInputContext();
    notifyMocks.sendPlayerVoiceDraftToMod.mockReset();
    transcribe.mockResolvedValue('Hello Bella');

    hotkey.onKey({ id: 'dictate', down: true });
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith(
      'listening',
      undefined,
      expect.objectContaining({ mode: 'dictate' }),
    );
    hotkey.onKey({ id: 'dictate', down: false });
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('transcribing');

    await service.handleAudio(bigAudio());
    expect(notifyMocks.sendPlayerVoiceDraftToMod).toHaveBeenCalledWith('Hello Bella');
    expect(notifyMocks.sendPlayerVoiceMessageToMod).not.toHaveBeenCalled();
  });

  it('answers a dictation too short to hear with an empty draft', async () => {
    const { service, hotkey } = voiceInputContext();
    notifyMocks.sendPlayerVoiceDraftToMod.mockReset();

    hotkey.onKey({ id: 'dictate', down: true });
    hotkey.onKey({ id: 'dictate', down: false });
    await service.handleAudio(new ArrayBuffer(8));

    expect(notifyMocks.sendPlayerVoiceDraftToMod).toHaveBeenCalledWith('');
  });

  it('tells the dictate button that voice input is off', () => {
    const { hotkey } = voiceInputContext({ enabled: false });

    hotkey.onKey({ id: 'dictate', down: true });

    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('Voice input is off'),
      expect.objectContaining({ mode: 'dictate' }),
    );
    expect(windowSend).not.toHaveBeenCalledWith('voice-record-start');
  });

  it('ignores a second start while already recording', () => {
    const { service } = voiceInputContext();
    service.startListening();
    windowSend.mockClear();

    service.startListening();

    expect(windowSend).not.toHaveBeenCalledWith('voice-record-start');
  });

  it('drops accidental taps without transcription', async () => {
    const { service, transcribe } = voiceInputContext();
    service.startListening();
    service.stopListening();

    const text = await service.handleAudio(new ArrayBuffer(10));

    expect(text).toBe('');
    expect(transcribe).not.toHaveBeenCalled();
    expect(notifyMocks.sendPlayerVoiceMessageToMod).not.toHaveBeenCalled();

    // The state machine returned to idle: a new recording can start
    windowSend.mockClear();
    service.startListening();
    expect(windowSend).toHaveBeenCalledWith('voice-record-start');
  });

  it('reports empty transcripts as heard nothing', async () => {
    const { service, transcribe } = voiceInputContext();
    transcribe.mockResolvedValue('');

    const text = await service.handleAudio(bigAudio());

    expect(text).toBe('');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('error', 'Heard nothing');
    expect(notifyMocks.sendPlayerVoiceMessageToMod).not.toHaveBeenCalled();
  });

  it('surfaces transcription failures without sending to the mod', async () => {
    const { service, transcribe } = voiceInputContext();
    transcribe.mockRejectedValue(new Error('endpoint down'));

    const text = await service.handleAudio(bigAudio());

    expect(text).toBe('');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('error', 'Transcription failed');
    expect(notifyMocks.sendPopUpNotification).toHaveBeenCalled();
    expect(notifyMocks.sendPlayerVoiceMessageToMod).not.toHaveBeenCalled();
  });

  it('force-stops a recording after the max duration', () => {
    const { service } = voiceInputContext();
    service.startListening();

    vi.advanceTimersByTime(60001);

    expect(windowSend).toHaveBeenCalledWith('voice-record-stop');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('transcribing');
  });

  it('toggle callback starts and stops recording', () => {
    const { service, settingsService, hotkey } = voiceInputContext();
    settingsService.set(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'toggle');
    service.onSettingChanged(SettingsEnum.VOICE_INPUT_HOTKEY_MODE);
    expect(hotkey.armed?.mode).toBe('toggle');

    hotkey.capturedCallbacks?.onToggle();
    expect(windowSend).toHaveBeenCalledWith('voice-record-start');

    hotkey.capturedCallbacks?.onToggle();
    expect(windowSend).toHaveBeenCalledWith('voice-record-stop');
  });

  it('disarms when voice input is turned off', () => {
    const { service, settingsService, hotkey } = voiceInputContext();
    const disarmsBefore = hotkey.disarmed;

    settingsService.set(SettingsEnum.VOICE_INPUT_ENABLED, false);
    service.onSettingChanged(SettingsEnum.VOICE_INPUT_ENABLED);

    expect(hotkey.disarmed).toBeGreaterThan(disarmsBefore);
  });

  it('tells the mod when voice input is turned off mid-hold', () => {
    const { service, settingsService } = voiceInputContext();
    service.startListening();

    settingsService.set(SettingsEnum.VOICE_INPUT_ENABLED, false);
    service.onSettingChanged(SettingsEnum.VOICE_INPUT_ENABLED);

    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenLastCalledWith('cancelled');
  });

  it('tells the mod when it shuts down mid-hold', () => {
    const { service } = voiceInputContext();
    service.startListening();

    service.shutdown();

    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenLastCalledWith('cancelled');
  });

  it('sends no cancel when no hold is open', async () => {
    const { service, transcribe } = voiceInputContext();
    transcribe.mockResolvedValue('Hello Bella');
    service.startListening();
    service.stopListening();
    await service.handleAudio(bigAudio());

    service.shutdown();

    expect(notifyMocks.sendPlayerVoiceStatusToMod).not.toHaveBeenCalledWith('cancelled');
  });
});
