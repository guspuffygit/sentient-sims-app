export interface TTSHook {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  clearQueue?: () => void;
  isProcessing?: boolean;
  queueLength?: number;
  error?: string;
}
