import { useEffect, useState } from 'react';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { AIHealthCheckResponse } from 'main/sentient-sims/models/AIHealthCheckResponse';

export default function useApiKeyAITest() {
  const [aiStatus, setAIStatus] = useState({
    status: '',
    error: '',
    loading: false,
  });

  const testAI = (openAIKey?: string) => {
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

    return (
      fetch(url)
        .then((res) => {
          return res.json();
        })
        // eslint-disable-next-line promise/always-return
        .then((response: AIHealthCheckResponse) => {
          setAIStatus({
            status: response?.status || '',
            error: response?.error || '',
            loading: false,
          });
          return response;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((err: any) => {
          setAIStatus({
            status: '',
            error: 'Error getting AI Status',
            loading: false,
          });
          const response: AIHealthCheckResponse = {
            error: 'Error getting AI Status',
          };
          return response;
        })
    );
  };

  useEffect(() => {
    testAI();
  }, []);

  return {
    aiStatus,
    testAI,
  };
}
