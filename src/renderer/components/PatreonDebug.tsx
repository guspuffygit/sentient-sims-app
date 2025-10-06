import { FormHelperText } from '@mui/material';
import { GetPatreonDebugText } from 'main/sentient-sims/util/patreonUtil';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';

export default function PatreonDebug() {
  const debugMode = useDebugMode();
  const { userAttributes } = useAuth();
  if (!userAttributes || !debugMode.isEnabled) {
    return null;
  }

  return (
    <>
      {GetPatreonDebugText(userAttributes).map((debugString) => (
        <FormHelperText key={debugString}>{debugString}</FormHelperText>
      ))}
    </>
  );
}
