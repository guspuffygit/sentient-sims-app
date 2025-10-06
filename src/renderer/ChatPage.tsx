import { Box, Button, CardActions, Grid, Modal, TextField, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import { useCallback, useRef, useState } from 'react';
import log from 'electron-log';
import { ChatBoxComponent } from './ChatBoxComponent';
import ChatResultsModal from './ChatResultsModal';
import { useChatGenerationContext } from './providers/ChatGenerationProvider';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    input,
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    countTokens,
    generateMultipleChat,
    handleGenerationLoaded,
    maxResponseTokensState,
  } = useChatGenerationContext();

  handleGenerationLoaded(
    useCallback(() => {
      setTimeout(() => {
        messagesEndRef?.current?.scrollIntoView();
      }, 500);
    }, []),
  );

  const resultsModal = ChatResultsModal();

  const onGenerateMultiple = async () => {
    const startTime = performance.now();
    const results = await generateMultipleChat(10);
    const endTime = performance.now() - startTime;
    log.debug(`Time to run 10: ${endTime}`);

    resultsModal.setResults({
      open: true,
      results,
    });
  };

  const [openInputView, setOpenInputView] = useState(false);
  function onOpenInputView() {
    setOpenInputView(true);
  }

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
      <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {loading ? (
          <CircularProgress disableShrink />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Button type="submit" onClick={generateChat} color="primary" endIcon={<SendIcon />}>
                  Send
                </Button>
                <Button type="submit" onClick={() => onGenerateMultiple()} color="primary" endIcon={<SendIcon />}>
                  Send 10
                </Button>
                <Button onClick={() => addNewMessage('user')} color="primary" endIcon={<AddCircleIcon />}>
                  Add User
                </Button>
                <Button onClick={() => addNewMessage('assistant')} color="primary" endIcon={<AddCircleIcon />}>
                  Add Assistant
                </Button>
              </div>
              <div>
                <Grid container alignItems="center">
                  <Grid item>
                    {input ? (
                      <Button onClick={() => onOpenInputView()} color="secondary">
                        Event JSON
                      </Button>
                    ) : null}
                    <Button onClick={countTokens} color="primary">
                      Count
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ marginRight: 2, marginLeft: 2 }}>Tokens: {0}</Typography>
                  </Grid>
                  <Grid item>
                    <Button onClick={resetMessages} color="primary">
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <TextField
                label="Max Output"
                variant="outlined"
                value={maxResponseTokensState[0]}
                onChange={(change) => maxResponseTokensState[1](Number(change.target.value))}
                sx={{ width: '100px' }}
              />
            </div>
          </>
        )}
      </CardActions>
      {resultsModal.resultsModal}
      <Modal open={openInputView} onClose={() => setOpenInputView(false)}>
        <Box
          height={650}
          overflow="auto"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <div
            style={{
              backgroundColor: '#151515',
              border: '1px solid #ddd',
              borderRadius: '5px',
              padding: '15px',
              overflowX: 'auto', // Allows horizontal scrolling if the code is too wide
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap', // Maintains line breaks
            }}
          >
            {input}
          </div>
        </Box>
      </Modal>
    </>
  );
}
