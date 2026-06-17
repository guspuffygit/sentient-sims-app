import { Box, InputAdornment, TextField } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { useDebounceHook } from 'renderer/hooks/useDebounceHook';
import { EndAdornmentIconButton } from 'renderer/components/EndAdornmentIconButton';
import { EndAdornmentTooltip } from 'renderer/components/EndAdornmentTooltip';
import useSetting from '../hooks/useSetting';

type AIEndpointComponentProps = {
  type: ApiType;
  selectedApiType: ApiType;
  settingsEnum: SettingsEnum;

  onChange?: (value: string) => void;
};

export function AIEndpointComponent({ type, selectedApiType, settingsEnum, onChange }: AIEndpointComponentProps) {
  const aiEndpoint = useSetting(settingsEnum, '');

  const inputDebounce = useDebounceHook();

  if (type !== selectedApiType) {
    return <></>;
  }

  function handleChange(value: string) {
    void aiEndpoint.setSetting(value);

    if (onChange) {
      inputDebounce(() => {
        onChange(value);
      }, 600);
    }
  }

  async function reset() {
    await aiEndpoint.resetSetting();
    if (onChange) {
      inputDebounce(() => {
        onChange(aiEndpoint.value);
      }, 600);
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <TextField
          focused
          id="outlined-basic"
          label={`${ApiTypeName(type)} Endpoint`}
          variant="outlined"
          value={aiEndpoint.value}
          size="small"
          fullWidth
          onChange={(change) => {
            handleChange(change.target.value);
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <EndAdornmentTooltip title="Reset to Default">
                    <EndAdornmentIconButton
                      onClick={() => {
                        void reset();
                      }}
                    >
                      <RotateLeftIcon />
                    </EndAdornmentIconButton>
                  </EndAdornmentTooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </>
  );
}
