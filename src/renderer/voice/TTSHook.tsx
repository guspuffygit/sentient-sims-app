import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';

export interface TTSHook {
  speak: (text: string) => Promise<void>;
  // onLineStart fires as each line begins playing so callers can sync external
  // displays (the in-game subtitle) to the audio; voiced is false when the line has no
  // audio and is only held for reading time. onLineEnd fires when its playback (or
  // hold) is over, including after a playback error or a cancelled session.
  // shouldContinue is consulted between lines: false ends the scene after the line
  // playing right now, without cutting it off (a sim walking away ends the
  // conversation, it does not glitch the audio). stop() is the mid-word version.
  speakLines?: (
    lines: DialogueLine[],
    onLineStart?: (line: DialogueLine, voiced: boolean) => void,
    onLineEnd?: (line: DialogueLine) => void,
    shouldContinue?: () => boolean,
  ) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  clearQueue?: () => void;
  isProcessing?: boolean;
  queueLength?: number;
  error?: string;
}
