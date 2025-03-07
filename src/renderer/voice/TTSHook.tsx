export interface TTSHook {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  error?: string;
}
