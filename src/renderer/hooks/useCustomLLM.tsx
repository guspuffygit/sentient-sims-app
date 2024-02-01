import { useEffect, useState } from 'react';
import { appApiUrl } from 'main/sentient-sims/constants';

export function useCustomLLMHealth() {
  const [customLLMStatus, setCustomLLMStatus] = useState({
    status: '',
    loading: false,
  });

  const testCustomLLM = () => {
    setCustomLLMStatus({
      status: '',
      loading: true,
    });
    fetch(`${appApiUrl}/debug/test-ai`)
      .then((res) => {
        return res.json();
      })
      // eslint-disable-next-line promise/always-return
      .then((response: any) => {
        setCustomLLMStatus({
          status: response.status,
          loading: false,
        });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err: any) => {
        setCustomLLMStatus({
          status: 'Error getting Custom LLM Status',
          loading: false,
        });
      });
  };

  useEffect(() => {
    testCustomLLM();
  }, []);

  return {
    customLLMStatus,
    testCustomLLM,
  };
}
