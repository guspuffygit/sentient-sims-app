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
  LinearProgress,
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
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { appApiUrl } from 'main/sentient-sims/constants';
import { PatreonUser } from 'main/sentient-sims/wrappers/PatreonUser';
import { BasicInteraction, BrowsableInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { Animation, BrowsableAnimation } from 'main/sentient-sims/models/Animation';
import { MappingSource, OnlineMappingType } from 'main/sentient-sims/models/MappingSource';
import type { SemanticSearchResponse } from 'main/sentient-sims/services/InteractionSemanticSearchService';
import { interactionDisplayName } from 'main/sentient-sims/util/interactionDisplayName';
import log from 'electron-log';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'renderer/hooks/useDebounce';
import { useAuth } from 'renderer/providers/AuthProvider';
import { useSnackBar } from 'renderer/providers/SnackBarProvider';
import AppCard from 'renderer/AppCard';
import { EmptyState } from './EmptyState';

type MappingType = OnlineMappingType;

type GenericMapping = {
  key: string;
  // Human-readable name derived from the tuning key (interactions only), shown
  // as the card title so mappings are findable by their in-game pie menu wording
  displayName?: string;
  action: string;
  source: MappingSource;
  fullObject: BasicInteraction | Animation;
};

const ITEMS_PER_PAGE = 50;

const SOURCE_LABELS: Record<MappingSource, string> = {
  'built-in': 'Built-in',
  'online': 'Online',
  'local': 'Local override',
};

const SOURCE_COLORS: Record<MappingSource, 'default' | 'info' | 'success'> = {
  'built-in': 'default',
  'online': 'info',
  'local': 'success',
};

function MappingItem({
  mapping,
  mappingType,
  canSaveOnline,
  onReloadNeeded,
}: {
  mapping: GenericMapping;
  mappingType: MappingType;
  canSaveOnline: boolean;
  onReloadNeeded: () => void;
}) {
  const animation = mappingType === 'animations' ? (mapping.fullObject as Animation) : undefined;
  const interaction = mappingType === 'interactions' ? (mapping.fullObject as BasicInteraction) : undefined;

  const [action, setAction] = useState(mapping.action);
  const [savedAction, setSavedAction] = useState(mapping.action);
  const [ignored, setIgnored] = useState(interaction?.ignored ?? false);
  const [savedIgnored, setSavedIgnored] = useState(interaction?.ignored ?? false);
  const [source, setSource] = useState(mapping.source);
  const [savingLocally, setSavingLocally] = useState(false);
  const [savingOnline, setSavingOnline] = useState(false);
  const [removingOverride, setRemovingOverride] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { showMessage } = useSnackBar();

  const edited = action !== savedAction || ignored !== savedIgnored;
  const saving = savingLocally || savingOnline || removingOverride || deleting;

  // A background sync can replace the mapping prop while this card is mounted. Adopt the
  // fresh values, but never clobber an unsaved draft — it stays, measured against the new
  // baseline. Render-time adjustment per react.dev "adjusting state when a prop changes".
  const [prevMapping, setPrevMapping] = useState(mapping);
  if (prevMapping !== mapping) {
    setPrevMapping(mapping);
    const hasUnsavedEdits = action !== savedAction || ignored !== savedIgnored;
    const nextIgnored = (mapping.fullObject as BasicInteraction).ignored ?? false;
    setSource(mapping.source);
    setSavedAction(mapping.action);
    setSavedIgnored(nextIgnored);
    if (!hasUnsavedEdits) {
      setAction(mapping.action);
      setIgnored(nextIgnored);
    }
  }

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
      setSource('local');
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

  const handleRemoveLocalOverride = async () => {
    setRemovingOverride(true);
    try {
      const response = await fetch(`${appApiUrl}/${mappingType}/local`, {
        method: 'DELETE',
        body: JSON.stringify(mapping.fullObject),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      showMessage(`Removed local override: ${mapping.key}`, 'success');
      log.info(`[MappingBrowser] Removed local override: ${mapping.key}`);
      onReloadNeeded();
    } catch (err) {
      showMessage(`Failed to remove local override: ${mapping.key}`, 'error');
      log.error(`[MappingBrowser] Error removing local override: ${mapping.key}`, err);
    }
    setRemovingOverride(false);
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
      onReloadNeeded();
    } catch (err) {
      showMessage(`Failed to delete: ${mapping.key}`, 'error');
      log.error(`[MappingBrowser] Error deleting online mapping: ${mapping.key}`, err);
    }
    setDeleting(false);
    setConfirmingDelete(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
      {mapping.displayName && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {mapping.displayName}
        </Typography>
      )}
      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography
          variant={mapping.displayName ? 'caption' : 'subtitle2'}
          color={mapping.displayName ? 'text.secondary' : 'text.primary'}
          sx={{ fontFamily: "'Courier New', Courier, monospace", wordBreak: 'break-all' }}
        >
          {mapping.key}
        </Typography>
        <Chip label={SOURCE_LABELS[source]} size="small" variant="outlined" color={SOURCE_COLORS[source]} />
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
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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
        {source === 'local' && (
          <Tooltip
            title="Removes your local override so the built-in or online description applies again"
            placement="top"
          >
            <span>
              <Button
                loading={removingOverride}
                disabled={saving}
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<RestoreOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  void handleRemoveLocalOverride();
                }}
              >
                Remove Local Override
              </Button>
            </span>
          </Tooltip>
        )}
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
        {canSaveOnline && source === 'online' && (
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

// Holds the keystroke state locally so typing only re-renders this small field,
// not the parent with its full page of MappingItem cards
function MappingFilterField({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 300);

  useEffect(() => {
    onFilterChange(debouncedText);
  }, [debouncedText, onFilterChange]);

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Filter by name, text, author, or source..."
      variant="outlined"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: text && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear filter"
                onClick={() => {
                  setText('');
                  onFilterChange('');
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default function OnlineMappingBrowser() {
  const [loading, setLoading] = useState(false);
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [mappings, setMappings] = useState<GenericMapping[]>([]);
  const [mappingType, setMappingType] = useState<MappingType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [semanticEnabled, setSemanticEnabled] = useState(false);
  // Results are keyed by the query that produced them so loading and staleness
  // are derived rather than tracked with extra setState calls in the effect.
  // names: null marks a failed search, falling back to plain text filtering
  const [semanticSearch, setSemanticSearch] = useState<{ query: string; names: string[] | null } | null>(null);
  const { userAttributes } = useAuth();
  const { showMessage } = useSnackBar();

  const isMapper = new PatreonUser(userAttributes).isMapper();

  const semanticActive = semanticEnabled && mappingType === 'interactions' && Boolean(debouncedFilter);
  const semanticLoading = semanticActive && semanticSearch?.query !== debouncedFilter;
  const semanticResults = semanticActive && semanticSearch?.query === debouncedFilter ? semanticSearch.names : null;

  const handleFilterChange = useCallback((filter: string) => {
    setDebouncedFilter(filter);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (!semanticActive) {
      return undefined;
    }

    const controller = new AbortController();
    const search = async () => {
      try {
        const response = await fetch(
          `${appApiUrl}/interactions/semantic-search?q=${encodeURIComponent(debouncedFilter)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as SemanticSearchResponse;
        if (!data.available) {
          showMessage('Semantic search needs an OpenAI API key, using text filtering instead', 'error');
          setSemanticEnabled(false);
        } else {
          setSemanticSearch({ query: debouncedFilter, names: data.results.map((result) => result.name) });
          setCurrentPage(1);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        showMessage('Semantic search failed, using text filtering instead', 'error');
        setSemanticSearch({ query: debouncedFilter, names: null });
        log.error('[MappingBrowser] Semantic search failed:', err);
      }
    };
    void search();
    return () => {
      controller.abort();
    };
  }, [semanticActive, debouncedFilter, showMessage]);

  const loadMappings = useCallback(
    async (type: MappingType, { quiet = false }: { quiet?: boolean } = {}) => {
      if (!quiet) {
        setLoading(true);
        setMappings([]);
        setCurrentPage(1);
      }
      setMappingType(type);
      try {
        const response = await fetch(`${appApiUrl}/${type}/all`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as Record<string, BrowsableInteraction | BrowsableAnimation>;

        const mappingList: GenericMapping[] = Object.entries(data).map(([key, value]) => {
          const { source, ...fullObject } = value;
          const action =
            type === 'interactions' ? (fullObject as BasicInteraction).action : (fullObject as Animation).act;

          return {
            key,
            displayName: type === 'interactions' ? interactionDisplayName(key) : undefined,
            action: action || '',
            source,
            fullObject,
          };
        });
        mappingList.sort((a, b) => a.key.localeCompare(b.key));

        setMappings(mappingList);
      } catch (err) {
        if (!quiet) {
          showMessage(`Failed to load ${type}`, 'error');
        }
        log.error(`[MappingBrowser] Mappings could not be loaded:`, err);
      }
      if (!quiet) {
        setLoading(false);
      }
    },
    [showMessage],
  );

  // When anyone (this window or another mapper, picked up by the background sync) changes
  // the online mappings, refresh the loaded list in place
  useEffect(() => {
    const removeListener = window.electron.onOnlineMappingsChanged((_event: any, changedType: MappingType) => {
      if (changedType === mappingType) {
        void loadMappings(changedType, { quiet: true });
      }
    });

    return () => {
      removeListener();
    };
  }, [mappingType, loadMappings]);

  const filteredMappings = useMemo(() => {
    if (!debouncedFilter) return mappings;

    // Semantic mode: order by similarity as returned from the search endpoint
    if (semanticResults) {
      const byKey = new Map(mappings.map((m) => [m.key, m]));
      return semanticResults.map((name) => byKey.get(name)).filter((m): m is GenericMapping => m !== undefined);
    }

    const search = debouncedFilter.toLowerCase();
    const matches = (field?: string) => !!field && field.toLowerCase().includes(search);

    // Matches on the interaction/animation name rank above matches that are
    // only in the description text or metadata, so the expected result is on top
    const nameMatches: GenericMapping[] = [];
    const textMatches: GenericMapping[] = [];
    mappings.forEach((m) => {
      if (matches(m.key) || matches(m.displayName) || matches(m.fullObject.name)) {
        nameMatches.push(m);
      } else if (
        matches(m.action) ||
        matches(m.source) ||
        matches(m.fullObject.sub) ||
        ('author' in m.fullObject && matches(m.fullObject.author))
      ) {
        textMatches.push(m);
      }
    });
    return [...nameMatches, ...textMatches];
  }, [mappings, debouncedFilter, semanticResults]);

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
          <Typography color="text.secondary">Loading {mappingType}...</Typography>
        </Box>
      </Card>
    );
  } else if (!mappingType) {
    content = (
      <EmptyState
        icon={<TravelExploreOutlinedIcon />}
        title="Nothing loaded yet"
        description="Load interactions or animations to browse and edit their descriptions."
      />
    );
  } else if (filteredMappings.length === 0) {
    content = (
      <EmptyState
        icon={<SearchIcon />}
        title={mappings.length === 0 ? 'No mappings found' : 'No matches'}
        description={mappings.length === 0 ? `No ${mappingType} found.` : 'No mappings match your filter.'}
      />
    );
  } else {
    const rangeStart = (page - 1) * ITEMS_PER_PAGE + 1;
    const rangeEnd = Math.min(page * ITEMS_PER_PAGE, filteredMappings.length);
    const filteredSuffix = debouncedFilter ? ` (filtered from ${mappings.length})` : '';
    content = (
      <AppCard
        title={mappingType === 'interactions' ? 'Interactions' : 'Animations'}
        subtitle={`Showing ${rangeStart}–${rangeEnd} of ${filteredMappings.length} ${mappingType}${filteredSuffix}`}
        icon={<CloudDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
      >
        <Stack spacing={2}>
          {pagination}
          {paginatedMappings.map((mapping) => (
            <MappingItem
              key={`${mapping.key}:${mapping.source}`}
              mapping={mapping}
              mappingType={mappingType}
              canSaveOnline={isMapper}
              onReloadNeeded={() => {
                void loadMappings(mappingType);
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
        subtitle="Built-in, online, and your local mappings — filter by name or description text"
        icon={<TravelExploreOutlinedIcon sx={{ fontSize: 18 }} />}
        headerAction={
          <Box sx={{ width: { xs: 200, md: 300 } }}>
            <MappingFilterField onFilterChange={handleFilterChange} />
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
            Load Interactions
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
            Load Animations
          </Button>
          {mappingType === 'interactions' && (
            <Tooltip
              title="Rank results by meaning instead of exact text. The first search builds an index and can take a minute."
              placement="top"
            >
              <FormControlLabel
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                control={
                  <Switch
                    size="small"
                    checked={semanticEnabled}
                    onChange={(e) => {
                      setSemanticEnabled(e.target.checked);
                    }}
                  />
                }
                label="Semantic search"
                slotProps={{ typography: { variant: 'body2' } }}
              />
            </Tooltip>
          )}
        </Stack>
        {semanticLoading && <LinearProgress sx={{ mt: 1.5 }} />}
      </AppCard>

      {content}
    </>
  );
}
