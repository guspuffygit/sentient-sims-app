import React, { createContext, use, useState, ReactNode, useCallback, useMemo } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

type Severity = 'success' | 'info' | 'warning' | 'error';

// A button on the message that takes the player to the fix ("Open Settings")
export type SnackBarAction = { label: string; onClick: () => void };

type SnackBarContextType = {
  showMessage: (message: string, severity?: Severity, action?: SnackBarAction) => void;
};

const SnackBarContext = createContext<SnackBarContextType | undefined>(undefined);

type SnackBarProviderProps = {
  children: ReactNode;
};

// A message with a button stays up longer: it asks the player to do something
const AUTO_HIDE_MS = 6000;
const AUTO_HIDE_WITH_ACTION_MS = 15000;

export function SnackBarProvider({ children }: SnackBarProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [action, setAction] = useState<SnackBarAction | undefined>();

  const showMessage = useCallback((msg: string, severityType: Severity = 'info', messageAction?: SnackBarAction) => {
    setMessage(msg);
    setSeverity(severityType);
    setAction(messageAction);
    setOpen(true);
  }, []);

  const handleClose = (event: React.SyntheticEvent<any> | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const contextValue = useMemo(() => {
    return { showMessage };
  }, [showMessage]);

  return (
    <SnackBarContext value={contextValue}>
      {children}
      <Snackbar open={open} autoHideDuration={action ? AUTO_HIDE_WITH_ACTION_MS : AUTO_HIDE_MS} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          sx={{ width: '100%' }}
          action={
            action && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                {action.label}
              </Button>
            )
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackBarContext>
  );
}

export const useSnackBar = () => {
  const context = use(SnackBarContext);
  if (context === undefined) {
    throw new Error('useSnackBar must be used within a SnackBarProvider');
  }
  return context;
};
