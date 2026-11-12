export type VoiceHotkeyPreset = { value: string; label: string };

// One key each: the game ignores clicks while Ctrl, Alt or Shift is down, so only a one-key
// talk key can pick a Sim. The overlay keeps a held talk key from the game and hands a tap
// back, so a key the game binds (` pauses) still works as itself.
const pcPresets = ['Backquote', 'Insert', 'ScrollLock', 'F13'];

// A Mac keyboard has no Insert or Scroll Lock. Chords stay on a Mac: whether macOS drops a
// click under Option the way Windows does under Ctrl is not measured.
const macPresets = ['Alt+V', 'Ctrl+S', 'F13'];

const keyLabels: Record<string, string> = {
  Backquote: '` (backquote)',
  ScrollLock: 'Scroll Lock',
};

// The stored chord keeps the spelling the overlay parses on every platform ("Alt+V");
// only the label follows the keyboard in front of the player
export function voiceHotkeyLabel(chord: string, isMac: boolean): string {
  return chord
    .split('+')
    .map((part) => {
      const token = part.trim();
      if (isMac && /^(alt|option)$/i.test(token)) {
        return 'Opt';
      }
      return keyLabels[token] ?? token;
    })
    .join('+');
}

// The hotkeys offered on this platform. One saved earlier that the list no longer offers
// is kept as an extra row, so the dropdown never shows a key other than the bound one.
export function voiceHotkeyPresets(isMac: boolean, current?: string): VoiceHotkeyPreset[] {
  const values = [...(isMac ? macPresets : pcPresets)];
  if (current && !values.includes(current)) {
    values.push(current);
  }
  return values.map((value) => ({ value, label: voiceHotkeyLabel(value, isMac) }));
}

// Every key name the overlay's chord table knows besides letters and digits. The names
// are the browser's KeyboardEvent.code spellings, which is what makes capture a pure rename.
const overlayKeys = new Set([
  'Space',
  'Backquote',
  'Insert',
  'ScrollLock',
  'Tab',
  'Enter',
  'Escape',
  'Backspace',
  'Delete',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'CapsLock',
  'Pause',
  'Minus',
  'Equal',
  'BracketLeft',
  'BracketRight',
  'Backslash',
  'Semicolon',
  'Quote',
  'Comma',
  'Period',
  'Slash',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ...Array.from({ length: 20 }, (_, i) => `F${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `Numpad${i}`),
]);

export type CapturedKey = { code: string; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean };

// Whether a hotkey may carry Ctrl, Alt or Shift on this platform
export function voiceHotkeyAllowsModifiers(isMac: boolean): boolean {
  return isMac;
}

// The hotkey for a key the player pressed in the app, in the spelling the overlay parses
// ("F7", or "Ctrl+Shift+F7" where modifiers are allowed; elsewhere a held Ctrl, Alt or
// Shift is left out). Undefined for a modifier on its own, a key the overlay has no name
// for, or a press with Cmd/Win held, which the overlay cannot bind and must not fall back
// to the bare key.
export function voiceHotkeyFromKey(
  { code, ctrlKey, altKey, shiftKey, metaKey }: CapturedKey,
  allowModifiers = true,
): string | undefined {
  if (metaKey) {
    return undefined;
  }
  const letter = /^Key([A-Z])$/.exec(code)?.[1];
  const digit = /^Digit(\d)$/.exec(code)?.[1];
  const key = letter ?? digit ?? (overlayKeys.has(code) ? code : undefined);
  if (!key) {
    return undefined;
  }
  if (!allowModifiers) {
    return key;
  }
  const modifiers = [ctrlKey ? 'Ctrl' : '', altKey ? 'Alt' : '', shiftKey ? 'Shift' : ''].filter(Boolean);
  return [...modifiers, key].join('+');
}

// What The Sims 4 does with a key on its own in Live mode, from the game's input map
// (shared/InputMap.as, timecontrols) and its camera controls
const cameraMove = 'moves the camera';
const cameraZoom = 'zooms the camera';
const cameraRotate = 'rotates the camera';
const pause = 'pauses the game';
const gameKeys: Record<string, string> = {
  W: cameraMove,
  A: cameraMove,
  S: cameraMove,
  D: cameraMove,
  ArrowUp: cameraMove,
  ArrowDown: cameraMove,
  ArrowLeft: cameraMove,
  ArrowRight: cameraMove,
  Z: cameraZoom,
  X: cameraZoom,
  Equal: cameraZoom,
  Minus: cameraZoom,
  Comma: cameraRotate,
  Period: cameraRotate,
  T: 'switches to the top-down camera',
  Tab: 'switches to the free camera',
  Space: 'switches to the next Sim',
  N: 'centers the camera on your Sim',
  Enter: 'centers the camera on your Sim',
  Backquote: pause,
  P: pause,
  0: pause,
  Numpad0: pause,
  1: 'sets normal speed',
  Numpad1: 'sets normal speed',
  2: 'sets fast speed',
  Numpad2: 'sets fast speed',
  3: 'sets ultra speed',
  Numpad3: 'sets ultra speed',
  B: 'opens the household panel',
  G: 'opens the aspiration panel',
  I: 'opens the inventory',
  J: 'opens the career panel',
  L: 'opens the skills panel',
  O: 'opens the needs panel',
  R: 'opens the relationships panel',
  U: 'opens the clubs panel',
  Y: 'opens the Simology panel',
  M: 'opens the map',
  C: 'takes a screenshot',
  V: 'records a video',
  Escape: 'opens the game menu',
  Home: 'raises the walls',
  End: 'lowers the walls',
  PageUp: 'goes up a floor',
  PageDown: 'goes down a floor',
  F1: 'switches to Live mode',
  F2: 'opens Buy mode',
  F3: 'opens Build mode',
  F4: 'opens the Gallery',
  F5: 'opens Manage Worlds',
  F6: 'opens the store',
};

// What the game already does with this hotkey, or undefined when it leaves the key alone.
// A chord with a modifier is not looked up.
export function voiceHotkeyGameUse(hotkey: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(gameKeys, hotkey) ? gameKeys[hotkey] : undefined;
}
