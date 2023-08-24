import { useEffect, useState } from 'react';
import log from 'electron-log';

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

    let url = 'http://localhost:25148/debug/test-open-ai';
    if (openAIKey) {
      const params = new URLSearchParams({
        openAIKey,
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
