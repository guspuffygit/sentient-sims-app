import { Box, InputAdornment, TextField } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import { useModsDirectory } from './hooks/useModsDirectory';
import { EndAdornmentIconButton } from './components/EndAdornmentIconButton';
import { EndAdornmentTooltip } from './components/EndAdornmentTooltip';

export function ModsDirectoryComponent() {
  const modsDirectory = useModsDirectory();

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <TextField
        focused
        id="outlined-basic"
        label="Mods Directory"
        variant="outlined"
        value={modsDirectory.value}
        size="small"
        fullWidth
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <EndAdornmentTooltip title="Edit">
                <EndAdornmentIconButton onClick={() => modsDirectory.openDirectoryPicker()}>
                  <EditIcon />
                </EndAdornmentIconButton>
              </EndAdornmentTooltip>
              <EndAdornmentTooltip title="Reset to Default">
                <EndAdornmentIconButton onClick={() => modsDirectory.resetValue()}>
                  <RotateLeftIcon />
                </EndAdornmentIconButton>
              </EndAdornmentTooltip>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
