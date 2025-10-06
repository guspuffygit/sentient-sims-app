import { LoadingButton } from '@mui/lab';
import log from 'electron-log';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export type TestVoiceButtonProperties = {
  disabled?: boolean;
};

export function TestVoiceButton({ disabled }: TestVoiceButtonProperties) {
  const tts = useTTS();

  return (
    <LoadingButton
      color="primary"
      variant="outlined"
      onClick={() => {
        tts.speak('Hello, this is a demo of my voice.');
        log.debug(`Test Voice Button clicked`);
      }}
      loading={tts.isPlaying}
      disabled={disabled}
      disableElevation={disabled}
    >
      Test
    </LoadingButton>
  );
}
