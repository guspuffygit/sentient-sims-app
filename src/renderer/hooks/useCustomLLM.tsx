import { useEffect, useState } from 'react';
import { LLMWorker } from 'main/sentient-sims/models/LLMWorker';
import log from 'electron-log';

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
    fetch('http://localhost:25148/debug/test-custom-llm')
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

export type CustomLLMWorkersState = {
  workers: LLMWorker[];
  loading: boolean;
};

export function useCustomLLMWorkers() {
  const [customLLMWorkersState, setCustomLLMWorkersState] =
    useState<CustomLLMWorkersState>({
      workers: [],
      loading: false,
    });

  const getCustomLLMWorkers = () => {
    setCustomLLMWorkersState({
      workers: [],
      loading: true,
    });
    log.debug(`Starting to get custom llm workers`);
    fetch('http://localhost:25148/debug/custom-llm-workers')
      .then((res) => {
        return res.json();
      })
      // eslint-disable-next-line promise/always-return
      .then((response: LLMWorker[]) => {
        log.debug(`Done get custom llm workers`);
        setCustomLLMWorkersState({
          workers: response,
          loading: false,
        });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err: any) => {
        setCustomLLMWorkersState({
          workers: [],
          loading: false,
        });
      });
  };

  useEffect(() => {
    getCustomLLMWorkers();
  }, []);

  return {
    workers: customLLMWorkersState.workers,
    workersLoading: customLLMWorkersState.loading,
    getCustomLLMWorkers,
  };
}
