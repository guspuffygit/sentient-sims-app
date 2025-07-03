export interface TTSHook {
  speak: (text: string) => void;
  stop: () => void;
  isPlaying: boolean;
  clearQueue?: () => void;
  isProcessing?: boolean;
  queueLength?: number;
  error?: string;
}
