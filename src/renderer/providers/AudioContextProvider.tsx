import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import log from 'electron-log';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useElevenLabsTTS } from 'renderer/voice/useElevenLabsTTS';
import { useKokoroTTS } from 'renderer/voice/useKokoroTTS';
import { useSentientSimsTTS } from 'renderer/voice/useSentientSimsTTS';
import { useAISettings } from './AISettingsProvider';

interface TTSAudioContextType {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isWebGPUSupported: boolean | null;
  isPlaying: boolean | undefined;
  error: string | undefined;
}

const TTSAudioContext = createContext<TTSAudioContextType | undefined>(
  undefined,
);

interface AudioContextProviderProps {
  children: ReactNode;
}

async function checkWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
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
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(
    null,
  );
  const remoteKokoroTTS = useKokoroTTS({ isWebGPUSupported });

  // eslint-disable-next-line consistent-return
  const tts = useMemo(() => {
    if (aiSettings.ttsApiType === ApiType.SentientSimsAI) {
      return sentientSimsTTS;
    }
    if (aiSettings.ttsApiType === ApiType.ElevenLabs) {
      return elevenLabsTTS;
    }
    if (aiSettings.ttsApiType === ApiType.Kokoro) {
      return remoteKokoroTTS;
    }
  }, [aiSettings.ttsApiType, elevenLabsTTS, remoteKokoroTTS, sentientSimsTTS]);

  useEffect(() => {
    async function checkSupport() {
      const supported = await checkWebGPU();
      setIsWebGPUSupported(supported);
    }

    checkSupport();
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      if (aiSettings.ttsEnabled) {
        tts?.speak(text);
      }
    },
    [aiSettings.ttsEnabled, tts],
  );

  const stop = useCallback(() => {
    tts?.stop();
  }, [tts]);

  useEffect(() => {
    const removeListener = window.electron.onVoice(
      (_event: any, text: string) => {
        speak(text);
      },
    );
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

  return (
    <TTSAudioContext.Provider value={contextValue}>
      {children}
    </TTSAudioContext.Provider>
  );
}

export const useTTS = (): TTSAudioContextType => {
  const context = useContext(TTSAudioContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};
