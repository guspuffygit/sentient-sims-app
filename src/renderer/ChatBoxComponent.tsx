import { Card, CardContent, Chip, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { useMemo, useState } from 'react';
import { VoiceTestLine } from 'renderer/voice/useVoiceTestPlayback';
import { useDebounceHook } from './hooks/useDebounceHook';

export type ChatBoxComponentProps = {
  message: MessageInputProps;
  handleMessageTextChange: (index: number, value: string) => void;
  handleDeleteMessage: (index: number) => void;
  index: number;
  voiceLines?: VoiceTestLine[];
};

function playVoiceLine(line: VoiceTestLine) {
  if (!line.audioUrl) return;
  const audio = new Audio(line.audioUrl);
  void audio.play();
}

export function ChatBoxComponent({
  message,
  handleMessageTextChange,
  handleDeleteMessage,
  index,
  voiceLines,
}: ChatBoxComponentProps) {
  const [text, setText] = useState(message.message.content);
  const inputDebounce = useDebounceHook();

  const endAdornment = useMemo(() => {
    if (message.message.role === 'user' || message.message.role === 'assistant') {
      return (
        <InputAdornment position="end" sx={{ alignItems: 'flex-end' }}>
          <IconButton
            onClick={() => {
              handleDeleteMessage(index);
            }}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        </InputAdornment>
      );
    }
    return null;
  }, [handleDeleteMessage, index, message.message.role]);

  function handleTextChange(value: string) {
    setText(value);

    inputDebounce(() => {
      handleMessageTextChange(index, value);
    }, 600);
  }

  return (
    <Card key={message.id} style={{ marginBottom: 16, backgroundColor: 'transparent' }}>
      <CardContent style={{ padding: 0, paddingTop: 0 }}>
        <TextField
          id="outlined-textarea"
          label={message.message.role}
          fullWidth
          onChange={(event) => {
            handleTextChange(event.target.value);
          }}
          variant="filled"
          multiline
          value={text}
          style={{ height: '100%', margin: 0 }}
          slotProps={{
            input: {
              endAdornment,
            },
          }}
        />
        {voiceLines && voiceLines.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {voiceLines.map((line) => {
              const key = `${line.speaker}-${line.text}`;
              if (line.error) {
                return (
                  <Chip
                    key={key}
                    size="small"
                    color="error"
                    icon={<ErrorOutlineIcon />}
                    label={`${line.speaker}: ${line.error}`}
                  />
                );
              }
              if (line.loading) {
                return (
                  <Chip
                    key={key}
                    size="small"
                    icon={<CircularProgress size={14} />}
                    label={`${line.speaker}: loading voice...`}
                  />
                );
              }
              return (
                <Chip
                  key={key}
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<PlayArrowIcon />}
                  label={line.speaker}
                  onClick={() => {
                    playVoiceLine(line);
                  }}
                />
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
