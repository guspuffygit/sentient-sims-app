import log from 'electron-log';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mirrorModLog, modLogMirrorLine } from 'main/sentient-sims/util/modLogMirror';

describe('modLogMirror', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mirrors INFO and above with the [Mod] prefix', () => {
    expect(modLogMirrorLine({ level: 'INFO', timestamp: '1', message: 'game thread stall: 4.50s' })).toBe(
      '[Mod] INFO game thread stall: 4.50s',
    );
    expect(modLogMirrorLine({ level: 'ERROR', timestamp: '1', message: 'boom' })).toBe('[Mod] ERROR boom');
    expect(modLogMirrorLine({ level: 'WARN', timestamp: '1', message: 'hm' })).toBe('[Mod] WARN hm');
  });

  it('keeps DEBUG out of main.log', () => {
    expect(modLogMirrorLine({ level: 'DEBUG', timestamp: '1', message: 'INTERACTION_LOG ...' })).toBeUndefined();
  });

  it('routes each level to the matching electron-log method', () => {
    const info = vi.spyOn(log, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(log, 'error').mockImplementation(() => {});

    mirrorModLog({ level: 'INFO', timestamp: '1', message: 'a' });
    mirrorModLog({ level: 'WARN', timestamp: '1', message: 'b' });
    mirrorModLog({ level: 'ERROR', timestamp: '1', message: 'c' });
    mirrorModLog({ level: 'DEBUG', timestamp: '1', message: 'd' });

    expect(info).toHaveBeenCalledWith('[Mod] INFO a');
    expect(warn).toHaveBeenCalledWith('[Mod] WARN b');
    expect(error).toHaveBeenCalledWith('[Mod] ERROR c');
    expect(info).toHaveBeenCalledTimes(1);
  });
});
