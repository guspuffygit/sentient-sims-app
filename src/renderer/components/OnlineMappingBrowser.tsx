import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { appApiUrl } from 'main/sentient-sims/constants';
import { BasicInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { Animation } from 'main/sentient-sims/models/Animation';
import log from 'electron-log';
import { useMemo, useState } from 'react';
import { useDebounce } from 'renderer/hooks/useDebounce';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useSnackBar } from 'renderer/providers/SnackBarProvider';

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
}: {
  mapping: GenericMapping;
  mappingType: MappingType;
  canSaveOnline: boolean;
}) {
  const animation = mappingType === 'animations' ? (mapping.fullObject as Animation) : undefined;
  const interaction = mappingType === 'interactions' ? (mapping.fullObject as BasicInteraction) : undefined;

  const [action, setAction] = useState(mapping.action);
  const [savedAction, setSavedAction] = useState(mapping.action);
  const [ignored, setIgnored] = useState(interaction?.ignored ?? false);
  const [savedIgnored, setSavedIgnored] = useState(interaction?.ignored ?? false);
  const [savingLocally, setSavingLocally] = useState(false);
  const [savingOnline, setSavingOnline] = useState(false);
  const { showMessage } = useSnackBar();

  const edited = action !== savedAction || ignored !== savedIgnored;
  const saving = savingLocally || savingOnline;

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

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
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
          startIcon={<SaveIcon />}
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
                startIcon={<CloudUploadIcon />}
                onClick={() => {
                  void handleSaveOnline();
                }}
              >
                Save Online
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

  const isDev = userAttributes?.founderStatus === 'dev';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading online {mappingType}...</Typography>
      </Box>
    );
  } else if (!mappingType) {
    content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 8 }}>
        <TravelExploreIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography color="text.secondary">
          Load online interactions or animations to browse and edit their mappings.
        </Typography>
      </Box>
    );
  } else if (filteredMappings.length === 0) {
    content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 8 }}>
        <SearchIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography color="text.secondary">
          {mappings.length === 0 ? `No online ${mappingType} found.` : 'No mappings match your filter.'}
        </Typography>
      </Box>
    );
  } else {
    content = (
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredMappings.length)} of{' '}
            {filteredMappings.length} {mappingType}
            {debouncedFilter && ` (filtered from ${mappings.length})`}
          </Typography>
          {pagination}
        </Stack>
        {paginatedMappings.map((mapping) => (
          <MappingItem key={mapping.key} mapping={mapping} mappingType={mappingType} canSaveOnline={isDev} />
        ))}
        {pagination}
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Online Mapping Browser</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Browse the shared online mappings and save your own local overrides.
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant={mappingType === 'interactions' ? 'contained' : 'outlined'}
            startIcon={<CloudDownloadIcon />}
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
            startIcon={<CloudDownloadIcon />}
            onClick={() => {
              void loadMappings('animations');
            }}
            disabled={loading}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Load Online Animations
          </Button>
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
        </Stack>
      </Paper>

      {content}
    </Box>
  );
}
