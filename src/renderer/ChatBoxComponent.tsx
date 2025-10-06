import { Card, CardContent, IconButton, InputAdornment, TextField } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { useMemo, useState } from 'react';
import { useDebounceHook } from './hooks/useDebounceHook';

export type ChatBoxComponentProps = {
  message: MessageInputProps;
  handleMessageTextChange: any;
  handleDeleteMessage: any;
  index: number;
};

export function ChatBoxComponent({
  message,
  handleMessageTextChange,
  handleDeleteMessage,
  index,
}: ChatBoxComponentProps) {
  const [text, setText] = useState(message.message.content);
  const inputDebounce = useDebounceHook();

  const endAdornment = useMemo(() => {
    if (message.message.role === 'user' || message.message.role === 'assistant') {
      return (
        <InputAdornment position="end" sx={{ alignItems: 'flex-end' }}>
          <IconButton onClick={() => handleDeleteMessage(index)}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </InputAdornment>
      );
    }
    return null;
  }, [handleDeleteMessage, index, message.message.role]);

  function handleTextChange(value: string) {
    setText(value);

    inputDebounce(() => handleMessageTextChange(index, value), 600);
  }

  return (
    <Card key={message.id} style={{ marginBottom: 16, backgroundColor: 'transparent' }}>
      <CardContent style={{ padding: 0, paddingTop: 0 }}>
        <TextField
          id="outlined-textarea"
          label={message.message.role}
          fullWidth
          onChange={(event) => handleTextChange(event.target.value)}
          variant="filled"
          multiline
          value={text}
          style={{ height: '100%', margin: 0 }}
          InputProps={{
            endAdornment,
          }}
        />
      </CardContent>
    </Card>
  );
}
