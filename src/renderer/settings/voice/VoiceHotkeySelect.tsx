import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography } from '@mui/material';
import {
  VoiceHotkeyPreset,
  voiceHotkeyAllowsModifiers,
  voiceHotkeyFromKey,
  voiceHotkeyGameUse,
  voiceHotkeyLabel,
} from 'main/sentient-sims/models/VoiceHotkeyPresets';

const CUSTOM = '__custom__';

type Props = {
  value: string;
  presets: VoiceHotkeyPreset[];
  onChange: (chord: string) => void;
  // What the Custom dialog asks for
  prompt?: string;
};

const TALK_PROMPT = 'Press the key you want to use to talk to your Sims.';

// A hotkey dropdown whose last row, "Custom…", opens a dialog that records the next key
// pressed (with its modifiers where the platform allows them) and says so when the game
// already uses that key. The captured hotkey is saved in the overlay's spelling, and
// presets keep it as a row of its own once it is the bound key.
export default function VoiceHotkeySelect({ value, presets, onChange, prompt = TALK_PROMPT }: Props) {
  const { isMac } = window.electron;
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState<string>();
  const allowModifiers = voiceHotkeyAllowsModifiers(isMac);
  const gameUse = captured ? voiceHotkeyGameUse(captured) : undefined;

  useEffect(() => {
    if (!capturing) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const hotkey = voiceHotkeyFromKey(event, allowModifiers);
      if (hotkey) {
        setCaptured(hotkey);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [capturing, allowModifiers]);

  function open() {
    setCaptured(undefined);
    setCapturing(true);
  }

  function save() {
    if (captured) {
      onChange(captured);
    }
    setCapturing(false);
  }

  return (
    <>
      <Select
        size="small"
        value={value}
        onChange={(change) => {
          if (change.target.value === CUSTOM) {
            open();
          } else {
            onChange(change.target.value);
          }
        }}
      >
        {presets.map((preset) => (
          <MenuItem key={preset.value} value={preset.value}>
            {preset.label}
          </MenuItem>
        ))}
        <MenuItem value={CUSTOM}>Custom…</MenuItem>
      </Select>
      <Dialog
        open={capturing}
        onClose={() => {
          setCapturing(false);
        }}
      >
        <DialogTitle>Press a key</DialogTitle>
        <DialogContent>
          <Typography variant="h5" sx={{ textAlign: 'center', marginY: 2, fontFamily: 'monospace' }}>
            {captured ? voiceHotkeyLabel(captured, isMac) : '…'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {allowModifiers ? `${prompt} You can hold Ctrl, Opt or Shift with it.` : prompt}
          </Typography>
          {captured && gameUse ? (
            <Typography variant="body2" sx={{ color: 'warning.main', marginTop: 1 }}>
              {voiceHotkeyLabel(captured, isMac)} is already used in the game: it {gameUse}. You can still use it, but
              holding it will talk instead.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCapturing(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" disabled={!captured} onClick={save}>
            Use this key
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
