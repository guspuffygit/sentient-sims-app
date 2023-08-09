/* eslint-disable import/prefer-default-export */
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Define the context for the debug mode
interface DebugModeContextType {
  isEnabled: boolean;
}

const DebugModeContext = createContext<DebugModeContextType | undefined>(
  undefined
);

// Provider component
interface DebugModeProviderProps {
  children: ReactNode;
}

// Custom hook to use the DebugModeContext
export function useDebugMode() {
  const context = useContext(DebugModeContext);
  if (!context) {
    throw new Error('useDebugMode must be used within a DebugModeProvider');
  }
  return context;
}

export function DebugModeProvider({ children }: DebugModeProviderProps) {
  const [debugModeEnabled, setDebugModeEnabled] = useState(false);

  useEffect(() => {
    window.electron.onDebugModeToggle(() => {
      setDebugModeEnabled(true);
    });
  }, []);

  const contextValue = useMemo(() => {
    return { isEnabled: debugModeEnabled };
  }, [debugModeEnabled]);

  return (
    <DebugModeContext.Provider value={contextValue}>
      {children}
    </DebugModeContext.Provider>
  );
}
