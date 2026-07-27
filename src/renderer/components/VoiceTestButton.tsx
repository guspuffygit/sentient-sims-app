import { Button } from '@mui/material';
import log from 'electron-log';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export type TestVoiceButtonProperties = {
  disabled?: boolean;
  onTest?: () => void;
};

export function TestVoiceButton({ disabled, onTest }: TestVoiceButtonProperties) {
  const tts = useTTS();

  return (
    <Button
      color="primary"
      variant="outlined"
      onClick={() => {
        onTest?.();
        void tts.speak('Hello, this is a demo of my voice.');
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
