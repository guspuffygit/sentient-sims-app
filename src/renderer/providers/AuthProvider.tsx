import { AuthEventData, AuthStatus } from '@aws-amplify/ui';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes } from '@aws-amplify/auth';
import { createContext, ReactNode, use, useCallback, useEffect, useMemo } from 'react';
import log from 'electron-log';
import { AuthUser } from 'aws-amplify/auth';
import { useQuery } from '@tanstack/react-query';

export type AuthUserAttributes = {
  subscriptionLevel?: string;
  founderStatus?: string;
  sub: string;
  emailVerified: boolean;
  patreonId?: string;
  email?: string;
  groups?: string[];
};

interface AuthContextType {
  authStatus: AuthStatus;
  user?: AuthUser;
  userAttributes?: AuthUserAttributes;
  loading: boolean;
  signOut: (data?: AuthEventData) => void;
  refreshUserAttributes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, authStatus, signOut } = useAuthenticator();

  const {
    data: userAttributes,
    isFetching,
    refetch,
  } = useQuery<AuthUserAttributes>({
    queryKey: ['userAttributes', authStatus === 'authenticated' ? user.userId : undefined],
    enabled: authStatus === 'authenticated',
    queryFn: async () => {
      const attributes = await fetchUserAttributes();
      log.debug(`User attributes: ${JSON.stringify(attributes, null, 2)}`);
      const session = await fetchAuthSession();
      const rawGroups = session.tokens?.accessToken.payload['cognito:groups'];
      const groups = Array.isArray(rawGroups) ? rawGroups.filter((group) => typeof group === 'string') : [];
      return {
        email: attributes.email,
        subscriptionLevel: attributes['custom:subscription_level'],
        founderStatus: attributes['custom:founderstatus'],
        sub: attributes.sub ?? user.userId,
        emailVerified: attributes.email_verified === 'true',
        patreonId: attributes.preferred_username,
        groups,
      };
    },
  });

  const refreshUserAttributes = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    const removeListener = window.electron.refreshUserAttributes(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_event: any) => {
        void refreshUserAttributes();
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
        `Loading: ${isFetching}`,
      ].join('\n'),
    );

    return {
      user,
      authStatus,
      signOut,
      loading: isFetching,
      userAttributes,
      refreshUserAttributes,
    };
  }, [authStatus, isFetching, signOut, user, userAttributes, refreshUserAttributes]);

  return <AuthContext value={contextValue}>{children}</AuthContext>;
}
