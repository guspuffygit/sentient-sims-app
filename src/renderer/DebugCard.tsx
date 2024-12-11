/* eslint-disable promise/catch-or-return */
/* eslint-disable react/destructuring-assignment */
import {
  Box,
  FormHelperText,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import { Version } from 'main/sentient-sims/services/VersionService';
import React from 'react';
import AppCard from './AppCard';
import SendLogButton from './SendLogButton';
import { AIStatusComponent } from './AIStatusComponent';
import { useAISettings } from './providers/AISettingsProvider';
import { useVersions } from './providers/VersionsProvider';

type VersionFormHelperProps = {
  text: string;
  version: Version;
};

function VersionFormHelper({ text, version }: VersionFormHelperProps) {
  if (version?.error) {
    const errors = version?.error.split('\n');
    const elements: React.JSX.Element[] = [];
    for (let i = 0; i < errors.length; i += 1) {
      if (i === 0) {
        elements.push(
          <FormHelperText error>
            {text}: {errors[i]}
          </FormHelperText>
        );
      } else {
        elements.push(<FormHelperText error>{errors[i]}</FormHelperText>);
      }
    }
    return elements;
  }

  return (
    <FormHelperText>
      {text}: {version.version}
    </FormHelperText>
  );
}

export default function DebugCard() {
  const versions = useVersions();
  const { aiStatus, testAI } = useAISettings();

  const onTest = () => {
    testAI();
    versions.refresh();
  };

  return (
    <AppCard>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
        <Typography>Debug Info</Typography>
        <Tooltip title="Test Again">
          <IconButton
            style={{
              maxWidth: '30px',
              maxHeight: '30px',
              minWidth: '30px',
              minHeight: '30px',
            }}
            sx={{ marginLeft: 1 }}
            onClick={() => onTest()}
            disabled={versions.loading || aiStatus.loading}
          >
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <VersionFormHelper text="App Version" version={versions.app} />
      <VersionFormHelper text="Mod Version" version={versions.mod} />
      <VersionFormHelper text="Game Version" version={versions.game} />
      <AIStatusComponent />
      <SendLogButton />
    </AppCard>
  );
}
