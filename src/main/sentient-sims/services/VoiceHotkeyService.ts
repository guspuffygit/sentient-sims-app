import { globalShortcut } from 'electron';
import log from 'electron-log';

// Electron's globalShortcut has no key-up event, so true hold-to-talk rides uiohook-napi's
// global keyboard hook instead. The hook observes without consuming, so the game still
// receives the chord. When the native hook is unavailable the service degrades to
// globalShortcut with press-to-start/press-to-stop semantics.
type UiohookModule = typeof import('uiohook-napi');

let uiohookModule: UiohookModule | null | undefined;

function loadUiohook(): UiohookModule | null {
  if (uiohookModule === undefined) {
    try {
      // Lazy so a broken native binary degrades to the toggle fallback instead of
      // crashing the app at import time
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      uiohookModule = require('uiohook-napi') as UiohookModule;
    } catch (err) {
      log.error('uiohook-napi failed to load, voice hotkey falls back to toggle mode', err);
      uiohookModule = null;
    }
  }
  return uiohookModule;
}

export type HotkeyBinding = {
  keycode: number;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  accelerator: string;
};

// Pure so tests can cover it without the native module: the keymap is normally
// UiohookKey, injected by the caller
export function parseHotkey(hotkey: string, keymap: Record<string, number>): HotkeyBinding | undefined {
  const tokens = hotkey
    .split('+')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) {
    return undefined;
  }

  const binding = { ctrl: false, alt: false, shift: false };
  const keyToken = tokens.pop() as string;
  for (const token of tokens) {
    const modifier = token.toLowerCase();
    if (modifier === 'ctrl' || modifier === 'control') {
      binding.ctrl = true;
    } else if (modifier === 'alt') {
      binding.alt = true;
    } else if (modifier === 'shift') {
      binding.shift = true;
    } else {
      return undefined;
    }
  }

  // UiohookKey names are PascalCase-ish: Space, V, F13, Backquote
  const normalized = keyToken.length === 1 ? keyToken.toUpperCase() : keyToken[0].toUpperCase() + keyToken.slice(1);
  const keycode = keymap[normalized];
  if (typeof keycode !== 'number') {
    return undefined;
  }

  return { ...binding, keycode, accelerator: hotkey };
}

export type HotkeyCallbacks = {
  onDown: () => void;
  onUp: () => void;
  onToggle: () => void;
};

export class VoiceHotkeyService {
  private binding?: HotkeyBinding;

  // V-8: the command binding (speech = an order). Same hook, second chord.
  private commandBinding?: HotkeyBinding;

  private commandCallbacks?: HotkeyCallbacks;

  private commandHeld = false;

  private commandFallbackAccelerator?: string;

  private mode: 'hold' | 'toggle' = 'hold';

  private callbacks?: HotkeyCallbacks;

  private hookStarted = false;

  private listenersInstalled = false;

  private fallbackAccelerator?: string;

  // Suppresses the OS key-repeat keydowns that fire for the whole duration of a hold
  private held = false;

  // True when the native hook could not be used and globalShortcut toggle semantics
  // are in force — surfaced to the settings UI
  get usingFallback(): boolean {
    return this.fallbackAccelerator !== undefined;
  }

  arm(hotkey: string, mode: 'hold' | 'toggle', callbacks: HotkeyCallbacks) {
    this.disarm();
    this.mode = mode;
    this.callbacks = callbacks;

    const uiohook = loadUiohook();
    if (uiohook) {
      const binding = parseHotkey(hotkey, uiohook.UiohookKey);
      if (binding) {
        this.binding = binding;
        if (this.installHook(uiohook)) {
          log.info(`Voice hotkey armed: ${hotkey} (${mode})`);
          return;
        }
        this.binding = undefined;
      } else {
        log.error(`Voice hotkey "${hotkey}" could not be parsed, falling back to globalShortcut toggle`);
      }
    }

    this.armFallback(hotkey);
  }

  // V-8: arm the command chord (call after arm(); disarm() clears both)
  armCommand(hotkey: string, callbacks: HotkeyCallbacks) {
    this.commandBinding = undefined;
    this.commandCallbacks = undefined;
    this.commandHeld = false;
    if (this.commandFallbackAccelerator) {
      try {
        globalShortcut.unregister(this.commandFallbackAccelerator);
      } catch (err) {
        log.error('Unable to unregister voice command hotkey', err);
      }
      this.commandFallbackAccelerator = undefined;
    }
    if (!hotkey) {
      return;
    }
    this.commandCallbacks = callbacks;
    const uiohook = loadUiohook();
    if (uiohook) {
      const binding = parseHotkey(hotkey, uiohook.UiohookKey);
      if (binding && this.installHook(uiohook)) {
        this.commandBinding = binding;
        log.info(`Voice command hotkey armed: ${hotkey}`);
        return;
      }
    }
    try {
      const registered = globalShortcut.register(hotkey, () => {
        this.commandCallbacks?.onToggle();
      });
      if (registered) {
        this.commandFallbackAccelerator = hotkey;
        log.info(`Voice command hotkey armed via globalShortcut toggle fallback: ${hotkey}`);
      } else {
        log.error(`Voice command hotkey "${hotkey}" registration failed (already in use?)`);
      }
    } catch (err) {
      log.error(`Voice command hotkey "${hotkey}" is not a valid accelerator`, err);
    }
  }

  disarm() {
    this.binding = undefined;
    this.callbacks = undefined;
    this.held = false;
    this.commandBinding = undefined;
    this.commandCallbacks = undefined;
    this.commandHeld = false;
    if (this.commandFallbackAccelerator) {
      try {
        globalShortcut.unregister(this.commandFallbackAccelerator);
      } catch (err) {
        log.error('Unable to unregister voice command hotkey', err);
      }
      this.commandFallbackAccelerator = undefined;
    }
    if (this.fallbackAccelerator) {
      try {
        globalShortcut.unregister(this.fallbackAccelerator);
      } catch (err) {
        log.error('Unable to unregister voice hotkey', err);
      }
      this.fallbackAccelerator = undefined;
    }
    this.stopHook();
  }

  // Called from app 'will-quit'; a running uiohook thread otherwise keeps the process alive
  shutdown() {
    this.disarm();
  }

  private installHook(uiohook: UiohookModule): boolean {
    if (!this.listenersInstalled) {
      uiohook.uIOhook.on('keydown', (event) => {
        this.handleKeydown(event);
      });
      uiohook.uIOhook.on('keyup', (event) => {
        this.handleKeyup(event);
      });
      this.listenersInstalled = true;
    }
    if (!this.hookStarted) {
      try {
        uiohook.uIOhook.start();
        this.hookStarted = true;
      } catch (err) {
        log.error('uiohook failed to start, voice hotkey falls back to toggle mode', err);
        return false;
      }
    }
    return true;
  }

  private stopHook() {
    if (this.hookStarted) {
      const uiohook = loadUiohook();
      try {
        uiohook?.uIOhook.stop();
      } catch (err) {
        log.error('uiohook failed to stop', err);
      }
      this.hookStarted = false;
    }
  }

  private armFallback(hotkey: string) {
    if (!hotkey) {
      return;
    }
    // uiohook key names that Electron accelerators spell differently
    const accelerator = hotkey
      .split('+')
      .map((token) => {
        const trimmed = token.trim();
        if (trimmed === 'Backquote') {
          return '`';
        }
        if (trimmed === 'ScrollLock') {
          return 'Scrolllock';
        }
        return trimmed;
      })
      .join('+');
    try {
      const registered = globalShortcut.register(accelerator, () => {
        this.callbacks?.onToggle();
      });
      if (registered) {
        this.fallbackAccelerator = accelerator;
        log.info(`Voice hotkey armed via globalShortcut toggle fallback: ${accelerator}`);
      } else {
        log.error(`Voice hotkey "${accelerator}" registration failed (already in use?)`);
      }
    } catch (err) {
      log.error(`Voice hotkey "${accelerator}" is not a valid accelerator`, err);
    }
  }

  private matches(event: { keycode: number; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }): boolean {
    const binding = this.binding;
    return (
      binding !== undefined &&
      event.keycode === binding.keycode &&
      event.ctrlKey === binding.ctrl &&
      event.altKey === binding.alt &&
      event.shiftKey === binding.shift
    );
  }

  private matchesCommand(event: { keycode: number; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }): boolean {
    const binding = this.commandBinding;
    return (
      binding !== undefined &&
      event.keycode === binding.keycode &&
      event.ctrlKey === binding.ctrl &&
      event.altKey === binding.alt &&
      event.shiftKey === binding.shift
    );
  }

  private handleKeydown(event: { keycode: number; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }) {
    if (this.matchesCommand(event)) {
      if (this.commandHeld) {
        return;
      }
      this.commandHeld = true;
      if (this.mode === 'hold') {
        this.commandCallbacks?.onDown();
      } else {
        this.commandCallbacks?.onToggle();
      }
      return;
    }
    if (!this.matches(event) || this.held) {
      return;
    }
    this.held = true;
    if (this.mode === 'hold') {
      this.callbacks?.onDown();
    } else {
      this.callbacks?.onToggle();
    }
  }

  private handleKeyup(event: { keycode: number }) {
    if (this.commandBinding !== undefined && event.keycode === this.commandBinding.keycode && this.commandHeld) {
      this.commandHeld = false;
      if (this.mode === 'hold') {
        this.commandCallbacks?.onUp();
      }
      return;
    }
    // Modifier state is not checked on release: letting go of Ctrl before Space must
    // still end the hold
    if (this.binding === undefined || event.keycode !== this.binding.keycode || !this.held) {
      return;
    }
    this.held = false;
    if (this.mode === 'hold') {
      this.callbacks?.onUp();
    }
  }
}
