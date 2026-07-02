import {
  Box,
  Button,
  CardActions,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ChatBoxComponent } from './ChatBoxComponent';
import ChatResultsModal from './ChatResultsModal';
import { useChatGenerationContext } from './providers/ChatGenerationProvider';
import { useDebugMode } from './providers/DebugModeProvider';
import { ScenarioTesterComponent } from './scenarioTester/ScenarioTesterComponent';
import { LLMExchangePanel } from './scenarioTester/LLMExchangePanel';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    input,
    interactionName,
    messages,
    loading,
    generateChat,
    handleMessageTextChange,
    resetMessages,
    deleteMessage,
    addNewMessage,
    countTokens,
    generateMultipleChat,
    generateScenario,
    generateDirectedScene,
    continueDirectedScene,
    canContinueScene,
    handleGenerationLoaded,
    maxResponseTokensState,
    voiceTestModeState,
    voiceLinesByMessageId,
    exchanges,
  } = useChatGenerationContext();
  const debugMode = useDebugMode();
  const [voiceTestMode, setVoiceTestMode] = voiceTestModeState;
  const [isPlayingScene, setIsPlayingScene] = useState(false);

  // Voice lines fetched for the most recent assistant message — powers the Play Scene button
  const sceneVoiceLines = useMemo(() => {
    const lastWithVoice = [...messages]
      .reverse()
      .find((m) => m.id && m.id in voiceLinesByMessageId && voiceLinesByMessageId[m.id].length > 0);
    return lastWithVoice?.id ? voiceLinesByMessageId[lastWithVoice.id] : undefined;
  }, [messages, voiceLinesByMessageId]);

  const scenePlayable = Boolean(sceneVoiceLines?.some((line) => line.audioUrl));

  const playScene = async () => {
    if (!sceneVoiceLines) return;
    setIsPlayingScene(true);
    try {
      for (const line of sceneVoiceLines) {
        if (!line.audioUrl) continue;
        const audio = new Audio(line.audioUrl);
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            resolve();
          };
          audio.onerror = () => {
            resolve();
          };
          void audio.play();
        });
      }
    } finally {
      setIsPlayingScene(false);
    }
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    handleGenerationLoaded(() => () => {
      timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView();
      }, 500);
    });
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [handleGenerationLoaded]);

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
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);

  const copyInteractionName = () => {
    if (interactionName) {
      void navigator.clipboard.writeText(interactionName);
      setCopiedSnackbar(true);
    }
  };
  function onOpenInputView() {
    setOpenInputView(true);
  }

  return (
    <>
      {debugMode.isEnabled && (
        <ScenarioTesterComponent
          loading={loading}
          onGenerate={(event) => {
            void generateScenario(event);
          }}
          onGenerateDirected={(request) => {
            void generateDirectedScene(request);
          }}
        />
      )}
      {debugMode.isEnabled && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              void playScene();
            }}
            disabled={!scenePlayable || isPlayingScene}
          >
            {isPlayingScene ? 'Playing...' : 'Play Scene'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              void continueDirectedScene();
            }}
            disabled={!canContinueScene || loading}
          >
            Continue Scene
          </Button>
          <FormControlLabel
            label="Voice Test Mode (per-character TTS on responses)"
            control={
              <Checkbox
                checked={voiceTestMode}
                onChange={(change) => {
                  setVoiceTestMode(change.target.checked);
                }}
              />
            }
          />
        </Box>
      )}
      <Box
        sx={{
          height: 650,
          overflow: 'auto',
        }}
      >
        {messages.map((message, index) => (
          <ChatBoxComponent
            index={index}
            key={message.id}
            message={message}
            handleMessageTextChange={handleMessageTextChange}
            handleDeleteMessage={deleteMessage}
            voiceLines={message.id ? voiceLinesByMessageId[message.id] : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      {debugMode.isEnabled && exchanges && exchanges.length > 0 && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Full LLM Interaction (editable, re-runnable per step)
          </Typography>
          {exchanges.map((exchange) => (
            <LLMExchangePanel
              key={exchange.id}
              label={exchange.label}
              initialMessages={exchange.initialMessages}
              maxResponseTokens={maxResponseTokensState[0]}
            />
          ))}
        </Box>
      )}
      {interactionName && (
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mr: 1,
            }}
          >
            Interaction:
          </Typography>
          <Chip
            label={interactionName}
            size="small"
            variant="outlined"
            onClick={copyInteractionName}
            onDelete={copyInteractionName}
            deleteIcon={<ContentCopyIcon fontSize="small" />}
            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
        </Box>
      )}
      <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {loading ? (
          <CircularProgress disableShrink />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Button
                  type="submit"
                  onClick={() => {
                    void generateChat();
                  }}
                  color="primary"
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
                <Button
                  type="submit"
                  onClick={() => {
                    void onGenerateMultiple();
                  }}
                  color="primary"
                  endIcon={<SendIcon />}
                >
                  Send 10
                </Button>
                <Button
                  onClick={() => {
                    addNewMessage('user');
                  }}
                  color="primary"
                  endIcon={<AddCircleIcon />}
                >
                  Add User
                </Button>
                <Button
                  onClick={() => {
                    addNewMessage('assistant');
                  }}
                  color="primary"
                  endIcon={<AddCircleIcon />}
                >
                  Add Assistant
                </Button>
              </div>
              <div>
                <Grid
                  container
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Grid>
                    {input ? (
                      <Button
                        onClick={() => {
                          onOpenInputView();
                        }}
                        color="secondary"
                      >
                        Event JSON
                      </Button>
                    ) : null}
                    <Button onClick={countTokens} color="primary">
                      Count
                    </Button>
                  </Grid>
                  <Grid>
                    <Typography sx={{ marginRight: 2, marginLeft: 2 }}>Tokens: {0}</Typography>
                  </Grid>
                  <Grid>
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
                onChange={(change) => {
                  maxResponseTokensState[1](Number(change.target.value));
                }}
                sx={{ width: '100px' }}
              />
            </div>
          </>
        )}
      </CardActions>
      {resultsModal.resultsModal}
      <Modal
        open={openInputView}
        onClose={() => {
          setOpenInputView(false);
        }}
      >
        <Box
          sx={{
            height: 650,
            overflow: 'auto',
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
      <Snackbar
        open={copiedSnackbar}
        autoHideDuration={1500}
        onClose={() => {
          setCopiedSnackbar(false);
        }}
        message="Copied to clipboard"
      />
    </>
  );
}
