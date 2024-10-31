import { FormHelperText } from '@mui/material';
import { useAISettings } from './providers/AISettingsProvider';

export function AIStatusComponent() {
  const { aiStatus, aiApiName } = useAISettings();

  return (
    <>
      {aiStatus.status ? (
        <FormHelperText>
          {aiApiName} Status: {aiStatus.status}
        </FormHelperText>
      ) : null}
      {aiStatus.error ? (
        <FormHelperText sx={{ m: 1 }} error>
          Error: {aiStatus.error}
        </FormHelperText>
      ) : null}
    </>
  );
}
