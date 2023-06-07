/* eslint no-console: off */
import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import App, { Hello } from './App';
import theme from './theme';
import awsExports from './aws-exports';

const urls = new Map<string, string>();
urls.set('localhost', 'http://localhost:25148');
urls.set('www.sentientsimulations.com', 'https://www.sentientsimulations.com');
const updatedAwsConfig = {
  ...awsExports,
  oauth: {
    ...awsExports.oauth,
    redirectSignIn: urls.get(window.location.hostname),
    redirectSignOut: urls.get(window.location.hostname),
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
        element: (
          <p>
            <Hello />
          </p>
        ),
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
        <RouterProvider router={router} />
      </Authenticator.Provider>
    </React.StrictMode>
  </ThemeProvider>
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
