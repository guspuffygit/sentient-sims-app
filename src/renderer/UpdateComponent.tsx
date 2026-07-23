/* eslint no-alert: off, consistent-return: off, no-useless-return: off */
import { useState } from 'react';
import { Box, CardActions, Chip, IconButton, Tooltip, Typography, Button } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ModUpdate } from 'main/sentient-sims/services/UpdateService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import AppCard from './AppCard';
import useNewVersionChecker from './hooks/useNewVersionChecker';
import useSetting, { SettingsHook } from './hooks/useSetting';
import { useVersions } from './providers/VersionsProvider';
import { ReleaseTypeSelector } from './components/ReleaseTypeSelector';
import { SentientSimsAppClient } from 'main/sentient-sims/clients/SentientSimsAppClient';

const client = new SentientSimsAppClient();

export default function UpdateComponent() {
  const versions = useVersions();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const releaseType: SettingsHook<string> = useSetting<string>(SettingsEnum.MOD_RELEASE, 'main');
  const { updateState, handleCheckForUpdates } = useNewVersionChecker({
    setIsLoading,
    releaseType: releaseType.value,
  });

  const handleUpdate = async (forceUpdate: boolean): Promise<void> => {
    await handleCheckForUpdates();

    const authSession = await fetchAuthSession();
    if (authSession.credentials) {
      const modUpdate: ModUpdate = {
        type: releaseType.value,
        credentials: authSession.credentials,
      };
      if (updateState.newVersionAvailable || forceUpdate) {
        setIsLoading(true);
        return client.update
          .updateMod(modUpdate)
          .then(() => {
            return handleCheckForUpdates();
          })
          .finally(() => {
            setIsLoading(false);
            void versions.refresh();
          });
      }
    }

    return;
  };

  let updateText = 'Update now';
  let statusChip = (
    <Chip
      size="small"
      variant="outlined"
      label="Up to date"
      sx={{ color: 'success.light', borderColor: (theme) => `${theme.palette.success.main}66` }}
    />
  );
  if (versions.mod.version === 'none') {
    updateText = 'Install';
    statusChip = (
      <Chip
        size="small"
        variant="outlined"
        label="Ready to install"
        sx={{ color: 'info.main', borderColor: (theme) => `${theme.palette.info.main}66` }}
      />
    );
  } else if (updateState.newVersionAvailable) {
    statusChip = (
      <Chip
        size="small"
        icon={<CheckCircleIcon />}
        label="New version ready"
        color="success"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <AppCard
      title="Mod Update"
      icon={<SystemUpdateAltIcon fontSize="small" />}
      headerAction={
        <>
          {versions.mod.version !== 'none' ? (
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  size="small"
                  onClick={() => {
                    void handleCheckForUpdates();
                  }}
                  disabled={versions.loading || isLoading}
                >
                  <CachedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
          <ReleaseTypeSelector />
        </>
      }
      cardActions={
        <CardActions sx={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button
              onClick={() => {
                void handleUpdate(false);
              }}
              loading={isLoading}
              disabled={!updateState.newVersionAvailable}
              color="success"
              variant="contained"
            >
              {updateText}
            </Button>
          </div>
          <div>
            {versions.mod.version !== 'none' && (
              <Tooltip title="Force reinstalls the latest version of the mod">
                <Button
                  onClick={() => {
                    void handleUpdate(true);
                  }}
                  loading={isLoading}
                  color="warning"
                  variant="outlined"
                >
                  Reinstall
                </Button>
              </Tooltip>
            )}
          </div>
        </CardActions>
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {statusChip}
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 13,
          }}
        >
          Last checked: {updateState.lastChecked}
        </Typography>
      </Box>
    </AppCard>
  );
}
