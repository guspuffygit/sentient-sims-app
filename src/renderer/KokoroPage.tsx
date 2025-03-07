/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
import { Button, CardActions } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import AppCard from './AppCard';
import { MemoryEditInput } from './components/MemoryEditInput';
import { useTTS } from './providers/AudioContextProvider';

export default function KokoroPage() {
  const [text, setText] = useState<string>('Is this working, no?');

  const tts = useTTS();

  async function handleSave() {
    tts.speak(text);
  }

  const handleContentEdit = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
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
            <Button color="error" variant="outlined" onClick={() => tts.stop()}>
              Stop
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
