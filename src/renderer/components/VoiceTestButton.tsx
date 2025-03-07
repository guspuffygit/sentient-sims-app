import { LoadingButton } from '@mui/lab';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export function TestVoiceButton() {
  const tts = useTTS();

  return (
    <LoadingButton
      color="primary"
      variant="outlined"
      onClick={() => tts.speak('Hello, this is a demo of my voice.')}
      loading={tts.isPlaying}
    >
      Test
    </LoadingButton>
  );
}
