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
import { useRemoteKokoroTTS } from 'renderer/voice/useRemoteKokoroTTS';
import { useWebGPUKokoro } from 'renderer/voice/useWebGPUKokoro';
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
  const elevenLabsTTS = useElevenLabsTTS();
  const remoteKokoroTTS = useRemoteKokoroTTS();
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(
    null,
  );
  const webGPUKokoroTTS = useWebGPUKokoro({ isWebGPUSupported });

  // eslint-disable-next-line consistent-return
  const tts = useCallback(() => {
    if (aiSettings.ttsApiType === ApiType.ElevenLabs) {
      return elevenLabsTTS;
    }
    if (aiSettings.ttsApiType === ApiType.Kokoro) {
      if (isWebGPUSupported) {
        return webGPUKokoroTTS;
      }

      return remoteKokoroTTS;
    }
  }, [
    aiSettings.ttsApiType,
    elevenLabsTTS,
    isWebGPUSupported,
    remoteKokoroTTS,
    webGPUKokoroTTS,
  ]);

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

      tts()?.speak(text);
    },
    [tts],
  );

  const stop = useCallback(() => {
    tts()?.stop();
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
    const ttsInstance = tts();
    return {
      speak,
      stop,
      isWebGPUSupported,
      isPlaying: ttsInstance?.isPlaying,
      error: ttsInstance?.error,
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
