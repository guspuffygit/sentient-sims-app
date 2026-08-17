import { Button } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import log from 'electron-log';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export type TestVoiceButtonProperties = {
  disabled?: boolean;
  // Pins the test to a specific cast voice instead of the settings default
  voiceId?: string;
  onTest?: () => void;
};

export function TestVoiceButton({ disabled, voiceId, onTest }: TestVoiceButtonProperties) {
  const tts = useTTS();

  return (
    <Button
      color="primary"
      variant="contained"
      startIcon={<PlayArrowRoundedIcon />}
      sx={{ flexShrink: 0 }}
      onClick={() => {
        onTest?.();
        void tts.speak('Hello, this is a demo of my voice.', voiceId);
        log.debug(`Test Voice Button clicked`);
      }}
      loading={tts.isPlaying}
      disabled={disabled}
      disableElevation={disabled}
    >
      Test voice
    </Button>
  );
}
