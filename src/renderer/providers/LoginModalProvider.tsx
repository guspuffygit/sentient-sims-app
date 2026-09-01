import { createContext, ReactNode, use, useCallback, useMemo, useState } from 'react';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from './AuthProvider';

interface LoginModalContextType {
  openLogin: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export function useLoginModal() {
  const context = use(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}

interface LoginModalProviderProps {
  children: ReactNode;
}

// One modal for every "sign in" entry point (menu bar, mod install card) so the
// Google auth listener inside LoginModal is registered exactly once.
export function LoginModalProvider({ children }: LoginModalProviderProps) {
  const { authStatus } = useAuth();
  const [open, setOpen] = useState(false);

  if (authStatus === 'authenticated' && open) {
    setOpen(false);
  }

  const openLogin = useCallback(() => {
    setOpen(true);
  }, []);

  const contextValue = useMemo(() => ({ openLogin }), [openLogin]);

  return (
    <LoginModalContext value={contextValue}>
      {children}
      <LoginModal open={open} setOpen={setOpen} />
    </LoginModalContext>
  );
}
