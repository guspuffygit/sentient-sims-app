import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Modal,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import { useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import { ChatBoxComponent } from './ChatBoxComponent';
import ChatResultsModal from './ChatResultsModal';
import { useChatGenerationContext } from './providers/ChatGenerationProvider';
import { useDebugMode } from './providers/DebugModeProvider';
import { ScenarioTesterComponent } from './scenarioTester/ScenarioTesterComponent';
import { LLMExchangePanel } from './scenarioTester/LLMExchangePanel';
import { playAudioUrl } from './voice/audioPlayback';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';
import PaintingsPanel from './PaintingsPanel';

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
        try {
          const playback = await playAudioUrl(line.audioUrl, 1);
          await playback.finished;
        } catch (err) {
          log.error('Failed to play scene line', err);
        }
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
  const [activeTab, setActiveTab] = useState<'chat' | 'paintings'>('chat');

  const copyInteractionName = () => {
    if (interactionName) {
      void navigator.clipboard.writeText(interactionName);
      setCopiedSnackbar(true);
    }
  };
  function onOpenInputView() {
    setOpenInputView(true);
  }

  const [paintingsEverOpened, setPaintingsEverOpened] = useState(false);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, next) => {
            const nextTab = next as 'chat' | 'paintings';
            setActiveTab(nextTab);
            if (nextTab === 'paintings') setPaintingsEverOpened(true);
          }}
          aria-label="Chat page tabs"
        >
          <Tab label="Chat" value="chat" />
          <Tab label="Paintings" value="paintings" />
        </Tabs>
      </Box>
      <Box sx={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}>
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
              color="secondary"
              onClick={() => {
                void continueDirectedScene();
              }}
              disabled={!canContinueScene || loading}
            >
              Continue Scene
            </Button>
            <FormControlLabel
              label="Voice Test Mode (per-character TTS on responses)"
              slotProps={{ typography: { variant: 'body2', sx: { color: 'text.secondary' } } }}
              control={
                <Checkbox
                  size="small"
                  checked={voiceTestMode}
                  onChange={(change) => {
                    setVoiceTestMode(change.target.checked);
                  }}
                />
              }
            />
          </Box>
        )}
        <AppCard
          title="Conversation"
          subtitle={`${messages.length} message${messages.length === 1 ? '' : 's'}`}
          icon={<ForumOutlinedIcon sx={{ fontSize: 18 }} />}
          headerAction={
            interactionName ? (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Interaction:
                </Typography>
                <Chip
                  label={interactionName}
                  size="small"
                  variant="outlined"
                  onClick={copyInteractionName}
                  onDelete={copyInteractionName}
                  deleteIcon={<ContentCopyIcon fontSize="small" />}
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 320 }}
                />
              </>
            ) : undefined
          }
        >
          <Box sx={{ height: 650, overflow: 'auto', paddingRight: 0.5 }}>
            {messages.length === 0 ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <EmptyState
                  icon={<ChatBubbleOutlineOutlinedIcon />}
                  title="No messages yet"
                  description="Add a user message below, or trigger an interaction in-game to see its conversation here."
                />
              </Box>
            ) : (
              messages.map((message, index) => (
                <ChatBoxComponent
                  index={index}
                  key={message.id}
                  message={message}
                  handleMessageTextChange={handleMessageTextChange}
                  handleDeleteMessage={deleteMessage}
                  voiceLines={message.id ? voiceLinesByMessageId[message.id] : undefined}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Divider sx={{ marginX: -2, marginY: 2 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', paddingY: 1.5 }}>
              <CircularProgress disableShrink />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
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
                  variant="outlined"
                  onClick={() => {
                    void onGenerateMultiple();
                  }}
                  color="primary"
                  endIcon={<SendIcon />}
                >
                  Send 10
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  startIcon={<AddCircleOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    addNewMessage('user');
                  }}
                >
                  Add User
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  startIcon={<AddCircleOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    addNewMessage('assistant');
                  }}
                >
                  Add Assistant
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                {input ? (
                  <Button
                    variant="text"
                    color="secondary"
                    startIcon={<DataObjectOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      onOpenInputView();
                    }}
                  >
                    Event JSON
                  </Button>
                ) : null}
                <Button variant="text" color="secondary" onClick={countTokens}>
                  Count
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tokens: {0}
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<RestartAltOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={resetMessages}
                >
                  Reset
                </Button>
                <TextField
                  label="Max Output"
                  variant="outlined"
                  size="small"
                  value={maxResponseTokensState[0]}
                  onChange={(change) => {
                    maxResponseTokensState[1](Number(change.target.value));
                  }}
                  sx={{ width: 110 }}
                />
              </Box>
            </Box>
          )}
        </AppCard>
        {debugMode.isEnabled && exchanges && exchanges.length > 0 && (
          <AppCard
            title="Full LLM Interaction"
            subtitle="Editable, re-runnable per step"
            icon={<DataObjectOutlinedIcon sx={{ fontSize: 18 }} />}
          >
            {exchanges.map((exchange) => (
              <LLMExchangePanel
                key={exchange.id}
                label={exchange.label}
                initialMessages={exchange.initialMessages}
                maxResponseTokens={maxResponseTokensState[0]}
              />
            ))}
          </AppCard>
        )}
        {resultsModal.resultsModal}
        <Modal
          open={openInputView}
          onClose={() => {
            setOpenInputView(false);
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(1000px, 92vw)',
              height: 650,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '14px',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
              padding: 3,
            }}
          >
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h6">Event JSON</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Raw interaction event used to build this conversation
              </Typography>
            </Box>
            <Box
              component="pre"
              sx={{
                flex: 1,
                overflow: 'auto',
                margin: 0,
                backgroundColor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                padding: 2,
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '13px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {input}
            </Box>
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
      </Box>
      {paintingsEverOpened ? (
        <Box sx={{ display: activeTab === 'paintings' ? 'block' : 'none' }}>
          <PaintingsPanel />
        </Box>
      ) : null}
    </>
  );
}
