import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';

export interface TTSHook {
  speak: (text: string) => Promise<void>;
  // onLineStart fires as each line begins playing so callers can sync external
  // displays (the in-game subtitle) to the audio
  speakLines?: (lines: DialogueLine[], onLineStart?: (line: DialogueLine) => void) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  clearQueue?: () => void;
  isProcessing?: boolean;
  queueLength?: number;
  error?: string;
}
