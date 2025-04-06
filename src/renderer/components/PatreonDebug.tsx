import { useAuthenticator } from '@aws-amplify/ui-react';
import { FormHelperText } from '@mui/material';
import { GetPatreonDebugText } from 'main/sentient-sims/util/patreonUtil';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';

export default function PatreonDebug() {
  const debugMode = useDebugMode();
  const { user } = useAuthenticator((context) => [context.user]);
  if (!user || !debugMode.isEnabled) {
    return null;
  }

  return (
    <>
      {GetPatreonDebugText(user).map((debugString) => (
        <FormHelperText>{debugString}</FormHelperText>
      ))}
    </>
  );
}
