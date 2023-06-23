import { useEffect, useState } from 'react';

export default function useDebugModeHook() {
  const [debugModeEnabled, setDebugModeEnabled] = useState(false);

  useEffect(() => {
    window.electron.onDebugModeToggle(() => {
      setDebugModeEnabled(true);
    });
  }, []);

  return [debugModeEnabled, setDebugModeEnabled];
}
