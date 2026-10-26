import { Box, Chip, Tooltip } from '@mui/material';
import { useWebsocket } from 'renderer/providers/WebsocketProvider';

// Whether the mod in the running game is talking to the app, with a glowing
// green dot while it is
export function ConnectionChip() {
  const { status } = useWebsocket();
  const connected = status.mod;

  return (
    <Tooltip
      title={
        connected
          ? 'The Sentient Sims mod in your game is connected to the app'
          : 'Open The Sims 4 and load a household to connect'
      }
    >
      <Chip
        size="small"
        variant="outlined"
        label={connected ? 'Game connected' : 'Game not connected'}
        icon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              marginLeft: 1,
              backgroundColor: connected ? 'success.main' : 'text.disabled',
              boxShadow: connected ? (theme) => `0 0 6px ${theme.palette.success.main}` : 'none',
            }}
          />
        }
        sx={{
          color: connected ? 'success.light' : 'text.secondary',
          borderColor: connected ? (theme) => `${theme.palette.success.main}66` : 'divider',
        }}
      />
    </Tooltip>
  );
}
