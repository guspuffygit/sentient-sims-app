import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { appApiUrl } from 'main/sentient-sims/constants';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { BasicInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { Animation } from 'main/sentient-sims/models/Animation';
import log from 'electron-log';
import { useMemo, useState } from 'react';
import { useDebounce } from 'renderer/hooks/useDebounce';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useSnackBar } from 'renderer/providers/SnackBarProvider';
import AppCard from 'renderer/AppCard';
import { EmptyState } from './EmptyState';

type MappingType = 'interactions' | 'animations';

type GenericMapping = {
  key: string;
  action: string;
  fullObject: BasicInteraction | Animation;
};

const ITEMS_PER_PAGE = 50;

function MappingItem({
  mapping,
  mappingType,
  canSaveOnline,
  onDeleted,
}: {
  mapping: GenericMapping;
  mappingType: MappingType;
  canSaveOnline: boolean;
  onDeleted: (key: string) => void;
}) {
  const animation = mappingType === 'animations' ? (mapping.fullObject as Animation) : undefined;
  const interaction = mappingType === 'interactions' ? (mapping.fullObject as BasicInteraction) : undefined;

  const [action, setAction] = useState(mapping.action);
  const [savedAction, setSavedAction] = useState(mapping.action);
  const [ignored, setIgnored] = useState(interaction?.ignored ?? false);
  const [savedIgnored, setSavedIgnored] = useState(interaction?.ignored ?? false);
  const [savingLocally, setSavingLocally] = useState(false);
  const [savingOnline, setSavingOnline] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { showMessage } = useSnackBar();

  const edited = action !== savedAction || ignored !== savedIgnored;
  const saving = savingLocally || savingOnline || deleting;

  const handleSaveLocally = async () => {
    setSavingLocally(true);
    const url = `${appApiUrl}/${mappingType}/save-locally`;
    const body = interaction
      ? { ...interaction, action, ignored }
      : { ...(mapping.fullObject as Animation), act: action };

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      setSavedAction(action);
      setSavedIgnored(ignored);
      showMessage(`Saved locally: ${mapping.key}`, 'success');
      log.info(`[MappingBrowser] Saved local mapping: ${mapping.key}`);
    } catch (err) {
      showMessage(`Failed to save locally: ${mapping.key}`, 'error');
      log.error(`[MappingBrowser] Error saving local mapping: ${mapping.key}`, err);
    }
    setSavingLocally(false);
  };

  const handleSaveOnline = async () => {
    setSavingOnline(true);
    const body = interaction
      ? { ...interaction, action, ignored }
      : { ...(mapping.fullObject as Animation), act: action };

    try {
      const response = await fetch(`${appApiUrl}/${mappingType}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      setSavedAction(action);
      setSavedIgnored(ignored);
      showMessage(`Saved online: ${mapping.key}`, 'success');
      log.info(`[MappingBrowser] Saved online mapping: ${mapping.key}`);
    } catch (err) {
      showMessage(`Failed to save online: ${mapping.key}`, 'error');
      log.error(`[MappingBrowser] Error saving online mapping: ${mapping.key}`, err);
    }
    setSavingOnline(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${appApiUrl}/${mappingType}`, {
        method: 'DELETE',
        body: JSON.stringify(mapping.fullObject),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      showMessage(`Deleted online: ${mapping.key}`, 'success');
      log.info(`[MappingBrowser] Deleted online mapping: ${mapping.key}`);
      onDeleted(mapping.key);
    } catch (err) {
      showMessage(`Failed to delete: ${mapping.key}`, 'error');
      log.error(`[MappingBrowser] Error deleting online mapping: ${mapping.key}`, err);
    }
    setDeleting(false);
    setConfirmingDelete(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography
          variant="subtitle2"
          sx={{ fontFamily: "'Courier New', Courier, monospace", wordBreak: 'break-all' }}
        >
          {mapping.key}
        </Typography>
        {animation?.name && <Chip label={animation.name} size="small" variant="outlined" />}
        {animation?.author && <Chip label={animation.author} size="small" variant="outlined" color="primary" />}
        {interaction?.sub && <Chip label={interaction.sub} size="small" variant="outlined" color="primary" />}
        {ignored && <Chip label="Ignored" size="small" variant="outlined" color="default" />}
        {edited && <Chip label="Unsaved changes" size="small" color="warning" />}
      </Stack>
      <TextField
        fullWidth
        multiline
        variant="outlined"
        size="small"
        value={action}
        disabled={ignored}
        onChange={(e) => {
          setAction(e.target.value);
        }}
        sx={{ mb: 1.5 }}
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          loading={savingLocally}
          disabled={saving}
          variant="contained"
          size="small"
          startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => {
            void handleSaveLocally();
          }}
        >
          Save Locally
        </Button>
        {canSaveOnline && (
          <Tooltip title="Overwrites the shared online mapping for everyone" placement="top">
            <span>
              <Button
                loading={savingOnline}
                disabled={saving}
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  void handleSaveOnline();
                }}
              >
                Save Online
              </Button>
            </span>
          </Tooltip>
        )}
        {canSaveOnline && (
          <Tooltip title="Deletes the shared online mapping for everyone" placement="top">
            <span>
              <Button
                loading={deleting}
                disabled={saving}
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setConfirmingDelete(true);
                }}
              >
                Delete Online
              </Button>
            </span>
          </Tooltip>
        )}
        {interaction && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Ignored interactions are skipped — no AI description is generated for them" placement="top">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={ignored}
                    onChange={(e) => {
                      setIgnored(e.target.checked);
                    }}
                  />
                }
                label="Ignored"
                slotProps={{ typography: { variant: 'body2' } }}
              />
            </Tooltip>
          </>
        )}
      </Stack>
      <Dialog
        open={confirmingDelete}
        onClose={() => {
          setConfirmingDelete(false);
        }}
      >
        <DialogTitle>Delete online mapping?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: "'Courier New', Courier, monospace", wordBreak: 'break-all' }}>
            {mapping.key}
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            This permanently deletes the shared online mapping for everyone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            disabled={deleting}
            onClick={() => {
              setConfirmingDelete(false);
            }}
          >
            Cancel
          </Button>
          <Button
            loading={deleting}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              void handleDelete();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default function OnlineMappingBrowser() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);
  const [mappings, setMappings] = useState<GenericMapping[]>([]);
  const [mappingType, setMappingType] = useState<MappingType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { userAttributes } = useAuth();
  const { showMessage } = useSnackBar();

  const isMapper = new PatreonUser(userAttributes).isMapper();

  const loadMappings = async (type: MappingType) => {
    setLoading(true);
    setMappingType(type);
    setMappings([]);
    setCurrentPage(1);
    try {
      const response = await fetch(`${appApiUrl}/${type}/online-all`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = (await response.json()) as Record<string, BasicInteraction | Animation>;

      const mappingList: GenericMapping[] = Object.entries(data).map(([key, value]) => {
        const action = type === 'interactions' ? (value as BasicInteraction).action : (value as Animation).act;

        return {
          key,
          action: action || '',
          fullObject: value,
        };
      });

      setMappings(mappingList);
    } catch (err) {
      showMessage(`Failed to load online ${type}`, 'error');
      log.error(`[MappingBrowser] Mappings could not be loaded:`, err);
    }
    setLoading(false);
  };

  const filteredMappings = useMemo(() => {
    if (!debouncedFilter) return mappings;
    const search = debouncedFilter.toLowerCase();
    return mappings.filter((m) => {
      const fields = [m.key, m.fullObject.name, m.action];
      if ('author' in m.fullObject) {
        fields.push(m.fullObject.author);
      }
      if (m.fullObject.sub) {
        fields.push(m.fullObject.sub);
      }
      return fields.some((field) => field.toLowerCase().includes(search));
    });
  }, [mappings, debouncedFilter]);

  const pageCount = Math.ceil(filteredMappings.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(pageCount, 1));

  const paginatedMappings = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredMappings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMappings, page]);

  const pagination = pageCount > 1 && (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_event, value) => {
          setCurrentPage(value);
        }}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );

  let content;
  if (loading) {
    content = (
      <Card sx={{ marginBottom: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingY: 8 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading online {mappingType}...</Typography>
        </Box>
      </Card>
    );
  } else if (!mappingType) {
    content = (
      <EmptyState
        icon={<TravelExploreOutlinedIcon />}
        title="Nothing loaded yet"
        description="Load online interactions or animations to browse and edit their mappings."
      />
    );
  } else if (filteredMappings.length === 0) {
    content = (
      <EmptyState
        icon={<SearchIcon />}
        title={mappings.length === 0 ? 'No mappings found' : 'No matches'}
        description={mappings.length === 0 ? `No online ${mappingType} found.` : 'No mappings match your filter.'}
      />
    );
  } else {
    const rangeStart = (page - 1) * ITEMS_PER_PAGE + 1;
    const rangeEnd = Math.min(page * ITEMS_PER_PAGE, filteredMappings.length);
    const filteredSuffix = debouncedFilter ? ` (filtered from ${mappings.length})` : '';
    content = (
      <AppCard
        title={mappingType === 'interactions' ? 'Online interactions' : 'Online animations'}
        subtitle={`Showing ${rangeStart}–${rangeEnd} of ${filteredMappings.length} ${mappingType}${filteredSuffix}`}
        icon={<CloudDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
      >
        <Stack spacing={2}>
          {pagination}
          {paginatedMappings.map((mapping) => (
            <MappingItem
              key={mapping.key}
              mapping={mapping}
              mappingType={mappingType}
              canSaveOnline={isMapper}
              onDeleted={(key) => {
                setMappings((prev) => prev.filter((m) => m.key !== key));
              }}
            />
          ))}
          {pagination}
        </Stack>
      </AppCard>
    );
  }

  return (
    <>
      <AppCard
        title="Browse mappings"
        subtitle="Load a mapping type from the cloud, then filter the results"
        icon={<TravelExploreOutlinedIcon sx={{ fontSize: 18 }} />}
        headerAction={
          <Box sx={{ width: { xs: 200, md: 300 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter by name, author, or text..."
              variant="outlined"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: filter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear filter"
                        onClick={() => {
                          setFilter('');
                          setCurrentPage(1);
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        }
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant={mappingType === 'interactions' ? 'contained' : 'outlined'}
            color={mappingType === 'interactions' ? 'primary' : 'secondary'}
            startIcon={<CloudDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              void loadMappings('interactions');
            }}
            disabled={loading}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Load Online Interactions
          </Button>
          <Button
            variant={mappingType === 'animations' ? 'contained' : 'outlined'}
            color={mappingType === 'animations' ? 'primary' : 'secondary'}
            startIcon={<CloudDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              void loadMappings('animations');
            }}
            disabled={loading}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Load Online Animations
          </Button>
        </Stack>
      </AppCard>

      {content}
    </>
  );
}
