import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { Amplify } from 'aws-amplify';
import '@patternfly/react-core/dist/styles/base.css';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { appApiUrl } from 'main/sentient-sims/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import theme from './theme';
import awsExports from './aws-exports';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import ChatPage from './ChatPage';
import LastExceptionPage from './LastExceptionPage';
import LoginPage from './LoginPage';
import { DebugModeProvider } from './providers/DebugModeProvider';
import LogViewerPage from './LogViewerPage';
import MemoriesPage from './MemoriesPage';
import LocationsPage from './LocationsPage';
import { ChatGenerationProvider } from './providers/ChatGenerationProvider';
import SimsPage from './SimsPage';
import { SnackBarProvider } from './providers/SnackBarProvider';
import { AISettingsProvider } from './providers/AISettingsProvider';
import { VersionsProvider } from './providers/VersionsProvider';

const updatedAwsConfig = {
  ...awsExports,
  oauth: {
    ...awsExports.oauth,
    redirectSignIn: `${appApiUrl}/login/callback`,
    redirectSignOut: `${appApiUrl}/login/signout`,
  },
};
Amplify.configure(updatedAwsConfig);

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
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/chat',
        element: <ChatPage />,
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
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/logs',
        element: <LogViewerPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <React.StrictMode>
      <Authenticator.Provider>
        <QueryClientProvider client={queryClient}>
          <SnackBarProvider>
            <VersionsProvider>
              <AISettingsProvider>
                <ChatGenerationProvider>
                  <DebugModeProvider>
                    <RouterProvider router={router} />
                  </DebugModeProvider>
                </ChatGenerationProvider>
              </AISettingsProvider>
            </VersionsProvider>
          </SnackBarProvider>
        </QueryClientProvider>
      </Authenticator.Provider>
    </React.StrictMode>
  </ThemeProvider>
);
