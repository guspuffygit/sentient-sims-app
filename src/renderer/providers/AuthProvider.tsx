import { AuthEventData, AuthStatus } from '@aws-amplify/ui';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from '@aws-amplify/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import log from 'electron-log';
import { AuthUser } from 'aws-amplify/auth';

export type AuthUserAttributes = {
  subscriptionLevel?: string;
  founderStatus?: string;
  sub: string;
  emailVerified: boolean;
  patreonId?: string;
  email?: string;
};

interface AuthContextType {
  authStatus: AuthStatus;
  user?: AuthUser;
  userAttributes?: AuthUserAttributes;
  loading: boolean;
  signOut: (data?: AuthEventData | undefined) => void;
  refreshUserAttributes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, authStatus, signOut } = useAuthenticator();
  const [loading, setLoading] = useState<boolean>(false);
  const [userAttributes, setUserAttributes] = useState<AuthUserAttributes | undefined>();

  const refreshUserAttributes = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const attributes = await fetchUserAttributes();
        log.debug(`User attributes: ${JSON.stringify(attributes, null, 2)}`);
        setUserAttributes({
          email: attributes.email,
          subscriptionLevel: attributes?.['custom:subscription_level'],
          founderStatus: attributes?.['custom:founderstatus'],
          sub: attributes.sub ?? user.userId,
          emailVerified: attributes?.email_verified === 'true',
          patreonId: attributes.preferred_username,
        });
      } catch (error) {
        log.error('Failed to retrieve user attributes', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    refreshUserAttributes();
  }, [refreshUserAttributes]);

  useEffect(() => {
    const removeListener = window.electron.refreshUserAttributes(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_event: any) => {
        refreshUserAttributes();
      },
    );

    return () => {
      removeListener();
    };
  }, [refreshUserAttributes]);

  const contextValue: AuthContextType = useMemo(() => {
    log.debug(
      [
        'Current Auth:',
        `User: ${JSON.stringify(user)}`,
        `AuthStatus: ${authStatus}`,
        `UserAttributes: ${JSON.stringify(userAttributes)}`,
        `Loading: ${loading}`,
      ].join('\n'),
    );

    return {
      user,
      authStatus,
      signOut,
      loading,
      userAttributes: user && userAttributes,
      refreshUserAttributes,
    };
  }, [authStatus, loading, signOut, user, userAttributes, refreshUserAttributes]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
