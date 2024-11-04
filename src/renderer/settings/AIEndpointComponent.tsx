/* eslint-disable react/jsx-no-useless-fragment */
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
  // eslint-disable-next-line react/require-default-props
  onChange?: (value: string) => void;
};

export function AIEndpointComponent({
  type,
  selectedApiType,
  settingsEnum,
  onChange,
}: AIEndpointComponentProps) {
  const aiEndpoint = useSetting(settingsEnum);

  const inputDebounce = useDebounceHook();

  if (type !== selectedApiType) {
    return <></>;
  }

  function handleChange(value: string) {
    aiEndpoint.setSetting(value);

    if (onChange) {
      inputDebounce(() => onChange(value), 600);
    }
  }

  async function reset() {
    await aiEndpoint.resetSetting();
    if (onChange) {
      inputDebounce(() => onChange(aiEndpoint.value), 600);
    }
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <TextField
          focused
          id="outlined-basic"
          label={`${ApiTypeName(type)} Endpoint`}
          variant="outlined"
          value={aiEndpoint.value}
          size="small"
          fullWidth
          onChange={(change) => handleChange(change.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <EndAdornmentTooltip title="Reset to Default">
                  <EndAdornmentIconButton onClick={() => reset()}>
                    <RotateLeftIcon />
                  </EndAdornmentIconButton>
                </EndAdornmentTooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
}
