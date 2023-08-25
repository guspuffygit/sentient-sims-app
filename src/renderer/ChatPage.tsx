import { Box, Button, CardActions, Grid, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import { useRef } from 'react';
import { ChatBoxComponent } from './ChatBoxComponent';
import useChatGeneration from './hooks/useChatGeneration';

export default function ChatPage() {
  const {
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    tokenCount,
  } = useChatGeneration();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Box height={575} overflow="auto">
        {messages.map((message) => (
          <ChatBoxComponent
            message={message}
            handleMessageTextChange={handleMessageTextChange}
            handleDeleteMessage={deleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        {loading ? (
          <CircularProgress disableShrink />
        ) : (
          <>
            <div>
              <Button
                type="submit"
                onClick={generateChat}
                color="primary"
                endIcon={<SendIcon />}
              >
                Send
              </Button>
              <Button
                onClick={() => addNewMessage('user')}
                color="primary"
                endIcon={<AddCircleIcon />}
              >
                Add User
              </Button>
              <Button
                onClick={() => addNewMessage('assistant')}
                color="primary"
                endIcon={<AddCircleIcon />}
              >
                Add Assistant
              </Button>
            </div>
            <div>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography sx={{ marginRight: 2 }}>
                    Tokens: {tokenCount}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button onClick={resetMessages} color="primary">
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </div>
          </>
        )}
      </CardActions>
    </>
  );
}
