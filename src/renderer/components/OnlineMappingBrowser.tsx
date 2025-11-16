import { Box, Button, CircularProgress, List, TextField, Typography, Paper } from '@mui/material';
import { appApiUrl } from 'main/sentient-sims/constants';
import { BasicInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { Animation } from 'main/sentient-sims/models/Animation';
import log from 'electron-log';
import { useMemo, useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { useDebounce } from 'renderer/hooks/useDebounce';

type GenericMapping = {
  key: string;
  action: string;
  fullObject: BasicInteraction | Animation;
};

function MappingItem({
  mappingKey,
  mapping,
  mappingType,
}: {
  mappingKey: string;
  mapping: GenericMapping;
  mappingType: 'interactions' | 'animations';
}) {
  const [action, setAction] = useState(mapping.action);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    let url = '';
    let body: BasicInteraction | Animation;

    if (mappingType === 'interactions') {
      url = `${appApiUrl}/interactions/save-locally`;
      body = {
        ...(mapping.fullObject as BasicInteraction),
        action,
      };
    } else {
      url = `${appApiUrl}/animations/save-locally`;
      body = {
        ...(mapping.fullObject as Animation),
        act: action,
      };
    }

    try {
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      log.info(`[MappingBrowser] Lokales Mapping gespeichert: ${mappingKey}`);
    } catch (err) {
      log.error(`[MappingBrowser] Fehler beim Speichern: ${mappingKey}`, err);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {mappingKey}
      </Typography>
      <TextField
        fullWidth
        multiline
        variant="outlined"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        sx={{ mt: 1, mb: 1 }}
      />
      <LoadingButton loading={loading} variant="contained" size="small" onClick={handleSave}>
        Save Locally
      </LoadingButton>
    </Paper>
  );
}

export default function OnlineMappingBrowser() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);
  const [mappings, setMappings] = useState<GenericMapping[]>([]);
  const [mappingType, setMappingType] = useState<'interactions' | 'animations' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const loadMappings = async (type: 'interactions' | 'animations') => {
    setLoading(true);
    setMappingType(type);
    setMappings([]);
    try {
      const response = await fetch(`${appApiUrl}/${type}/online-all`);
      const data: Record<string, BasicInteraction | Animation> = await response.json();

      const mappingList: GenericMapping[] = Object.entries(data).map(([key, value]) => {
        const action = type === 'interactions' ? (value as BasicInteraction).action : (value as Animation).act;

        return {
          key: key,
          action: action || '',
          fullObject: value,
        };
      });

      setMappings(mappingList);
    } catch (err) {
      log.error(`[MappingBrowser] Mappings konnten nicht geladen werden:`, err);
    }
    setLoading(false);
  };

  const filteredMappings = useMemo(() => {
    if (!debouncedFilter) return mappings;
    return mappings.filter((m) => m.key.toLowerCase().includes(debouncedFilter.toLowerCase()));
  }, [mappings, debouncedFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilter]);

  const paginatedMappings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMappings.slice(startIndex, endIndex);
  }, [filteredMappings, currentPage, itemsPerPage]);

  const pageCount = Math.ceil(filteredMappings.length / itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Online Mapping Browser
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={() => loadMappings('interactions')} disabled={loading}>
            Load Online Interactions
          </Button>
          <Button variant="contained" onClick={() => loadMappings('animations')} disabled={loading}>
            Load Online Animations
          </Button>
        </Box>
        <TextField
          fullWidth
          label="Filter by name..."
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Paper>

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}

      {!loading && (
        <>
          <List>
            {paginatedMappings.map((mapping) => (
              <MappingItem key={mapping.key} mappingKey={mapping.key} mapping={mapping} mappingType={mappingType!} />
            ))}
          </List>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <Typography sx={{ margin: '0 16px' }}>
              Page {currentPage} of {pageCount}
            </Typography>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
