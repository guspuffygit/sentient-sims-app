import log from 'electron-log';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { isSecretSettingName, redactSettingValue } from 'main/sentient-sims/util/redactSetting';
import { mockApiContext } from './util';

const SENTINEL = 'sentinel-secret-value';

const twitchAuth = { accessToken: SENTINEL, refreshToken: SENTINEL, broadcasterId: '123', login: 'somechannel' };
const redactedTwitchAuth =
  '{"accessToken":"<redacted>","refreshToken":"<redacted>","broadcasterId":"123","login":"somechannel"}';

const secretSettings = Object.values(SettingsEnum).filter(isSecretSettingName);

describe('setting redaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts a set secret and leaves an unset one as it is', () => {
    expect(redactSettingValue('openaiKey', SENTINEL)).toBe('<redacted>');
    expect(redactSettingValue('geminiKeys', `${SENTINEL},${SENTINEL}`)).toBe('<redacted>');
    expect(redactSettingValue('openaiKey', '')).toBe('');
    expect(redactSettingValue('accessToken', undefined)).toBeUndefined();
  });

  it('redacts a secret whose value is not a string', () => {
    expect(redactSettingValue('geminiKeys', [SENTINEL])).toBe('<redacted>');
    expect(redactSettingValue('accessToken', { value: SENTINEL })).toBe('<redacted>');
  });

  it('redacts secret fields nested in objects and arrays', () => {
    expect(JSON.stringify(redactSettingValue('twitchAuth', twitchAuth))).toBe(redactedTwitchAuth);
    expect(
      redactSettingValue('aiProviderConfigs', [{ id: 'a', api_key: SENTINEL, nested: { password: SENTINEL } }]),
    ).toEqual([{ id: 'a', api_key: '<redacted>', nested: { password: '<redacted>' } }]);
  });

  it('leaves hotkeys and token budgets readable', () => {
    expect(redactSettingValue('voiceInputHotkey', 'F8')).toBe('F8');
    expect(redactSettingValue('voiceCommandHotkey', 'F9')).toBe('F9');
    expect(redactSettingValue('maxResponseTokens', 300)).toBe(300);
  });

  it('counts every key or token setting as a secret unless it is listed as readable', () => {
    const readable: string[] = [
      SettingsEnum.VOICE_INPUT_HOTKEY,
      SettingsEnum.VOICE_INPUT_HOTKEY_MODE,
      SettingsEnum.VOICE_COMMAND_HOTKEY,
      SettingsEnum.MAX_RESPONSE_TOKENS,
      SettingsEnum.PLAYER_REPLY_MAX_TOKENS,
    ];
    const unredacted = Object.values(SettingsEnum).filter(
      (name) => /key|token|secret|password/i.test(name) && !readable.includes(name) && !isSecretSettingName(name),
    );

    expect(unredacted).toEqual([]);
  });

  it('keeps secrets out of the uploaded settings report', () => {
    const ctx = mockApiContext();
    secretSettings.forEach((setting) => ctx.settings.set(setting, SENTINEL));
    ctx.settings.twitchAuth = twitchAuth;

    const content = ctx.logSend.getContent('logid');

    expect(content).not.toContain(SENTINEL);
    secretSettings.forEach((setting) => {
      expect(content).toContain(`${setting}: <redacted>`);
    });
    expect(content).toContain(`twitchAuth: ${redactedTwitchAuth}`);
  });

  it('reports an unset secret as empty', () => {
    const ctx = mockApiContext();
    ctx.settings.set(SettingsEnum.NOVELAI_KEY, '');

    expect(ctx.logSend.getContent('logid').split('\n')).toContain('novelaiKey: ');
  });

  it('keeps secrets out of the setting write log', () => {
    const ctx = mockApiContext();
    const info = vi.spyOn(log, 'info').mockImplementation(() => {});

    ctx.settings.set(SettingsEnum.OPENAI_KEY, SENTINEL);
    ctx.settings.twitchAuth = twitchAuth;

    const lines = info.mock.calls.map((call) => call.join(' '));
    expect(lines.join('\n')).not.toContain(SENTINEL);
    expect(lines).toContain('Setting app setting: openaiKey to value: "<redacted>"');
    expect(lines).toContain(`Setting app setting: twitchAuth to value: ${redactedTwitchAuth}`);
  });
});
