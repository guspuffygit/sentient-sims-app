import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { useElevenLabsTTS } from 'renderer/voice/useElevenLabsTTS';
import { useSentientSimsTTS } from 'renderer/voice/useSentientSimsTTS';
import { useAISettings } from './AISettingsProvider';

interface TTSAudioContextType {
  speak: (text: string) => Promise<void>;
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
    async (text: string) => {
      if (!text.trim()) return;

      if (aiSettings.ttsEnabled) {
        await tts?.speak(text);
      }
    },
    [aiSettings.ttsEnabled, tts],
  );

  // One scene plays at a time; at most one more may wait. Scenes arriving while the
  // queue is full are dropped outright so audio never piles up behind gameplay.
  const maxQueuedScenes = 1;
  const sceneQueueRef = useRef<DialogueLine[][]>([]);
  const drainingRef = useRef(false);

  const stop = useCallback(() => {
    sceneQueueRef.current = [];
    tts?.stop();
  }, [tts]);

  const speakDialogueLines = useCallback(
    async (lines: DialogueLine[]) => {
      if (!aiSettings.ttsEnabled || lines.length === 0) return;

      const uniqueSpeakers = new Set(lines.map((line) => line.speaker));
      const hasCastVoices = lines.some((line) => line.voiceId);

      if ((uniqueSpeakers.size > 1 || hasCastVoices) && tts?.speakLines) {
        await tts.speakLines(lines);
        return;
      }

      await speak(lines.map((line) => line.text).join(' '));
    },
    [aiSettings.ttsEnabled, tts, speak],
  );

  const drainSceneQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (sceneQueueRef.current.length > 0) {
        const lines = sceneQueueRef.current.shift();
        if (!lines) continue;
        await speakDialogueLines(lines);
      }
    } finally {
      drainingRef.current = false;
    }
  }, [speakDialogueLines]);

  useEffect(() => {
    const removeListener = window.electron.onVoice((_event: any, lines: DialogueLine[]) => {
      if (sceneQueueRef.current.length >= maxQueuedScenes) {
        log.debug(`TTS scene queue full (${sceneQueueRef.current.length} waiting) — dropping incoming scene`);
        return;
      }
      sceneQueueRef.current.push(lines);
      void drainSceneQueue();
    });
    return () => {
      removeListener();
    };
  }, [drainSceneQueue]);

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
