import { useState } from 'react';

export function useDebounceHook() {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  return (func: () => void, delay: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setTimeoutId(
      setTimeout(() => {
        func();
        setTimeoutId(null);
      }, delay),
    );
  };
}
