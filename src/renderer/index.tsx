import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import log from 'electron-log';
import App from './App';
import theme from './theme';
import awsExports from './aws-exports';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import ChatPage from './ChatPage';
import LastExceptionPage from './LastExceptionPage';
import LoginPage from './LoginPage';
import { DebugModeProvider } from './providers/DebugModeProvider';

const urls = new Map<string, string>();
urls.set('localhost', 'http://localhost:25148');
urls.set('www.sentientsimulations.com', 'https://www.sentientsimulations.com');
const updatedAwsConfig = {
  ...awsExports,
  oauth: {
    ...awsExports.oauth,
    redirectSignIn: `http://${window.location.host}`,
    redirectSignOut: `http://${window.location.host}`,
  },
};
log.info(`url: http://${window.location.host}`);
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
        path: '/last-exception',
        element: <LastExceptionPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
]);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <React.StrictMode>
      <Authenticator.Provider>
        <DebugModeProvider>
          <RouterProvider router={router} />
        </DebugModeProvider>
      </Authenticator.Provider>
    </React.StrictMode>
  </ThemeProvider>
);
