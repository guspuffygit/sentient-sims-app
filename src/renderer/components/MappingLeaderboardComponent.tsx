import { Box, IconButton, Modal, TextField, Tooltip, Typography, Button } from '@mui/material';
import AppCard from 'renderer/AppCard';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { useMappingLeaderboardStats } from 'renderer/hooks/useMappingLeaderboardStats';
import { ChangeEvent, useState } from 'react';
import log from 'electron-log';
import { useAuth } from '../providers/AuthProvider';
import SpaceBetweenDiv from './SpaceBetweenDiv';

type LeaderboardRowProperties = {
  isMe: boolean;
  name: string;
  count: number;
  index: number;
};

function LeaderboardRow({ isMe, name, count, index }: LeaderboardRowProperties) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingX: 1.25,
        paddingY: 0.5,
        borderRadius: 2,
        backgroundColor: isMe ? (theme) => `${theme.palette.primary.main}1f` : 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            width: 24,
            flexShrink: 0,
            fontWeight: 700,
            color: index < 3 ? 'warning.main' : 'text.disabled',
          }}
        >
          #{index + 1}
        </Typography>
        <Typography
          noWrap
          sx={{
            fontWeight: isMe ? 600 : 400,
            color: isMe ? 'primary.light' : 'text.primary',
          }}
        >
          {name}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 600, color: isMe ? 'primary.light' : 'text.secondary' }}>{count}</Typography>
    </Box>
  );
}

export function MappingLeaderboardComponent() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { leaderboard, me, setDisplayName, deleteDisplayName } = useMappingLeaderboardStats();

  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const rows = [];
  if (leaderboard.data) {
    for (let i = 0; i < leaderboard.data.length; i++) {
      const userAnimationInfo = leaderboard.data[i];

      const isMe = userAnimationInfo.displayName === me.data?.displayName;

      if (i < 5 || isMe) {
        rows.push(
          <LeaderboardRow
            isMe={isMe}
            name={userAnimationInfo.displayName}
            count={userAnimationInfo.mappedCount}
            index={i}
            key={userAnimationInfo.displayName}
          />,
        );
      }
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setUsername(event.target.value);
  }

  const isLoading = me.isLoading || leaderboard.isLoading || loading;

  function onClose() {
    setOpen(false);
    setUsername('');
    setLoading(false);
  }

  function handleOpen() {
    setUsername(me.data?.displayName ?? 'Anonymous');
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      await setDisplayName(username);
    } catch (err) {
      log.error('Error changing username', err);
    }

    onClose();
  }

  if (leaderboard.error || leaderboard.isPending) {
    return null;
  }

  return (
    <Box>
      <AppCard
        title="Mapping Leaderboard"
        icon={<LeaderboardIcon fontSize="small" />}
        headerAction={
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginRight: 0.5 }}>
              {me.data?.displayName ?? 'Anonymous'}
            </Typography>
            <Tooltip title="Edit your username on the leaderboard" placement="top">
              <IconButton
                size="small"
                onClick={() => {
                  handleOpen();
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {me.data?.displayName && (
              <Tooltip title="Delete your username on the leaderboard" placement="top">
                <IconButton
                  size="small"
                  onClick={() => {
                    void deleteDisplayName();
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </>
        }
      >
        {rows}
      </AppCard>
      <Modal
        open={open}
        onClose={() => {
          onClose();
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3.5,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography sx={{ marginBottom: 2 }}>
            Set your display name if you want to show up on the leaderboard as something other than Anonymous
          </Typography>
          <TextField
            label="Display Username"
            value={username}
            onChange={(event) => {
              handleInputChange(event);
            }}
            fullWidth
            required
          />
          <SpaceBetweenDiv>
            <Button
              loading={isLoading}
              onClick={() => {
                void handleSubmit();
              }}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
            <Button
              loading={isLoading}
              sx={{ mt: 2 }}
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
          </SpaceBetweenDiv>
        </Box>
      </Modal>
    </Box>
  );
}
