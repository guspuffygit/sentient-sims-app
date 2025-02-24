/* eslint no-alert: off, consistent-return: off, no-useless-return: off */
import { useState } from 'react';
import { CardActions, MenuItem, Select, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Auth } from 'aws-amplify';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { ModUpdate } from 'main/sentient-sims/services/UpdateService';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { useAuthenticator } from '@aws-amplify/ui-react';
import log from 'electron-log';
import { UpdateClient } from 'main/sentient-sims/clients/UpdateClient';
import { getNightlyAccess } from 'main/sentient-sims/util/nightlyAccess';
import AppCard from './AppCard';
import useNewVersionChecker from './hooks/useNewVersionChecker';
import useSetting, { SettingsHook } from './hooks/useSetting';
import PatreonUser from './wrappers/PatreonUser';
import { useVersions } from './providers/VersionsProvider';

const updateClient = new UpdateClient();

export default function UpdateComponent() {
  const versions = useVersions();
  const { user } = useAuthenticator((context) => [context.user]);
  const patreonUser = new PatreonUser(user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const releaseType: SettingsHook<string> = useSetting<string>(
    SettingsEnum.MOD_RELEASE,
    'main'
  );
  const { updateState, handleCheckForUpdates } = useNewVersionChecker({
    setIsLoading,
    releaseType: releaseType.value,
  });

  const handleUpdate = async (forceUpdate: boolean): Promise<void> => {
    await handleCheckForUpdates();
    const modUpdate: ModUpdate = {
      type: releaseType.value,
      credentials: await Auth.currentCredentials(),
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

    return;
  };

  const handleChangeReleaseType = async (
    event: SelectChangeEvent
  ): Promise<void> => {
    const newType = event.target.value;
    log.debug(`Changed release type to: ${newType}`);
    await releaseType.setSetting(newType);
  };

  const { disableNightly, nightlyText } = getNightlyAccess(patreonUser);

  return (
    <AppCard
      cardActions={
        <CardActions
          sx={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}
        >
          <div>
            <LoadingButton
              onClick={handleCheckForUpdates}
              loading={isLoading}
              color="primary"
              variant="outlined"
              sx={{ marginRight: 2 }}
            >
              Refresh
            </LoadingButton>
            {updateState.newVersionAvailable && (
              <LoadingButton
                onClick={() => handleUpdate(false)}
                loading={isLoading}
                color="success"
                variant="contained"
              >
                Update{' '}
                <CheckCircleIcon sx={{ marginLeft: 2, color: 'white' }} />
              </LoadingButton>
            )}
          </div>
          <div>
            <LoadingButton
              onClick={() => handleUpdate(true)}
              loading={isLoading}
              color="warning"
              variant="outlined"
            >
              Force Update
            </LoadingButton>
          </div>
        </CardActions>
      }
    >
      <div
        style={{ margin: 1, display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          {updateState.newVersionAvailable ? (
            <Typography variant="h6">New Version Ready</Typography>
          ) : (
            <Typography variant="h6" color="text.secondary">
              Everything is up to date
            </Typography>
          )}

          <Typography sx={{ fontSize: 14 }} color="text.secondary">
            Last Checked: {updateState.lastChecked}
          </Typography>
        </div>
        <div>
          <Select
            size="small"
            labelId="release-type-select-label"
            id="release-type-select"
            value={releaseType.value}
            sx={{ minWidth: 100 }}
            onChange={handleChangeReleaseType}
          >
            <MenuItem value="main">Stable</MenuItem>
            <MenuItem disabled={disableNightly} value="develop">
              {nightlyText}
            </MenuItem>
          </Select>
        </div>
      </div>
    </AppCard>
  );
}
