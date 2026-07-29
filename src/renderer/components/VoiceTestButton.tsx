import { Button } from '@mui/material';
import log from 'electron-log';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export type TestVoiceButtonProperties = {
  disabled?: boolean;
  // Pins the test to a specific cast voice instead of the settings default
  voiceId?: string;
};

export function TestVoiceButton({ disabled, voiceId }: TestVoiceButtonProperties) {
  const tts = useTTS();

  return (
    <Button
      color="primary"
      variant="outlined"
      onClick={() => {
        void tts.speak('Hello, this is a demo of my voice.', voiceId);
        log.debug(`Test Voice Button clicked`);
      }}
      loading={tts.isPlaying}
      disabled={disabled}
      disableElevation={disabled}
    >
      Test
    </Button>
  );
}
