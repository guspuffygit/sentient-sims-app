import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  MenuItem,
  Radio,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue, ApiTypeName, imageGenerationApiTypes } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import { defaultImageModelFor, imageModelSuggestions } from 'main/sentient-sims/models/ImageGeneration';
import { appApiUrl } from 'main/sentient-sims/constants';
import { AIHealthCheckResponse, AITestStatus } from 'main/sentient-sims/models/AIHealthCheckResponse';
import useSetting from '../hooks/useSetting';
import { useProviderConnectionStatus } from '../hooks/useProviderConnectionStatus';
import { ProviderConnectionPanel } from './ProviderConnectionPanel';
import { ConnectionStatusChip } from './ProviderConnectionSettingsComponent';

type ImageProviderConfigDialogProps = {
  initial?: AIProviderConfig;
  onCancel: () => void;
  onSave: (config: AIProviderConfig) => void;
};

// Only mounted while open so state initializes from the config being edited
function ImageProviderConfigDialog({ initial, onCancel, onSave }: ImageProviderConfigDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [apiType, setApiType] = useState<ApiType>(initial?.apiType ?? ApiType.OpenAI);
  const [model, setModel] = useState(() =>
    initial ? (initial.model ?? '') : (defaultImageModelFor(ApiType.OpenAI) ?? ''),
  );
  const [testResult, setTestResult] = useState<AITestStatus | undefined>();

  const connection = useProviderConnectionStatus(apiType);

  const missingModel = model.trim() === '';

  const handleProviderChange = (value: unknown) => {
    const type = ApiTypeFromValue(value);
    setApiType(type);
    setModel(defaultImageModelFor(type) ?? '');
    setTestResult(undefined);
  };

  const testConnection = async () => {
    setTestResult({ status: '', error: '', loading: true });

    let status = '';
    let error: string;
    try {
      // Tests the shared provider connection; there is no image-specific check
      const query = new URLSearchParams({ apiType });
      const response = await fetch(`${appApiUrl}/debug/test-ai?${query.toString()}`);
      const result = (await response.json()) as AIHealthCheckResponse;
      status = result.status || '';
      error = result.error || '';
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    setTestResult({ status, error, loading: false });
  };

  const handleSave = () => {
    const trimmedModel = model.trim();
    const fallbackName = trimmedModel ? `${ApiTypeName(apiType)} (${trimmedModel})` : ApiTypeName(apiType);
    const config: AIProviderConfig = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim() || fallbackName,
      apiType,
    };
    if (trimmedModel) {
      config.model = trimmedModel;
    }
    onSave(config);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit Image Provider Configuration' : 'Add Image Provider Configuration'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          onChange={(change) => {
            setName(change.target.value);
          }}
          fullWidth
          size="small"
          sx={{ marginTop: 1, marginBottom: 2 }}
          placeholder={ApiTypeName(apiType)}
        />
        <Select
          size="small"
          value={apiType}
          fullWidth
          sx={{ marginBottom: 2 }}
          onChange={(change) => {
            handleProviderChange(change.target.value);
          }}
        >
          {imageGenerationApiTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {ApiTypeName(type)}
            </MenuItem>
          ))}
        </Select>
        {/* Keyed and uncontrolled: each provider starts expanded only when its
            connection still needs setup, and entering a key never yanks the
            section closed mid-typing */}
        <Accordion
          key={apiType}
          disableGutters
          defaultExpanded={!connection.loading && !connection.ready}
          sx={{ marginBottom: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ marginRight: 2 }}>{ApiTypeName(apiType)} Connection</Typography>
              <ConnectionStatusChip apiType={apiType} />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormHelperText sx={{ marginBottom: 2 }}>
              Shared with every configuration that uses {ApiTypeName(apiType)}.
            </FormHelperText>
            <ProviderConnectionPanel apiType={apiType} />
          </AccordionDetails>
        </Accordion>
        <Autocomplete
          freeSolo
          fullWidth
          size="small"
          options={imageModelSuggestions(apiType)}
          inputValue={model}
          onInputChange={(_event, value) => {
            setModel(value);
          }}
          renderInput={(params) => <TextField {...params} label="Model" required error={missingModel} />}
        />
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ marginRight: 'auto' }}
          loading={testResult?.loading}
          onClick={() => {
            void testConnection();
          }}
        >
          Test
        </Button>
        {testResult && !testResult.loading ? (
          <FormHelperText error={Boolean(testResult.error)}>{testResult.error || testResult.status}</FormHelperText>
        ) : null}
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" disabled={missingModel} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ImageProviderConfigsComponent() {
  const configsSetting = useSetting<AIProviderConfig[]>(SettingsEnum.IMAGE_PROVIDER_CONFIGS, []);
  const defaultIdSetting = useSetting<string>(SettingsEnum.DEFAULT_IMAGE_PROVIDER_CONFIG_ID, '');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AIProviderConfig | undefined>();

  const configs = configsSetting.value;

  const handleSave = (config: AIProviderConfig) => {
    const exists = configs.some((existing) => existing.id === config.id);
    const next = exists
      ? configs.map((existing) => (existing.id === config.id ? config : existing))
      : [...configs, config];
    void configsSetting.setSetting(next);
    if (!next.some((existing) => existing.id === defaultIdSetting.value)) {
      void defaultIdSetting.setSetting(config.id);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = (config: AIProviderConfig) => {
    const next = configs.filter((existing) => existing.id !== config.id);
    void configsSetting.setSetting(next);
    if (defaultIdSetting.value === config.id) {
      void defaultIdSetting.setSetting(next.length > 0 ? next[0].id : '');
    }
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <Typography variant="h6">Image Provider Configurations</Typography>
      </Box>
      <FormHelperText sx={{ marginBottom: 1 }}>
        Configure providers and models for image generation, independently from text generation. The default
        configuration handles every image request.
      </FormHelperText>
      {configs.length === 0 ? (
        <FormHelperText sx={{ marginBottom: 1 }}>
          No image provider configurations yet. OpenAI with its default image model will be used.
        </FormHelperText>
      ) : (
        <Table size="small" sx={{ marginBottom: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Default</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Model</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell padding="checkbox">
                  <Radio
                    checked={defaultIdSetting.value === config.id}
                    onChange={() => {
                      void defaultIdSetting.setSetting(config.id);
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>{config.name}</TableCell>
                <TableCell>{ApiTypeName(ApiTypeFromValue(config.apiType))}</TableCell>
                <TableCell>{config.model ?? 'Provider default'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditing(config);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => {
                        handleDelete(config);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        onClick={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        Add Configuration
      </Button>
      {dialogOpen ? (
        <ImageProviderConfigDialog
          initial={editing}
          onCancel={() => {
            setDialogOpen(false);
            setEditing(undefined);
          }}
          onSave={handleSave}
        />
      ) : null}
    </Box>
  );
}
