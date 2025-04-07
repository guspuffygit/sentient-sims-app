import { LoadingButton } from '@mui/lab';
import { useTTS } from 'renderer/providers/AudioContextProvider';

export type TestVoiceButtonProperties = {
  // eslint-disable-next-line react/require-default-props
  disabled?: boolean;
};

export function TestVoiceButton({ disabled }: TestVoiceButtonProperties) {
  const tts = useTTS();

  return (
    <LoadingButton
      color="primary"
      variant="outlined"
      onClick={() => tts.speak('Hello, this is a demo of my voice.')}
      loading={tts.isPlaying}
      disabled={disabled}
    >
      Test
    </LoadingButton>
  );
}
