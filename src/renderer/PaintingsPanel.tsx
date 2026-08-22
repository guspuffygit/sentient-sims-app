import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { PaintingManifestDTO } from 'main/sentient-sims/db/dto/PaintingManifestDTO';
import AppCard from './AppCard';
import { EmptyState } from './components/EmptyState';

export default function PaintingsPanel() {
  const [manifest, setManifest] = useState<PaintingManifestDTO[]>([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestError, setManifestError] = useState<string | undefined>();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<string | undefined>();

  function loadManifest() {
    setManifestLoading(true);
    setManifestError(undefined);
    fetch(`${appApiUrl}/paintings`)
      .then((res) => res.json())
      .then((body: PaintingManifestDTO[] | { error: string }) => {
        if (!Array.isArray(body)) {
          throw new Error(body.error ?? 'Failed to load paintings');
        }
        const sorted = [...body].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
        setManifest(sorted);
      })
      .catch((err: unknown) => {
        log.error('Failed to load paintings manifest', err);
        setManifestError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setManifestLoading(false);
      });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadManifest();
  }, []);

  const selectedPainting = useMemo(
    () => manifest.find((p) => p.instance_id === selectedInstanceId),
    [manifest, selectedInstanceId],
  );

  return (
    <AppCard
      title="Paintings"
      subtitle={`${manifest.length} painting${manifest.length === 1 ? '' : 's'} on file`}
      icon={<ImageOutlinedIcon sx={{ fontSize: 18 }} />}
      headerAction={
        <IconButton
          size="small"
          onClick={() => {
            loadManifest();
          }}
          disabled={manifestLoading}
          aria-label="Refresh paintings"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      }
    >
      {manifestError ? (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {manifestError}
        </Alert>
      ) : null}
      <Box sx={{ display: 'flex', gap: 2, height: 650 }}>
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          {manifestLoading && manifest.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', paddingY: 4 }}>
              <CircularProgress size={24} disableShrink />
            </Box>
          ) : manifest.length === 0 ? (
            <EmptyState
              icon={<ImageOutlinedIcon />}
              title="No paintings yet"
              description="Have a Sim paint on an easel; the record shows up here."
            />
          ) : (
            <List dense disablePadding>
              {manifest.map((p) => (
                <ListItemButton
                  key={p.instance_id}
                  selected={p.instance_id === selectedInstanceId}
                  onClick={() => {
                    setSelectedInstanceId(p.instance_id);
                  }}
                >
                  <ListItemText
                    primary={p.prompt ? p.prompt.slice(0, 80) : '(no prompt)'}
                    secondary={p.created_at}
                    slotProps={{
                      primary: { sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                      secondary: { variant: 'caption' },
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedPainting ? (
            <PaintingEditor
              key={selectedPainting.instance_id}
              painting={selectedPainting}
              onGenerated={() => {
                loadManifest();
              }}
              onWarning={(msg) => {
                setSnackbar(msg);
              }}
            />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <EmptyState
                icon={<ImageOutlinedIcon />}
                title="Pick a painting"
                description="Select one from the list to view and edit its prompt."
              />
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2000}
        onClose={() => {
          setSnackbar(undefined);
        }}
        message={snackbar}
      />
    </AppCard>
  );
}

type PaintingEditorProps = {
  painting: PaintingManifestDTO;
  onGenerated: () => void;
  onWarning: (message: string) => void;
};

function PaintingEditor({ painting, onGenerated, onWarning }: PaintingEditorProps) {
  const initialPrompt = painting.prompt ?? '';
  const [promptDraft, setPromptDraft] = useState(initialPrompt);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState<string | undefined>();
  const [regenImageBase64, setRegenImageBase64] = useState<string | undefined>();

  function regenerate() {
    if (!promptDraft.trim()) {
      onWarning('Prompt is empty');
      return;
    }
    setRegenLoading(true);
    setRegenError(undefined);
    fetch(`${appApiUrl}/ai/v2/image/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptDraft, format: 'png' }),
    })
      .then(async (res) => {
        const body = (await res.json()) as { imageBase64?: string; error?: string };
        if (!res.ok || !body.imageBase64) {
          throw new Error(body.error ?? `Generation failed (HTTP ${res.status})`);
        }
        setRegenImageBase64(body.imageBase64);
        onGenerated();
      })
      .catch((err: unknown) => {
        log.error('Failed to regenerate painting', err);
        setRegenError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setRegenLoading(false);
      });
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, minHeight: 0 }}>
        <PaintingPreview
          title="Stored"
          imageSrc={`${appApiUrl}/paintings/${painting.instance_id}/png`}
        />
        <PaintingPreview
          title="Regenerated"
          imageSrc={regenImageBase64 ? `data:image/png;base64,${regenImageBase64}` : undefined}
          loading={regenLoading}
        />
      </Box>
      <Divider sx={{ marginBottom: 2 }} />
      <TextField
        label="Prompt"
        value={promptDraft}
        onChange={(e) => {
          setPromptDraft(e.target.value);
        }}
        multiline
        minRows={6}
        maxRows={14}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      {painting.metadata ? (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', marginBottom: 2, fontFamily: 'monospace' }}
        >
          metadata: {painting.metadata}
        </Typography>
      ) : null}
      {regenError ? (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {regenError}
        </Alert>
      ) : null}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            regenerate();
          }}
          disabled={regenLoading}
          endIcon={regenLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
        >
          {regenLoading ? 'Generating...' : 'Regenerate'}
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={() => {
            setPromptDraft(initialPrompt);
          }}
          disabled={promptDraft === initialPrompt}
        >
          Reset prompt
        </Button>
      </Box>
    </>
  );
}

function PaintingPreview({ title, imageSrc, loading }: { title: string; imageSrc?: string; loading?: boolean }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <CircularProgress size={28} disableShrink />
        ) : imageSrc ? (
          <img src={imageSrc} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            (no image)
          </Typography>
        )}
      </Box>
    </Box>
  );
}
