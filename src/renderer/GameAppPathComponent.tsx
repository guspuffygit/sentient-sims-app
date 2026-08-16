import { Box, InputAdornment, TextField } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import { useGameAppPath } from './hooks/useGameAppPath';
import { EndAdornmentIconButton } from './components/EndAdornmentIconButton';
import { EndAdornmentTooltip } from './components/EndAdornmentTooltip';

export function GameAppPathComponent() {
  const gameAppPath = useGameAppPath();

  // The game app path is only used for overlay re-signing on macOS
  if (!window.electron.isMac) {
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
      <TextField
        focused
        id="game-app-path"
        label="Game App Path"
        variant="outlined"
        value={gameAppPath.value}
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
                      void gameAppPath.openGameAppPicker();
                    }}
                  >
                    <EditIcon />
                  </EndAdornmentIconButton>
                </EndAdornmentTooltip>
                <EndAdornmentTooltip title="Reset to Default">
                  <EndAdornmentIconButton
                    onClick={() => {
                      void gameAppPath.resetValue();
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
