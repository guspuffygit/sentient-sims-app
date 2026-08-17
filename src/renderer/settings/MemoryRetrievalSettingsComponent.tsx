import { Box, FormControlLabel, Checkbox } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from '../hooks/useSetting';
import { useDebugMode } from '../providers/DebugModeProvider';

export default function MemoryRetrievalSettingsComponent() {
  const memoryRetrievalEnabled = useSetting(SettingsEnum.MEMORY_RETRIEVAL_ENABLED, false);
  const debugMode = useDebugMode();

  if (!debugMode.isEnabled) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 2,
      }}
    >
      <FormControlLabel
        label="Include Relevant Past Memories in Prompts"
        control={
          <Checkbox
            checked={memoryRetrievalEnabled.value}
            onChange={(change) => {
              void memoryRetrievalEnabled.setSetting(change.target.checked);
            }}
          />
        }
      />
    </Box>
  );
}
