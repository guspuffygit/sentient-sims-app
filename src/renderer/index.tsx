import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { Amplify } from 'aws-amplify';
import '@patternfly/react-core/dist/styles/base.css';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import theme from './theme';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import ChatPage from './ChatPage';
import LastExceptionPage from './LastExceptionPage';
import { DebugModeProvider } from './providers/DebugModeProvider';
import LogViewerPage from './LogViewerPage';
import MemoriesPage from './MemoriesPage';
import LocationsPage from './LocationsPage';
import { ChatGenerationProvider } from './providers/ChatGenerationProvider';
import SimsPage from './SimsPage';
import { SnackBarProvider } from './providers/SnackBarProvider';
import { AISettingsProvider } from './providers/AISettingsProvider';
import { VersionsProvider } from './providers/VersionsProvider';
import TraitsPage from './TraitsPage';
import { AudioContextProvider } from './providers/AudioContextProvider';
import OfflineMemory from './OfflineMemory';
import { WebsocketProvider } from './providers/WebsocketProvider';
import 'aws-amplify/auth/enable-oauth-listener';
import { AuthProvider } from './providers/AuthProvider';
import { AmplifyConfig } from './AmplifyConfig';
import OnlineMappingBrowser from './components/OnlineMappingBrowser';

Amplify.configure(AmplifyConfig);

const router = createMemoryRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/traits',
        element: <TraitsPage />,
      },
      {
        path: '/mapping-browser',
        element: <OnlineMappingBrowser />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/chat',
        element: <ChatPage />,
      },
      {
        path: '/offlinememory',
        element: <OfflineMemory />,
      },
      {
        path: '/sims',
        element: <SimsPage />,
      },
      {
        path: '/locations',
        element: <LocationsPage />,
      },
      {
        path: '/memories',
        element: <MemoriesPage />,
      },
      {
        path: '/last-exception',
        element: <LastExceptionPage />,
      },
      {
        path: '/logs',
        element: <LogViewerPage />,
      },
    ],
  },
]);

Object.defineProperty(window.history, 'replaceState', {
  configurable: true,
  value: () => {},
});

const queryClient = new QueryClient();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Authenticator.Provider>
      <React.StrictMode>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <SnackBarProvider>
              <WebsocketProvider>
                <VersionsProvider>
                  <AISettingsProvider>
                    <AudioContextProvider>
                      <ChatGenerationProvider>
                        <DebugModeProvider>
                          <RouterProvider router={router} />
                        </DebugModeProvider>
                      </ChatGenerationProvider>
                    </AudioContextProvider>
                  </AISettingsProvider>
                </VersionsProvider>
              </WebsocketProvider>
            </SnackBarProvider>
          </QueryClientProvider>
        </AuthProvider>
      </React.StrictMode>
    </Authenticator.Provider>
  </ThemeProvider>,
);
