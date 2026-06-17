import { Box, InputAdornment, TextField } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import { useModsDirectory } from './hooks/useModsDirectory';
import { EndAdornmentIconButton } from './components/EndAdornmentIconButton';
import { EndAdornmentTooltip } from './components/EndAdornmentTooltip';

export function ModsDirectoryComponent() {
  const modsDirectory = useModsDirectory();

  return (
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
        label="Mods Directory"
        variant="outlined"
        value={modsDirectory.value}
        size="small"
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <EndAdornmentTooltip title="Edit">
                  <EndAdornmentIconButton
                    onClick={() => {
                      void modsDirectory.openDirectoryPicker();
                    }}
                  >
                    <EditIcon />
                  </EndAdornmentIconButton>
                </EndAdornmentTooltip>
                <EndAdornmentTooltip title="Reset to Default">
                  <EndAdornmentIconButton
                    onClick={() => {
                      void modsDirectory.resetValue();
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
  );
}
