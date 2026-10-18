import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography } from '@mui/material';
import { VoiceHotkeyPreset, voiceHotkeyFromKey, voiceHotkeyLabel } from 'main/sentient-sims/models/VoiceHotkeyPresets';

const CUSTOM = '__custom__';

type Props = {
  value: string;
  presets: VoiceHotkeyPreset[];
  onChange: (chord: string) => void;
};

// A hotkey dropdown whose last row, "Custom…", opens a dialog that records the next key
// or chord pressed. The captured chord is saved in the overlay's spelling, and presets
// keep it as a row of its own once it is the bound key.
export default function VoiceHotkeySelect({ value, presets, onChange }: Props) {
  const { isMac } = window.electron;
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState<string>();

  useEffect(() => {
    if (!capturing) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const chord = voiceHotkeyFromKey(event);
      if (chord) {
        setCaptured(chord);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [capturing]);

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
            Press the key or chord you want, with Ctrl, Alt or Shift held if you like. The game still sees the key, so
            pick one it leaves alone or add a modifier.
          </Typography>
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
