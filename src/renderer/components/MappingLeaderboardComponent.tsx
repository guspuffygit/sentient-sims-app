/* eslint-disable no-plusplus */
import {
  Box,
  IconButton,
  Modal,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import AppCard from 'renderer/AppCard';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import { useMappingLeaderboardStats } from 'renderer/hooks/useMappingLeaderboardStats';
import { LoadingButton } from '@mui/lab';
import { ChangeEvent, useState } from 'react';
import log from 'electron-log';
import { useAuthenticator } from '@aws-amplify/ui-react';
import SpaceBetweenDiv from './SpaceBetweenDiv';

type LeaderboardRowProperties = {
  isMe: boolean;
  name: string;
  count: number;
  index: number;
};

const HighlightedTypography = styled(Typography)({
  color: '#ff6363',
});

function LeaderboardRow({
  isMe,
  name,
  count,
  index,
}: LeaderboardRowProperties) {
  const what = `#${index + 1} ${name}`;

  return (
    <SpaceBetweenDiv>
      <div>
        {isMe ? (
          <HighlightedTypography>{what}</HighlightedTypography>
        ) : (
          <Typography>{what}</Typography>
        )}
      </div>
      <div>
        {isMe ? (
          <HighlightedTypography>{count}</HighlightedTypography>
        ) : (
          <Typography>{count}</Typography>
        )}
      </div>
    </SpaceBetweenDiv>
  );
}

export function MappingLeaderboardComponent() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { leaderboard, me, setDisplayName, deleteDisplayName } =
    useMappingLeaderboardStats();

  const { user } = useAuthenticator((context) => [context.user]);
  if (!user) {
    return null;
  }

  const rows = [];
  if (leaderboard.data) {
    for (let i = 0; i < leaderboard.data.length; i++) {
      const userAnimationInfo = leaderboard.data[i];

      const isMe = userAnimationInfo.displayName === me?.data?.displayName;

      if (i < 5 || isMe) {
        rows.push(
          <LeaderboardRow
            isMe={isMe}
            name={userAnimationInfo.displayName}
            count={userAnimationInfo.mappedCount}
            index={i}
          />
        );
      }
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setUsername(event.target.value);
  }

  const isLoading = me.isLoading || leaderboard.isLoading || loading;

  async function onClose() {
    setOpen(false);
    setUsername('');
    setLoading(false);
  }

  function handleOpen() {
    setUsername(me?.data?.displayName ?? 'Anonymous');
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      await setDisplayName(username);
    } catch (err: any) {
      log.error('Error changing username', err);
    }

    onClose();
  }

  if (leaderboard.error || leaderboard.isPending) {
    return null;
  }

  return (
    <Box>
      <AppCard>
        <SpaceBetweenDiv>
          <div>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ marginRight: 1 }}>
                {me?.data?.displayName ?? 'Anonymous'}
              </Typography>
              <IconButton size="small" onClick={() => handleOpen()}>
                <EditIcon />
              </IconButton>
              {me?.data?.displayName ? (
                <IconButton size="small" onClick={() => deleteDisplayName()}>
                  <ClearIcon />
                </IconButton>
              ) : null}
            </Box>
          </div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography>Mapping Leaderboard</Typography>
          </Box>
        </SpaceBetweenDiv>
        {rows}
      </AppCard>
      <Modal open={open} onClose={() => onClose()}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography sx={{ marginBottom: 2 }}>
            Set your display name if you want to show up on the leaderboard as
            something other than Anonymous
          </Typography>
          <TextField
            label="Display Username"
            value={username}
            onChange={(event) => handleInputChange(event)}
            fullWidth
            required
          />
          <SpaceBetweenDiv>
            <LoadingButton
              loading={isLoading}
              onClick={() => handleSubmit()}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Submit
            </LoadingButton>
            <LoadingButton
              loading={isLoading}
              sx={{ mt: 2 }}
              onClick={() => onClose()}
            >
              Cancel
            </LoadingButton>
          </SpaceBetweenDiv>
        </Box>
      </Modal>
    </Box>
  );
}
