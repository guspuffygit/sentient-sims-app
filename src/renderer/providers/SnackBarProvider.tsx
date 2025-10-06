import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type SnackBarContextType = {
  showMessage: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
};

const SnackBarContext = createContext<SnackBarContextType | undefined>(undefined);

type SnackBarProviderProps = {
  children: ReactNode;
};

export function SnackBarProvider({ children }: SnackBarProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const showMessage = useCallback((msg: string, severityType: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setMessage(msg);
    setSeverity(severityType);
    setOpen(true);
  }, []);

  const handleClose = (event: React.SyntheticEvent<any, Event> | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const contextValue = useMemo(() => {
    return { showMessage };
  }, [showMessage]);

  return (
    <SnackBarContext.Provider value={contextValue}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackBarContext.Provider>
  );
}

export const useSnackBar = () => {
  const context = useContext(SnackBarContext);
  if (context === undefined) {
    throw new Error('useSnackBar must be used within a SnackBarProvider');
  }
  return context;
};
