import { FormHelperText } from '@mui/material';
import { getMembershipDebugText } from 'main/sentient-sims/util/membershipDebug';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';
import { useMembership } from 'renderer/hooks/useMembership';

export default function PatreonDebug() {
  const debugMode = useDebugMode();
  const { userAttributes } = useAuth();
  const { info } = useMembership();
  if (!userAttributes || !debugMode.isEnabled) {
    return null;
  }

  return (
    <>
      {getMembershipDebugText(userAttributes, info).map((debugString) => (
        <FormHelperText key={debugString}>{debugString}</FormHelperText>
      ))}
    </>
  );
}
