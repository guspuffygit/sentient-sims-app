import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
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

vi.mock('electron', () => ({
  globalShortcut: { register: vi.fn(() => true), unregister: vi.fn() },
}));

const notifyMocks = vi.hoisted(() => ({
  sendPlayerVoiceMessageToMod: vi.fn(),
  sendPlayerVoiceStatusToMod: vi.fn(),
  sendPopUpNotification: vi.fn(),
}));

vi.mock('main/sentient-sims/util/notifyRenderer', () => notifyMocks);

const websocketMocks = vi.hoisted(() => ({
  isWebSocketConnected: vi.fn(() => true),
}));

vi.mock('main/sentient-sims/websocketServer', () => websocketMocks);

const windowSend = vi.hoisted(() => vi.fn());

vi.mock('main/sentient-sims/util/browserWindows', () => ({
  getAllBrowserWindows: () => [{ webContents: { isDestroyed: () => false, send: windowSend } }],
}));

// Imports resolve the mocks above

import { TranscriptionService, TranscriptionError } from 'main/sentient-sims/services/TranscriptionService';

import { parseHotkey, HotkeyCallbacks, VoiceHotkeyService } from 'main/sentient-sims/services/VoiceHotkeyService';

import { VoiceInputService } from 'main/sentient-sims/services/VoiceInputService';

const keymap = { Space: 57, V: 47, F13: 91 };

describe('parseHotkey', () => {
  it('parses modifiers and key', () => {
    expect(parseHotkey('Ctrl+Space', keymap)).toEqual({
      keycode: 57,
      ctrl: true,
      alt: false,
      shift: false,
      accelerator: 'Ctrl+Space',
    });
    expect(parseHotkey('Ctrl+Alt+Space', keymap)).toMatchObject({ keycode: 57, ctrl: true, alt: true });
    expect(parseHotkey('Alt+v', keymap)).toMatchObject({ keycode: 47, alt: true, ctrl: false });
    expect(parseHotkey('F13', keymap)).toMatchObject({ keycode: 91, ctrl: false, alt: false, shift: false });
  });

  it('rejects unknown modifiers and keys', () => {
    expect(parseHotkey('Super+Space', keymap)).toBeUndefined();
    expect(parseHotkey('Ctrl+Nope', keymap)).toBeUndefined();
    expect(parseHotkey('', keymap)).toBeUndefined();
  });
});

describe('voice input settings', () => {
  it('has working defaults', () => {
    const { settingsService } = mockEnvironment();
    expect(settingsService.voiceInputEnabled).toBe(false);
    expect(settingsService.voiceInputEndpoint).toBe('https://api.openai.com/v1');
    expect(settingsService.voiceInputModel).toBe('whisper-1');
    expect(settingsService.voiceInputHotkey).toBe('Ctrl+Space');
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
});

function transcriptionContext() {
  const { settingsService } = mockEnvironment();
  const ctx = { settings: settingsService } as unknown as ApiContext;
  return { settingsService, service: new TranscriptionService(ctx) };
}

describe('TranscriptionService', () => {
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

  it('falls back to the app OpenAI key on the OpenAI endpoint', async () => {
    const { settingsService, service } = transcriptionContext();
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const config = openaiMocks.constructorConfigs[0] as { apiKey: string };
    expect(config.apiKey).toBe('sk-app-key');
  });

  it('never sends the app OpenAI key to a custom endpoint', async () => {
    const { settingsService, service } = transcriptionContext();
    settingsService.set(SettingsEnum.OPENAI_KEY, 'sk-app-key');
    settingsService.set(SettingsEnum.VOICE_INPUT_ENDPOINT, 'http://localhost:8000/v1');
    openaiMocks.create.mockResolvedValue({ text: 'hi' });

    await service.transcribe(new ArrayBuffer(16));

    const config = openaiMocks.constructorConfigs[0] as { apiKey: string };
    expect(config.apiKey).toBe('not-set');
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
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('listening', undefined, expect.objectContaining({ mode: 'chat' }));

    service.stopListening();
    expect(windowSend).toHaveBeenCalledWith('voice-record-stop');
    expect(notifyMocks.sendPlayerVoiceStatusToMod).toHaveBeenCalledWith('transcribing');

    const text = await service.handleAudio(bigAudio());
    expect(text).toBe('Hello Bella');
    expect(notifyMocks.sendPlayerVoiceMessageToMod).toHaveBeenCalledWith('Hello Bella');
    expect(windowSend).toHaveBeenCalledWith('voice-transcript', 'Hello Bella');
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
});
