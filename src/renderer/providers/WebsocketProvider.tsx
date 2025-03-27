/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
import { WebsocketClient } from 'main/sentient-sims/clients/WebsocketClient';
import {
  WebsocketStatusChange,
  WebsocketStatusResponse,
} from 'main/sentient-sims/models/WebsocketStatusResponse';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const websocketClient = new WebsocketClient();

interface WebsocketContextType {
  status: WebsocketStatusResponse;
}

const WebsocketContext = createContext<WebsocketContextType | undefined>(
  undefined,
);

interface WebsocketProviderProps {
  children: ReactNode;
}

// Custom hook to use the WebsocketContext
export function useWebsocket() {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error('useWebsocket must be used within a WebsocketProvider');
  }
  return context;
}

export function WebsocketProvider({ children }: WebsocketProviderProps) {
  const [status, setStatus] = useState<WebsocketStatusResponse>({
    mod: false,
    renderer: false,
  });

  useEffect(() => {
    websocketClient.isConnected().then((newStatus) => setStatus(newStatus));
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onWebsocketStatusChange(
      (_event: any, statusChange: WebsocketStatusChange) => {
        if (statusChange.type === 'mod') {
          setStatus({
            mod: statusChange.status,
            renderer: status.renderer,
          });
        } else {
          setStatus({
            mod: status.mod,
            renderer: statusChange.status,
          });
        }
      },
    );

    return () => {
      removeListener();
    };
  }, [status.mod, status.renderer]);

  const contextValue = useMemo(() => {
    return { status };
  }, [status]);

  return (
    <WebsocketContext.Provider value={contextValue}>
      {children}
    </WebsocketContext.Provider>
  );
}
