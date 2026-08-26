import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import { useElevenLabsTTS } from 'renderer/voice/useElevenLabsTTS';
import { useSentientSimsTTS } from 'renderer/voice/useSentientSimsTTS';
import { useAISettings } from './AISettingsProvider';

interface TTSAudioContextType {
  // voiceId pins a specific cast voice (an ElevenLabs voice id or a Kokoro blend like
  // 'af_heart+af_sky') instead of the settings default — used by per-sim voice test buttons
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  isWebGPUSupported: boolean | null;
  isPlaying: boolean | undefined;
  error: string | undefined;
}

const TTSAudioContext = createContext<TTSAudioContextType | undefined>(undefined);

interface AudioContextProviderProps {
  children: ReactNode;
}

async function checkWebGPU(): Promise<boolean> {
  if (!('gpu' in navigator)) {
    log.warn('WebGPU is not supported in this environment.');
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      log.warn('WebGPU adapter is not available.');
      return false;
    }
    return true;
  } catch (error) {
    log.error('Error while checking WebGPU support:', error);
    return false;
  }
}

export function AudioContextProvider({ children }: AudioContextProviderProps) {
  const aiSettings = useAISettings();
  const sentientSimsTTS = useSentientSimsTTS();
  const elevenLabsTTS = useElevenLabsTTS();
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);

  const tts = useMemo(() => {
    if (aiSettings.ttsApiType === ApiType.SentientSimsAI) {
      return sentientSimsTTS;
    }
    if (aiSettings.ttsApiType === ApiType.ElevenLabs) {
      return elevenLabsTTS;
    }
  }, [aiSettings.ttsApiType, elevenLabsTTS, sentientSimsTTS]);

  useEffect(() => {
    async function checkSupport() {
      const supported = await checkWebGPU();
      setIsWebGPUSupported(supported);
    }

    void checkSupport();
  }, []);

  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      if (!text.trim()) return;

      if (!aiSettings.ttsEnabled) return;

      // A pinned voice has to go through the per-line path; plain speak() always
      // uses the settings default voice
      if (voiceId && tts?.speakLines) {
        await tts.speakLines([{ speaker: 'Voice test', text, voiceId }]);
        return;
      }
      await tts?.speak(text);
    },
    [aiSettings.ttsEnabled, tts],
  );

  // One scene plays at a time; a few more may wait so back-to-back autonomous scenes all
  // play in order. Beyond that, scenes are dropped so audio never piles up far behind
  // gameplay. Paced scenes stream each line to the game as it starts playing (the
  // whole-block in-game subtitle was suppressed on their behalf); the preamble (the
  // scene's driving action) heads each line's subtitle section
  const maxQueuedScenes = 3;
  const sceneQueueRef = useRef<{ lines: DialogueLine[]; paced: boolean; preamble?: string; pacedText?: string }[]>([]);
  const drainingRef = useRef(false);

  // A dropped paced scene will never stream its lines, so tell the main process to
  // un-suppress its in-game subtitle block before the memory arrives from the mod
  const reportDroppedScene = useCallback((scene: { paced: boolean; pacedText?: string }) => {
    if (scene.paced && scene.pacedText) {
      window.electron.notifySceneDropped(scene.pacedText);
    }
  }, []);

  const stop = useCallback(() => {
    sceneQueueRef.current.splice(0).forEach(reportDroppedScene);
    tts?.stop();
  }, [tts, reportDroppedScene]);

  const speakDialogueLines = useCallback(
    async (lines: DialogueLine[], paced: boolean, preamble?: string) => {
      if (lines.length === 0) return;

      const notifyLineShown = paced
        ? (line: DialogueLine) => {
            window.electron.notifySceneLineShown({ speaker: line.speaker, text: line.text, preamble });
          }
        : undefined;

      const uniqueSpeakers = new Set(lines.map((line) => line.speaker));
      const hasCastVoices = lines.some((line) => line.voiceId);

      if (aiSettings.ttsEnabled && (uniqueSpeakers.size > 1 || hasCastVoices) && tts?.speakLines) {
        await tts.speakLines(lines, notifyLineShown);
        return;
      }

      if (!notifyLineShown) {
        if (aiSettings.ttsEnabled) {
          await speak(lines.map((line) => line.text).join(' '));
        }
        return;
      }

      // Paced scene without a per-line TTS path (TTS disabled or single voice): the
      // in-game subtitles still arrive one line at a time, each held for its audio's
      // duration or, with TTS off, long enough to read
      for (let i = 0; i < lines.length; i += 1) {
        notifyLineShown(lines[i]);
        if (aiSettings.ttsEnabled) {
          await speak(lines[i].text);
        } else {
          await new Promise((resolve) => {
            setTimeout(resolve, sceneLineReadingHoldMs(lines[i].text));
          });
        }
        if (i < lines.length - 1) {
          await new Promise((resolve) => {
            setTimeout(resolve, sceneLineGapMs);
          });
        }
      }
    },
    [aiSettings.ttsEnabled, tts, speak],
  );

  const drainSceneQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (sceneQueueRef.current.length > 0) {
        const scene = sceneQueueRef.current.shift();
        if (!scene) continue;
        await speakDialogueLines(scene.lines, scene.paced, scene.preamble);
      }
    } finally {
      drainingRef.current = false;
    }
  }, [speakDialogueLines]);

  useEffect(() => {
    const removeListener = window.electron.onVoice(
      (_event: any, lines: DialogueLine[], options?: { paced?: boolean; preamble?: string; pacedText?: string }) => {
        const scene = {
          lines,
          paced: options?.paced ?? false,
          preamble: options?.preamble,
          pacedText: options?.pacedText,
        };
        // Drop the oldest waiting scene, not the incoming one — the newest scene matches
        // what is happening on screen right now, the oldest is furthest behind gameplay
        while (sceneQueueRef.current.length >= maxQueuedScenes) {
          const dropped = sceneQueueRef.current.shift();
          if (dropped) {
            log.debug(`TTS scene queue full — dropping oldest queued scene`);
            reportDroppedScene(dropped);
          }
        }
        sceneQueueRef.current.push(scene);
        void drainSceneQueue();
      },
    );
    return () => {
      removeListener();
    };
  }, [drainSceneQueue, reportDroppedScene]);

  const contextValue = useMemo(() => {
    return {
      speak,
      stop,
      isWebGPUSupported,
      isPlaying: tts?.isPlaying,
      error: tts?.error,
    };
  }, [speak, stop, isWebGPUSupported, tts]);

  return <TTSAudioContext value={contextValue}>{children}</TTSAudioContext>;
}

export const useTTS = (): TTSAudioContextType => {
  const context = use(TTSAudioContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};
