import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';

export interface TTSHook {
  speak: (text: string) => Promise<void>;
  speakLines?: (lines: DialogueLine[]) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  clearQueue?: () => void;
  isProcessing?: boolean;
  queueLength?: number;
  error?: string;
}
