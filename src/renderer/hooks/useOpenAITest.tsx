import { useEffect, useState } from 'react';

export default function useOpenAITest() {
  const [openAIStatus, setOpenAIStatus] = useState({
    status: '',
    loading: false,
  });

  const testOpenAI = () => {
    setOpenAIStatus({
      status: '',
      loading: true,
    });
    fetch('http://localhost:25148/debug/test-open-ai')
      .then((res) => {
        return res.json();
      })
      // eslint-disable-next-line promise/always-return
      .then((response: any) => {
        setOpenAIStatus({
          status: response.status,
          loading: false,
        });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err: any) => {
        setOpenAIStatus({
          status: 'Error getting Open AI Status',
          loading: false,
        });
      });
  };

  useEffect(() => {
    testOpenAI();
  }, []);

  return {
    openAIStatus,
    testOpenAI,
  };
}
