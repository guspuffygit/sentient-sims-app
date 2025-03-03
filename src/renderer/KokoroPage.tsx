/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import { Button, CardActions } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
// import { KokoroTTS } from 'kokoro-js';
// import log from 'electron-log';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';

// const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
// let tts: any = null;

export default function KokoroPage() {
  const [text, setText] = useState<string>('Is this working?');

  async function handleSave() {
    // if (tts === null) {
    //   log.debug('Loading tts');
    //   tts = await KokoroTTS.from_pretrained(modelId, {
    //     dtype: 'q8', // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    //     device: 'wasm', // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
    //   });
    // }
    // const audio = await tts.generate(text, {
    //   // Use `tts.list_voices()` to list all available voices
    //   voice: 'af_heart',
    // });
    // audio.save('audio.wav');
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
