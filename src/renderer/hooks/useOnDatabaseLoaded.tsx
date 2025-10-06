import { useEffect } from 'react';

export function useOnDatabaseLoaded(callback: (sessionId: string) => void) {
  useEffect(() => {
    const removeListener = window.electron.onDatabaseLoaded((_event: any, sessionId: string) => {
      callback(sessionId);
    });

    return () => {
      removeListener();
    };
  }, [callback]);
}
