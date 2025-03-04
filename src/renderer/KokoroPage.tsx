/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import { Button, CardActions } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';
import log from 'electron-log';
// import { KokoroTTS } from './kokoro/kokoro';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';

// const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
// let tts: any = null;

// let tts: KokoroTTS | undefined;
// KokoroTTS.from_pretrained(modelId, {
//   dtype: 'q8', // Or any desired precision
//   device: 'wasm', // Change as needed
// })
//   // eslint-disable-next-line promise/always-return
//   .then((model: KokoroTTS) => {
//     tts = model;
//     log.debug(`tts loaded successfully in browser`);
//   })
//   .catch((err: any) => log.error(`Error loading tts:`, err));

export default function KokoroPage() {
  const [text, setText] = useState<string>('Is this working, no?');

  const runTTS = useCallback(async () => {
    const response = await fetch(
      `${appApiUrl}/ai/v2/tts?text=${encodeURIComponent(text)}`
    );

    const arrayBuffer = await response.arrayBuffer();

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    source.start();

    return () => {
      source.stop();
      source.disconnect();
      audioContext.close();
    };
  }, [text]);

  async function handleSave() {
    runTTS();
  }

  const handleDelete = useCallback(() => {
    // delete
  }, []);

  const handleContentEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    []
  );

  return (
    <AppCard
      cardActions={
        <CardActions
          sx={{
            justifyContent: 'space-between',
            marginLeft: 1,
            marginRight: 1,
            marginBottom: 1,
          }}
        >
          <div>
            <Button
              sx={{ marginRight: 1 }}
              color="secondary"
              variant="outlined"
              onClick={() => handleSave()}
            >
              Run
            </Button>
          </div>
          <div>
            <Button
              color="error"
              variant="outlined"
              onClick={() => handleDelete()}
            >
              Delete
            </Button>
          </div>
        </CardActions>
      }
    >
      <MemoryEditInput
        label="Content"
        handleEdit={handleContentEdit}
        rows={5}
        value={text}
      />
    </AppCard>
  );
}
