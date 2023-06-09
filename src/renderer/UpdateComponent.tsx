/* eslint no-alert: off, consistent-return: off, no-useless-return: off */
import { useState } from 'react';
import { CardActions, Typography, Select, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ModUpdate } from 'main/sentient-sims/updater';
import { Auth } from 'aws-amplify';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import AppCard from './AppCard';
import useNewVersionChecker from './hooks/useNewVersionChecker';
import useSetting, { SettingsHook } from './hooks/useSetting';

export default function UpdateComponent() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const releaseType: SettingsHook = useSetting('modRelease', 'main');
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
      return fetch('http://localhost:25148/update/mod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modUpdate),
      })
        .then(() => {
          return handleCheckForUpdates();
        })
        .catch((err) => {
          alert(`Error installing update: ${JSON.stringify(err, null, 2)}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return;
  };

  const handleChangeReleaseType = async (
    event: SelectChangeEvent
  ): Promise<void> => {
    const newType = event.target.value;
    releaseType.setSetting(newType);
  };

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
              Check Updates
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

          {releaseType.value !== 'main' ? (
            <Typography sx={{ marginTop: 2 }}>
              Warning: Only use the Nightly release if you are working with the
              dev team to test a fix
            </Typography>
          ) : null}
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
            <MenuItem value="develop">Nightly</MenuItem>
          </Select>
        </div>
      </div>
    </AppCard>
  );
}
