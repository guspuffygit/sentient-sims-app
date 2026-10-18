export type VoiceHotkeyPreset = { value: string; label: string };

// Single keys must be ones The Sims 4 leaves unbound — the game overlay observes the
// key without consuming it, so the game still sees every press
const pcPresets = [
  'Backquote',
  'Insert',
  'ScrollLock',
  'F13',
  'Ctrl+Space',
  'Ctrl+Alt+Space',
  'Ctrl+Shift+Space',
  'Alt+V',
];

// A Mac keyboard has no Insert or Scroll Lock, and macOS takes Ctrl+Space and
// Ctrl+Option+Space to switch input sources before the game sees them
const macPresets = ['Alt+V', 'Ctrl+Shift+Space', 'F13'];

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

// The chords offered on this platform. A chord saved earlier that the list no longer
// offers is kept as an extra row, so the dropdown never shows a key other than the bound one.
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

// The chord for a key the player pressed in the app, in the spelling the overlay parses
// ("Ctrl+Shift+F7"). Undefined for a modifier on its own, a key the overlay has no name for,
// or a chord with Cmd/Win held, which the overlay cannot bind and must not fall back to the bare key.
export function voiceHotkeyFromKey({ code, ctrlKey, altKey, shiftKey, metaKey }: CapturedKey): string | undefined {
  if (metaKey) {
    return undefined;
  }
  const letter = /^Key([A-Z])$/.exec(code)?.[1];
  const digit = /^Digit(\d)$/.exec(code)?.[1];
  const key = letter ?? digit ?? (overlayKeys.has(code) ? code : undefined);
  if (!key) {
    return undefined;
  }
  const modifiers = [ctrlKey ? 'Ctrl' : '', altKey ? 'Alt' : '', shiftKey ? 'Shift' : ''].filter(Boolean);
  return [...modifiers, key].join('+');
}
