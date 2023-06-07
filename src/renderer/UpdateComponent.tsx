/* eslint no-console: off, no-alert: off, consistent-return: off, no-useless-return: off */
import { useEffect, useState } from 'react';
import { CardActions, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ModUpdate } from 'main/sentient-sims/updater';
import { Auth } from 'aws-amplify';
import { isNewVersionAvailable } from './versions';
import AppCard from './AppCard';

const getCurrentTime = (): string => {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const meridiem = hours >= 12 ? 'pm' : 'am';

  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${meridiem}`;
};

export default function UpdateComponent() {
  const [updateState, setUpdateState] = useState({
    newVersionAvailable: false,
    lastChecked: 'N/A',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckForUpdates = async () => {
    setIsLoading(true);

    try {
      const modVersionResponse = await fetch(
        'http://localhost:25148/versions/mod'
      );
      const modVersion = await modVersionResponse.json();
      console.log(modVersion);
      const response = await isNewVersionAvailable(modVersion.version);
      const currentTime = getCurrentTime();

      setUpdateState({
        newVersionAvailable: response,
        lastChecked: currentTime,
      });
    } catch (err) {
      console.error('Error checking for updates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCheckForUpdates();
  }, []);

  const handleUpdate = async (): Promise<void> => {
    await handleCheckForUpdates();
    const modUpdate: ModUpdate = {
      type: 'main',
      credentials: await Auth.currentCredentials(),
    };
    if (updateState.newVersionAvailable) {
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
                onClick={handleUpdate}
                loading={isLoading}
                color="success"
                variant="contained"
              >
                Update{' '}
                <CheckCircleIcon sx={{ marginLeft: 2, color: 'white' }} />
              </LoadingButton>
            )}
          </div>
          <div />
        </CardActions>
      }
    >
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
    </AppCard>
  );
}
