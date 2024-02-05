import { useEffect, useState } from 'react';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';

export default function useApiKeyAITest() {
  const [aiStatus, setAIStatus] = useState({
    status: '',
    loading: false,
  });

  const testAI = (openAIKey?: string) => {
    setAIStatus({
      status: '',
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
        .then((response: any) => {
          setAIStatus({
            status: response.status,
            loading: false,
          });
          return response.status;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((err: any) => {
          const status = 'Error getting AI Status';
          setAIStatus({
            status,
            loading: false,
          });
          return status;
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
