/* eslint-disable react/jsx-no-useless-fragment */
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import useSetting from '../hooks/useSetting';

type AIEndpointComponentProps = {
  type: ApiType;
  selectedApiType: ApiType;
  settingsEnum: SettingsEnum;
  label: string;
};

export function AIEndpointComponent({
  type,
  selectedApiType,
  settingsEnum,
  label,
}: AIEndpointComponentProps) {
  const aiEndpoint = useSetting(settingsEnum);

  if (type !== selectedApiType) {
    return <></>;
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <TextField
          focused
          id="outlined-basic"
          label={label}
          variant="outlined"
          value={aiEndpoint.value}
          size="small"
          fullWidth
          onChange={(change) => aiEndpoint.setSetting(change.target.value)}
          sx={{ marginRight: 2 }}
        />
        <Tooltip title="Reset to Default">
          <IconButton onClick={() => aiEndpoint.resetSetting()}>
            <RotateLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
}
