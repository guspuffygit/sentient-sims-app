import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import {
  AIHealthCheckResponse,
  AITestStatus,
} from 'main/sentient-sims/models/AIHealthCheckResponse';
import {
  ApiType,
  ApiTypeFromValue,
  ApiTypeName,
} from 'main/sentient-sims/models/ApiType';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useSetting, { SettingsHook } from 'renderer/hooks/useSetting';

interface AISettingsContextType {
  aiApiName: string;
  aiApiType: ApiType;
  aiApiTypeSetting: SettingsHook;
  aiStatus: AITestStatus;
  testAI: (openAIKey?: string) => Promise<void>;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(
  undefined
);

interface AISettingsProviderProps {
  children: ReactNode;
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
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

  const testAI = async (openAIKey?: string) => {
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
    let error = '';

    try {
      const response = await fetch(url);
      const result: AIHealthCheckResponse = await response.json();
      status = result?.status || '';
      error = result?.error || '';
    } catch (err) {
      error = `Error getting AI Status: ${err}`;
      if (err instanceof Error) {
        error = `Error getting AI Status: ${err.message}`;
      }
    }

    setAIStatus({
      status,
      error,
      loading: false,
    });
  };

  const aiApiTypeSetting = useSetting(
    SettingsEnum.AI_API_TYPE,
    ApiType.OpenAI.toString()
  );

  const aiApiType = ApiTypeFromValue(aiApiTypeSetting.value);

  const contextValue = useMemo(() => {
    return {
      aiApiType,
      aiStatus,
      aiApiTypeSetting,
      aiApiName: ApiTypeName(aiApiType),
      testAI,
    };
  }, [aiApiType, aiStatus, aiApiTypeSetting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      testAI();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AISettingsContext.Provider value={contextValue}>
      {children}
    </AISettingsContext.Provider>
  );
}
