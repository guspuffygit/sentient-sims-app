import { ReactNode, createContext, use, useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { VoiceRecorderState, useVoiceRecorder } from 'renderer/voice/useVoiceRecorder';

const VoiceInputContext = createContext<VoiceRecorderState>({ isRecording: false });

export function useVoiceInput(): VoiceRecorderState {
  return use(VoiceInputContext);
}

// A floating chip so the player glancing over from the game sees the mic state and what
// was heard; the primary feedback is the in-game notification/subtitle
function VoiceInputIndicator({ state }: { state: VoiceRecorderState }) {
  // Visibility is derived: a transcript shows until the timeout marks it expired, so no
  // synchronous setState runs inside the effect body
  const [expiredTranscript, setExpiredTranscript] = useState<string>();

  useEffect(() => {
    if (state.lastTranscript) {
      const shown = state.lastTranscript;
      const timeout = setTimeout(() => {
        setExpiredTranscript(shown);
      }, 6000);
      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [state.lastTranscript]);

  const showTranscript = state.lastTranscript !== undefined && state.lastTranscript !== expiredTranscript;
  if (!state.isRecording && !showTranscript) {
    return null;
  }

  return (
    <Chip
      icon={<MicIcon />}
      color={state.isRecording ? 'error' : 'default'}
      label={state.isRecording ? 'Listening…' : state.lastTranscript}
      sx={{
        'position': 'fixed',
        'bottom': 16,
        'right': 16,
        'zIndex': 2000,
        'maxWidth': 480,
        'animation': state.isRecording ? 'voice-input-pulse 1.2s ease-in-out infinite' : undefined,
        '@keyframes voice-input-pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.55 },
          '100%': { opacity: 1 },
        },
      }}
    />
  );
}

// Mounted once near the top of the provider tree so recording works no matter which
// page is open
export function VoiceInputProvider({ children }: { children: ReactNode }) {
  const state = useVoiceRecorder();

  return (
    <VoiceInputContext value={state}>
      {children}
      <VoiceInputIndicator state={state} />
    </VoiceInputContext>
  );
}
