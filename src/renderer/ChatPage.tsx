import { Box, Button, CardActions, Grid, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import { useRef } from 'react';
import { ChatBoxComponent } from './ChatBoxComponent';
import useChatGeneration from './hooks/useChatGeneration';
import ChatResultsModal from './ChatResultsModal';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  function handleGenerationLoaded() {
    setTimeout(() => {
      messagesEndRef?.current?.scrollIntoView();
    }, 500);
  }
  const {
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    tokenCount,
    countTokens,
    generateMultipleChat,
  } = useChatGeneration(handleGenerationLoaded);

  const resultsModal = ChatResultsModal();

  const onGenerateMultiple = async () => {
    const results = await generateMultipleChat(10);
    resultsModal.setResults({
      open: true,
      results,
    });
  };

  return (
    <>
      <Box height={650} overflow="auto">
        {messages.map((message, index) => (
          <ChatBoxComponent
            index={index}
            key={message.id}
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
                type="submit"
                onClick={() => onGenerateMultiple()}
                color="primary"
                endIcon={<SendIcon />}
              >
                Send 10
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
                  <Button onClick={countTokens} color="primary">
                    Count
                  </Button>
                </Grid>
                <Grid item>
                  <Typography sx={{ marginRight: 2, marginLeft: 2 }}>
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
        {resultsModal.resultsModal}
      </CardActions>
    </>
  );
}
