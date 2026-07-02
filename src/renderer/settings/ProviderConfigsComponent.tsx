import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
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
import SyncIcon from '@mui/icons-material/Sync';
import { useState } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue, ApiTypeName } from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig } from 'main/sentient-sims/models/AIProviderConfig';
import {
  AIActionOverrides,
  AIActionTypeDescription,
  AIActionTypeName,
  AllAIActionTypes,
} from 'main/sentient-sims/models/AIActionType';
import { appApiUrl } from 'main/sentient-sims/constants';
import { AIHealthCheckResponse, AITestStatus } from 'main/sentient-sims/models/AIHealthCheckResponse';
import HelpButton from 'renderer/components/HelpButton';
import useSetting from '../hooks/useSetting';
import { useAIModels } from '../hooks/useAIModels';

export const generationApiTypes: ApiType[] = [
  ApiType.OpenAI,
  ApiType.SentientSimsAI,
  ApiType.NovelAI,
  ApiType.KoboldAI,
  ApiType.Gemini,
  ApiType.VLLM,
];

type ProviderConfigDialogProps = {
  initial?: AIProviderConfig;
  onCancel: () => void;
  onSave: (config: AIProviderConfig) => void;
};

// Only mounted while open so state initializes from the config being edited
function ProviderConfigDialog({ initial, onCancel, onSave }: ProviderConfigDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [apiType, setApiType] = useState<ApiType>(initial?.apiType ?? ApiType.OpenAI);
  const [model, setModel] = useState(initial?.model ?? '');

  const modelSelectionSupported = apiType !== ApiType.KoboldAI;
  const aiModels = useAIModels(apiType, modelSelectionSupported);

  const handleSave = () => {
    const trimmedModel = model.trim();
    const fallbackName = trimmedModel ? `${ApiTypeName(apiType)} (${trimmedModel})` : ApiTypeName(apiType);
    const config: AIProviderConfig = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim() || fallbackName,
      apiType,
    };
    if (trimmedModel && modelSelectionSupported) {
      config.model = trimmedModel;
    }
    onSave(config);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit Provider Configuration' : 'Add Provider Configuration'}</DialogTitle>
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
            setApiType(ApiTypeFromValue(change.target.value));
            setModel('');
          }}
        >
          {generationApiTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {ApiTypeName(type)}
            </MenuItem>
          ))}
        </Select>
        {modelSelectionSupported ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={aiModels.data?.map((aiModel) => aiModel.name) ?? []}
              inputValue={model}
              onInputChange={(_event, value) => {
                setModel(value);
              }}
              loading={aiModels.isFetching}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  placeholder="Provider default model"
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      endAdornment: (
                        <>
                          {aiModels.isFetching ? <CircularProgress size={16} /> : null}
                          {params.slotProps.input.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            <Tooltip title="Refresh Models">
              <IconButton
                onClick={() => {
                  void aiModels.refetch();
                }}
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <FormHelperText>Kobold AI always uses the model currently loaded on the Kobold AI server.</FormHelperText>
        )}
        {modelSelectionSupported && aiModels.isError ? (
          <FormHelperText error>
            Could not load models ({aiModels.error.message}). Type the model name manually.
          </FormHelperText>
        ) : null}
        {modelSelectionSupported ? (
          <FormHelperText>
            Leave the model empty to use the provider default. API keys and endpoints are configured per provider in the
            settings below.
          </FormHelperText>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ProviderConfigsComponent() {
  const configsSetting = useSetting<AIProviderConfig[]>(SettingsEnum.AI_PROVIDER_CONFIGS, []);
  const defaultIdSetting = useSetting<string>(SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID, '');
  const overridesSetting = useSetting<AIActionOverrides>(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AIProviderConfig | undefined>();
  const [testResults, setTestResults] = useState<Record<string, AITestStatus | undefined>>({});

  const configs = configsSetting.value;
  const overrides = overridesSetting.value;
  const defaultConfig = configs.find((config) => config.id === defaultIdSetting.value);

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
    const prunedEntries = Object.entries(overrides).filter(
      ([, configId]) => configId !== config.id && next.some((existing) => existing.id === configId),
    );
    if (prunedEntries.length !== Object.keys(overrides).length) {
      void overridesSetting.setSetting(Object.fromEntries(prunedEntries));
    }
  };

  const testConfig = async (config: AIProviderConfig) => {
    setTestResults((previous) => ({
      ...previous,
      [config.id]: { status: '', error: '', loading: true },
    }));

    let status = '';
    let error = '';
    try {
      const query = new URLSearchParams({ configId: config.id });
      const response = await fetch(`${appApiUrl}/debug/test-ai?${query.toString()}`);
      const result = (await response.json()) as AIHealthCheckResponse;
      status = result.status || '';
      error = result.error || '';
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    setTestResults((previous) => ({
      ...previous,
      [config.id]: { status, error, loading: false },
    }));
  };

  const setOverride = (action: string, configId: string) => {
    const entries = Object.entries(overrides).filter(([key]) => key !== action);
    if (configId !== '') {
      entries.push([action, configId]);
    }
    void overridesSetting.setSetting(Object.fromEntries(entries));
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <Typography variant="h6">AI Provider Configurations</Typography>
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
      </Box>
      <FormHelperText sx={{ marginBottom: 1 }}>
        Configure multiple AI providers and models. The default configuration handles every AI request unless an
        action-specific override is set below.
      </FormHelperText>
      {configs.length === 0 ? (
        <FormHelperText sx={{ marginBottom: 1 }} error>
          No provider configurations yet, add one to get started.
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
            {configs.map((config) => {
              const testResult = testResults[config.id];
              return (
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
                  <TableCell>
                    {config.name}
                    {testResult && !testResult.loading ? (
                      <FormHelperText error={Boolean(testResult.error)}>
                        {testResult.error || testResult.status}
                      </FormHelperText>
                    ) : null}
                  </TableCell>
                  <TableCell>{ApiTypeName(ApiTypeFromValue(config.apiType))}</TableCell>
                  <TableCell>{config.model ?? 'Provider default'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      loading={testResult?.loading}
                      onClick={() => {
                        void testConfig(config);
                      }}
                    >
                      Test
                    </Button>
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
              );
            })}
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
      <Accordion sx={{ marginTop: 2 }} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Per-Action Provider Overrides</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormHelperText sx={{ marginBottom: 1 }}>
            Route specific AI actions to a different provider configuration than the default.
          </FormHelperText>
          {AllAIActionTypes.map((action) => {
            const overrideId = overrides[action];
            const value = overrideId && configs.some((config) => config.id === overrideId) ? overrideId : '';
            return (
              <Box key={action} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <Tooltip title={AIActionTypeDescription(action)} placement="top-start">
                  <Typography sx={{ width: 170, flexShrink: 0 }}>{AIActionTypeName(action)}</Typography>
                </Tooltip>
                <Select
                  size="small"
                  displayEmpty
                  value={value}
                  sx={{ minWidth: 260 }}
                  onChange={(change) => {
                    setOverride(action, change.target.value);
                  }}
                >
                  <MenuItem value="">Default{defaultConfig ? ` (${defaultConfig.name})` : ''}</MenuItem>
                  {configs.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      {config.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            );
          })}
        </AccordionDetails>
      </Accordion>
      {dialogOpen ? (
        <ProviderConfigDialog
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
