import { Box, CardActions, Chip, IconButton, Tooltip, Typography, Button } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import AppCard from './AppCard';
import { useVersions } from './providers/VersionsProvider';
import { useModUpdate } from './providers/ModUpdateProvider';
import { ReleaseTypeSelector } from './components/ReleaseTypeSelector';

export default function UpdateComponent() {
  const versions = useVersions();
  const { newVersionAvailable, lastChecked, busy, checkForUpdates, installUpdate } = useModUpdate();

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
  } else if (newVersionAvailable) {
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
                    void checkForUpdates();
                  }}
                  disabled={versions.loading || busy}
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
                void installUpdate();
              }}
              loading={busy}
              disabled={!newVersionAvailable}
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
                    void installUpdate();
                  }}
                  loading={busy}
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
          Last checked: {lastChecked}
        </Typography>
      </Box>
    </AppCard>
  );
}
