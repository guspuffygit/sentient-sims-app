import { Button, Tooltip } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import log from 'electron-log';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { useAISettings } from 'renderer/providers/AISettingsProvider';

export type TestVoiceButtonProperties = {
  disabled?: boolean;
  // Pins the test to a specific cast voice instead of the settings default
  voiceId?: string;
  onTest?: () => void;
};

export function TestVoiceButton({ disabled, voiceId, onTest }: TestVoiceButtonProperties) {
  const tts = useTTS();
  const { ttsEnabled } = useAISettings();
  // speak() is silent with voice off; say so instead of a button that does nothing
  const off = !ttsEnabled;

  const button = (
    <Button
      color="primary"
      variant="contained"
      startIcon={<PlayArrowRoundedIcon />}
      sx={{ flexShrink: 0 }}
      onClick={() => {
        onTest?.();
        // A test is not a scene line: it plays at once, whatever the game clock says
        void tts.speak('Hello, this is a demo of my voice.', voiceId, { followsClock: false });
        log.debug(`Test Voice Button clicked`);
      }}
      loading={tts.isPlaying}
      disabled={disabled || off}
      disableElevation={disabled || off}
    >
      Test voice
    </Button>
  );

  if (!off) {
    return button;
  }
  // A disabled button fires no events, so the tooltip hangs off a wrapper
  return (
    <Tooltip title="Enable Text to Speech first">
      <span>{button}</span>
    </Tooltip>
  );
}
