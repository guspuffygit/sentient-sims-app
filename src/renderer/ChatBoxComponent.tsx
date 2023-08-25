import {
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ChatCompletionMessage } from 'openai/resources/chat';

export type MessageInputProps = {
  id?: string;
  timestamp?: number;
  index: number;
  message: ChatCompletionMessage;
};

export type ChatBoxComponentProps = {
  message: MessageInputProps;
  handleMessageTextChange: any;
  handleDeleteMessage: any;
};

export function ChatBoxComponent({
  message,
  handleMessageTextChange,
  handleDeleteMessage,
}: ChatBoxComponentProps) {
  return (
    <Card
      key={message.id}
      style={{ marginBottom: 16, backgroundColor: 'transparent' }}
    >
      <CardContent style={{ padding: 0, paddingTop: 0 }}>
        <TextField
          id="outlined-textarea"
          label={message.message.role}
          fullWidth
          onChange={(event) =>
            handleMessageTextChange(message.index, event.target.value)
          }
          variant="filled"
          multiline
          value={message.message.content}
          style={{ height: '100%', margin: 0 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ alignItems: 'flex-end' }}>
                <IconButton onClick={() => handleDeleteMessage(message.index)}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
