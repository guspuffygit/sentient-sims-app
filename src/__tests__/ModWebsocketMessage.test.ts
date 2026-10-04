import log from 'electron-log';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseModMessage, rawDataToString } from 'main/sentient-sims/util/modWebsocketMessage';

describe('modWebsocketMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses a JSON frame from the mod', () => {
    const parsed = parseModMessage(Buffer.from(JSON.stringify({ log: { level: 'INFO', message: 'hi' } })));
    expect(parsed?.log?.message).toBe('hi');
  });

  it('returns undefined for a frame that is not JSON, without throwing', () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
    expect(() => parseModMessage(Buffer.from('{not json'))).not.toThrow();
    expect(parseModMessage(Buffer.from('{not json'))).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it('parses the mod_info a mod sends when it connects', () => {
    const modInfo = { tier: 'core', mod_version: 'abc123', required_app_version: '4.5.0' };
    expect(parseModMessage(Buffer.from(JSON.stringify({ mod_info: modInfo })))?.mod_info).toEqual(modInfo);
  });

  it('joins a fragmented frame', () => {
    expect(rawDataToString([Buffer.from('{"a":'), Buffer.from('1}')])).toBe('{"a":1}');
    expect(parseModMessage([Buffer.from('{"clock_state":'), Buffer.from('{"paused":true}}')])).toEqual({
      clock_state: { paused: true },
    });
  });

  it('reads an ArrayBuffer frame', () => {
    const bytes = new TextEncoder().encode('{"b":2}');
    expect(rawDataToString(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))).toBe('{"b":2}');
  });
});
