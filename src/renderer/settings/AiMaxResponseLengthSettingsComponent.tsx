import { Alert, Box, Slider, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { useDebugMode } from 'renderer/providers/DebugModeProvider';

export function AiMaxResponseLengthSettingsComponent() {
  const debugMode = useDebugMode();
  const maxResponseTokens = useSetting<number>(SettingsEnum.MAX_RESPONSE_TOKENS, 90);

  if (!debugMode.isEnabled) {
    return <></>;
  }

  return (
    <>
      <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
        DEBUG: Only mess with this if you know what you are doing
      </Alert>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography>Max Response Tokens:</Typography>
        <Slider
          aria-label="Volume"
          value={maxResponseTokens.value}
          onChange={(change, value) => maxResponseTokens.setSetting(value as number)}
          step={1}
          min={30}
          max={600}
          marks={[
            { value: 30, label: '30' },
            { value: 90, label: '90' },
            { value: 180, label: '180' },
            { value: 270, label: '270' },
            { value: 360, label: '360' },
            { value: 450, label: '450' },
            { value: 600, label: '600' },
          ]}
        />
      </Box>
    </>
  );
}
