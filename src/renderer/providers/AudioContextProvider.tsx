import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
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

  const stop = useCallback(() => {
    tts?.stop();
  }, [tts]);

  useEffect(() => {
    const removeListener = window.electron.onVoice((_event: any, text: string) => {
      void speak(text);
    });
    return () => {
      removeListener();
    };
  }, [speak]);

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
