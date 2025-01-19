import { useAuthenticator } from '@aws-amplify/ui-react';
import { FormHelperText } from '@mui/material';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';
import PatreonUser from 'renderer/wrappers/PatreonUser';

export default function PatreonDebug() {
  const debugMode = useDebugMode();
  const { user } = useAuthenticator((context) => [context.user]);
  if (!user || !debugMode.isEnabled) {
    return null;
  }

  const patreonUser = new PatreonUser(user);

  return (
    <>
      <FormHelperText>
        User: {user?.attributes?.email ?? 'Not found'}
      </FormHelperText>
      <FormHelperText>
        Is Patreon Linked: {patreonUser.isPatreonLinked() ? 'Yes' : 'No'}
      </FormHelperText>
      <FormHelperText>Patreon ID: {patreonUser.getPatreonId()}</FormHelperText>
      <FormHelperText>
        custom:subscription_level: {patreonUser.getSubscriptionLevel()}
      </FormHelperText>
      <FormHelperText>
        custom:founderstatus: {patreonUser.getFounderStatus()}
      </FormHelperText>
    </>
  );
}
