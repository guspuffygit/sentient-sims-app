import log from 'electron-log';
import { appApiUrl, defaultTTSEnabled, defaultTTSVolume } from 'main/sentient-sims/constants';
import { parseJsonResponse } from 'main/sentient-sims/clients/jsonResponse';
import { AIHealthCheckResponse, AITestStatus } from 'main/sentient-sims/models/AIHealthCheckResponse';
import { ApiType, ApiTypeFromValue, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { createContext, ReactNode, use, useEffect, useMemo, useRef, useState } from 'react';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';

interface AISettingsContextType {
  aiApiName: string;
  aiApiType: ApiType;
  ttsApiType: ApiType;
  ttsEnabled: boolean;
  ttsVolume: number;
  aiApiTypeSetting: SettingsHook<ApiType>;
  ttsApiTypeSetting: SettingsHook<ApiType>;
  ttsEnabledSetting: SettingsHook<boolean>;
  ttsVolumeSetting: SettingsHook<number>;
  aiStatus: AITestStatus;
  testAI: (openAIKey?: string) => Promise<void>;
}

const NO_STATUS: AITestStatus = { status: '', error: '', loading: false };

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

interface AISettingsProviderProps {
  children: ReactNode;
}

export function useAISettings() {
  const context = use(AISettingsContext);
  if (!context) {
    throw new Error('useAISettings must be used within a AISettingsProvider');
  }
  return context;
}

export function AISettingsProvider({ children }: AISettingsProviderProps) {
  const [aiStatus, setAIStatus] = useState<AITestStatus>({
    status: '',
    error: '',
    loading: false,
  });
  const [testedApiType, setTestedApiType] = useState<ApiType>();

  const testAI = async (openAIKey?: string) => {
    setTestedApiType(aiApiTypeRef.current);
    setAIStatus({
      status: '',
      error: '',
      loading: true,
    });

    let url = `${appApiUrl}/debug/test-ai`;
    if (openAIKey) {
      const params = new URLSearchParams({
        apiKey: openAIKey,
      });
      url += `?${params.toString()}`;
    }

    log.debug(`debug url: ${url}`);

    let status = '';
    let error: string;

    try {
      const response = await fetch(url);
      const result = await parseJsonResponse<AIHealthCheckResponse>(response, 'Unable to test AI connection');
      status = result.status || '';
      error = result.error || '';
    } catch (err) {
      if (err instanceof Error) {
        error = `Error getting AI Status: ${err.message}`;
      } else {
        error = `Error getting AI Status: ${String(err)}`;
      }
    }

    setAIStatus({
      status,
      error,
      loading: false,
    });
  };

  const aiApiTypeSetting = useSetting<ApiType>(SettingsEnum.AI_API_TYPE, ApiType.SentientSimsAI);

  const ttsApiTypeSetting = useSetting<ApiType>(SettingsEnum.TTS_API_TYPE, ApiType.SentientSimsAI);

  const ttsEnabledSetting = useSetting<boolean>(SettingsEnum.TTS_ENABLED, defaultTTSEnabled);

  const ttsVolumeSetting = useSetting<number>(SettingsEnum.TTS_VOLUME, defaultTTSVolume);

  const aiApiType = ApiTypeFromValue(aiApiTypeSetting.value);

  const ttsApiType = ApiTypeFromValue(ttsApiTypeSetting.value);

  // A result belongs to the provider it tested; it would read as the new one's otherwise
  const aiApiTypeRef = useRef(aiApiType);
  useEffect(() => {
    aiApiTypeRef.current = aiApiType;
  });
  const shownStatus: AITestStatus = aiStatus.loading || testedApiType === aiApiType ? aiStatus : NO_STATUS;

  const contextValue = useMemo(() => {
    return {
      aiApiType,
      aiStatus: shownStatus,
      ttsApiType,
      ttsEnabled: ttsEnabledSetting.value,
      ttsVolume: ttsVolumeSetting.value,
      aiApiTypeSetting,
      ttsApiTypeSetting,
      ttsEnabledSetting,
      ttsVolumeSetting,
      aiApiName: ApiTypeName(aiApiType),
      testAI,
    };
  }, [aiApiType, shownStatus, ttsApiType, ttsEnabledSetting, ttsVolumeSetting, aiApiTypeSetting, ttsApiTypeSetting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void testAI();
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <AISettingsContext value={contextValue}>{children}</AISettingsContext>;
}
