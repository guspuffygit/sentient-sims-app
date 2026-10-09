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
