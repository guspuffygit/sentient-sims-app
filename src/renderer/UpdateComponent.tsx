/* eslint no-alert: off, consistent-return: off, no-useless-return: off */
import { useState } from 'react';
import { Box, CardActions, IconButton, Tooltip, Typography } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import { LoadingButton } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ModUpdate } from 'main/sentient-sims/services/UpdateService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { UpdateClient } from 'main/sentient-sims/clients/UpdateClient';
import AppCard from './AppCard';
import useNewVersionChecker from './hooks/useNewVersionChecker';
import useSetting, { SettingsHook } from './hooks/useSetting';
import { useVersions } from './providers/VersionsProvider';
import { ReleaseTypeSelector } from './components/ReleaseTypeSelector';

const updateClient = new UpdateClient();

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
        return updateClient
          .updateMod(modUpdate)
          .then(() => {
            return handleCheckForUpdates();
          })
          .catch((err) => {
            alert(`Error installing update: ${JSON.stringify(err, null, 2)}`);
          })
          .finally(() => {
            setIsLoading(false);
            versions.refresh();
          });
      }
    }

    return;
  };

  let updateText = 'Update now';
  let headerText = <Typography color="text.secondary">Status: Up to date</Typography>;
  if (versions.mod.version === 'none') {
    updateText = 'Install';
    headerText = <Typography color="text.secondary">Ready to install</Typography>;
  } else if (updateState.newVersionAvailable) {
    headerText = <Typography variant="h6">New Version Ready</Typography>;
  }

  return (
    <AppCard
      cardActions={
        <CardActions sx={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <LoadingButton
              onClick={() => handleUpdate(false)}
              loading={isLoading}
              disabled={!updateState.newVersionAvailable}
              color="success"
              variant="contained"
            >
              {updateText}{' '}
              {updateState.newVersionAvailable && <CheckCircleIcon sx={{ marginLeft: 2, color: 'white' }} />}
            </LoadingButton>
          </div>
          <div>
            {versions.mod.version !== 'none' && (
              <Tooltip title="Force reinstalls the latest version of the mod">
                <LoadingButton
                  onClick={() => handleUpdate(true)}
                  loading={isLoading}
                  color="warning"
                  variant="outlined"
                >
                  Reinstall
                </LoadingButton>
              </Tooltip>
            )}
          </div>
        </CardActions>
      }
    >
      <div style={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
            <Typography variant="h6" sx={{ marginBottom: 0 }}>
              Mod Update
            </Typography>
            {versions.mod.version !== 'none' ? (
              <Tooltip title="Refresh">
                <IconButton
                  style={{
                    maxWidth: '30px',
                    maxHeight: '30px',
                    minWidth: '30px',
                    minHeight: '30px',
                  }}
                  sx={{ marginLeft: 1 }}
                  onClick={handleCheckForUpdates}
                  disabled={versions.loading || isLoading}
                >
                  <CachedIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
          {headerText}

          <Typography sx={{ fontSize: 14 }} color="text.secondary">
            Last Checked: {updateState.lastChecked}
          </Typography>
        </div>
        <div>
          <ReleaseTypeSelector />
        </div>
      </div>
    </AppCard>
  );
}
