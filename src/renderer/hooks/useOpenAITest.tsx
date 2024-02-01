import { useEffect, useState } from 'react';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';

export default function useOpenAITest() {
  const [openAIStatus, setOpenAIStatus] = useState({
    status: '',
    loading: false,
  });

  const testOpenAI = (openAIKey?: string) => {
    setOpenAIStatus({
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
          setOpenAIStatus({
            status: response.status,
            loading: false,
          });
          return response.status;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch((err: any) => {
          const status = 'Error getting Open AI Status';
          setOpenAIStatus({
            status,
            loading: false,
          });
          return status;
        })
    );
  };

  useEffect(() => {
    testOpenAI();
  }, []);

  return {
    openAIStatus,
    testOpenAI,
  };
}
