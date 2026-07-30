import { alpha, Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { MessageInputProps } from 'main/sentient-sims/models/MessageInputProps';
import { useMemo, useState } from 'react';
import log from 'electron-log';
import { VoiceTestLine } from 'renderer/voice/useVoiceTestPlayback';
import { playAudioUrl } from 'renderer/voice/audioPlayback';
import { useDebounceHook } from './hooks/useDebounceHook';

export type ChatBoxComponentProps = {
  message: MessageInputProps;
  handleMessageTextChange: (index: number, value: string) => void;
  handleDeleteMessage: (index: number) => void;
  index: number;
  voiceLines?: VoiceTestLine[];
};

const roleLabelColors = {
  system: 'text.disabled',
  user: 'secondary.main',
  assistant: 'primary.light',
} as const;

function playVoiceLine(line: VoiceTestLine) {
  if (!line.audioUrl) return;
  playAudioUrl(line.audioUrl, 1).catch((err: unknown) => {
    log.error('Failed to play voice line', err);
  });
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
            size="small"
            sx={{ 'color': 'text.disabled', '&:hover': { color: 'error.light' } }}
            onClick={() => {
              handleDeleteMessage(index);
            }}
          >
            <RemoveCircleOutlineIcon fontSize="small" />
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

  const { role } = message.message;
  const isAssistant = role === 'assistant';
  const isSystem = role === 'system';
  const railColor = isAssistant ? 'primary.main' : 'rgba(255, 255, 255, 0.16)';
  const flatBackground = isSystem ? 'transparent' : 'rgba(255, 255, 255, 0.03)';

  return (
    <Box
      key={message.id}
      sx={{
        'marginBottom': 1.5,
        'paddingX': 1.75,
        'paddingY': 1.25,
        'borderRadius': 2.5,
        'border': isSystem ? '1px dashed' : '1px solid',
        'borderColor': isAssistant ? (theme) => alpha(theme.palette.primary.main, 0.24) : 'divider',
        'borderLeft': isSystem ? undefined : '3px solid',
        'borderLeftColor': isSystem ? undefined : railColor,
        'backgroundColor': isAssistant ? (theme) => alpha(theme.palette.primary.main, 0.07) : flatBackground,
        'transition': 'border-color 120ms ease',
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, marginBottom: 0.25 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: roleLabelColors[role] }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: roleLabelColors[role] }}
        >
          {role}
        </Typography>
      </Box>
      <TextField
        id="outlined-textarea"
        fullWidth
        onChange={(event) => {
          handleTextChange(event.target.value);
        }}
        variant="standard"
        multiline
        placeholder="Type a message"
        value={text}
        sx={{
          '& .MuiInputBase-root': {
            'padding': 0,
            'fontSize': '0.92rem',
            'lineHeight': 1.65,
            'backgroundColor': 'transparent',
            '&::before, &::after': { display: 'none' },
          },
        }}
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
    </Box>
  );
}
