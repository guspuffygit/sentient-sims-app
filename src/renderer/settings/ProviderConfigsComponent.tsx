import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  createFilterOptions,
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
import { ReactNode, useState } from 'react';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import {
  ApiType,
  ApiTypeFromValue,
  ApiTypeName,
  embeddingApiTypes,
  generationApiTypes,
  imageGenerationApiTypes,
} from 'main/sentient-sims/models/ApiType';
import { AIProviderConfig, deriveAutoApiType } from 'main/sentient-sims/models/AIProviderConfig';
import {
  AIActionOverrides,
  AIActionTypeDescription,
  AIActionTypeName,
  AllAIActionTypes,
} from 'main/sentient-sims/models/AIActionType';
import { defaultImageModelFor, imageModelSuggestions } from 'main/sentient-sims/models/ImageGeneration';
import { defaultEmbeddingModelFor, embeddingModelSuggestions } from 'main/sentient-sims/models/EmbeddingModels';
import {
  appApiUrl,
  defaultGeminiModel,
  novelaiDefaultModel,
  openaiDefaultModel,
  openrouterDefaultModel,
  sentientSimsAIDefaultEmbeddingModel,
  sentientSimsAIDefaultModel,
} from 'main/sentient-sims/constants';
import { AIHealthCheckResponse, AITestStatus } from 'main/sentient-sims/models/AIHealthCheckResponse';
import { parseJsonResponse } from 'main/sentient-sims/clients/jsonResponse';
import HelpButton from 'renderer/components/HelpButton';
import useSetting from '../hooks/useSetting';
import { useAIModels } from '../hooks/useAIModels';
import { useProviderConnectionStatus } from '../hooks/useProviderConnectionStatus';
import { useAISettings } from '../providers/AISettingsProvider';
import { useAuth } from '../providers/AuthProvider';
import { ProviderConnectionPanel } from './ProviderConnectionPanel';
import { ConnectionStatusChip } from './ProviderConnectionSettingsComponent';

export type ProviderCapability = 'text' | 'image' | 'embedding';

type CapabilityDefinition = {
  title: string;
  description: string;
  configsKey: SettingsEnum;
  defaultIdKey: SettingsEnum;
  apiTypes: ApiType[];
  // Image and embedding defaults fall back to Auto (follow the main provider);
  // the text default is the main provider, so it has no Auto row
  hasAutoRow: boolean;
  dialogNoun: string;
};

const CAPABILITIES: Record<ProviderCapability, CapabilityDefinition> = {
  text: {
    title: 'Text Generation',
    description:
      'Configure multiple AI providers and models. The default configuration handles every AI request unless an action-specific override is set below.',
    configsKey: SettingsEnum.AI_PROVIDER_CONFIGS,
    defaultIdKey: SettingsEnum.DEFAULT_AI_PROVIDER_CONFIG_ID,
    apiTypes: generationApiTypes,
    hasAutoRow: false,
    dialogNoun: 'Provider Configuration',
  },
  image: {
    title: 'Image Generation',
    description:
      'Providers and models for image generation, independently from text generation. Auto follows your main text provider whenever it can generate images.',
    configsKey: SettingsEnum.IMAGE_PROVIDER_CONFIGS,
    defaultIdKey: SettingsEnum.DEFAULT_IMAGE_PROVIDER_CONFIG_ID,
    apiTypes: imageGenerationApiTypes,
    hasAutoRow: true,
    dialogNoun: 'Image Provider Configuration',
  },
  embedding: {
    title: 'Memory Embeddings',
    description:
      'Which AI provider generates the embeddings behind relevant-memory retrieval and semantic search. Embeddings only match others made by the same model, so switching models re-embeds stored memories in the background; each model’s embeddings are kept separately, so switching back reuses what it already embedded.',
    configsKey: SettingsEnum.EMBEDDING_PROVIDER_CONFIGS,
    defaultIdKey: SettingsEnum.DEFAULT_EMBEDDING_PROVIDER_CONFIG_ID,
    apiTypes: embeddingApiTypes,
    hasAutoRow: true,
    dialogNoun: 'Embedding Provider Configuration',
  },
};

// Prefill for new text configs, mirroring the app's shipping default per provider
function defaultTextModelFor(apiType: ApiType): string {
  switch (apiType) {
    case ApiType.OpenAI:
      return openaiDefaultModel;
    case ApiType.OpenRouter:
      return openrouterDefaultModel;
    case ApiType.SentientSimsAI:
      return sentientSimsAIDefaultModel;
    case ApiType.NovelAI:
      return novelaiDefaultModel;
    case ApiType.Gemini:
      return defaultGeminiModel;
    default:
      return '';
  }
}

function defaultModelFor(capability: ProviderCapability, apiType: ApiType): string {
  if (capability === 'image') {
    return defaultImageModelFor(apiType) ?? '';
  }
  if (capability === 'embedding') {
    return defaultEmbeddingModelFor(apiType) ?? '';
  }
  return defaultTextModelFor(apiType);
}

// Mirrors SettingsService.hasProviderCredentials for the capability-capable
// providers (OpenAI, Sentient Sims AI, Gemini) so the Auto row shows the same
// provider the backend will resolve to
function useAutoApiType(capableTypes: ApiType[]): ApiType {
  const aiSettings = useAISettings();
  const openaiKey = useSetting<string>(SettingsEnum.OPENAI_KEY, '');
  const geminiKeys = useSetting<string>(SettingsEnum.GEMINI_KEYS, '');
  const { userAttributes } = useAuth();

  return deriveAutoApiType(aiSettings.aiApiType, capableTypes, (apiType) => {
    switch (apiType) {
      case ApiType.OpenAI:
        return openaiKey.value.trim() !== '';
      case ApiType.Gemini:
        return geminiKeys.value.trim() !== '';
      case ApiType.SentientSimsAI:
      case ApiType.CustomAI:
        return Boolean(userAttributes);
      default:
        return false;
    }
  });
}

const modelFilter = createFilterOptions<string>();

type ProviderConfigDialogProps = {
  capability: ProviderCapability;
  initial?: AIProviderConfig;
  onCancel: () => void;
  onSave: (config: AIProviderConfig) => void;
};

// Only mounted while open so state initializes from the config being edited
function ProviderConfigDialog({ capability, initial, onCancel, onSave }: ProviderConfigDialogProps) {
  const definition = CAPABILITIES[capability];
  const [name, setName] = useState(initial?.name ?? '');
  const [apiType, setApiType] = useState<ApiType>(initial?.apiType ?? ApiType.OpenAI);
  const [model, setModel] = useState(() =>
    initial ? (initial.model ?? '') : defaultModelFor(capability, ApiType.OpenAI),
  );
  // The model input is prefilled, and Autocomplete's default filtering would
  // narrow the open dropdown to entries matching that prefill - hiding the
  // fetched model list. Only filter after the user actually types.
  const [modelFilterActive, setModelFilterActive] = useState(false);
  const [testResult, setTestResult] = useState<AITestStatus | undefined>();

  const connection = useProviderConnectionStatus(apiType);
  const modelSelectionSupported = capability !== 'text' || apiType !== ApiType.KoboldAI;
  // VLLM may leave the model empty (server default); KoboldAI never selects one
  const modelRequired = modelSelectionSupported && (capability !== 'text' || apiType !== ApiType.VLLM);
  const modelsEnabled = modelSelectionSupported && !connection.loading && connection.ready;
  // Only text providers expose a model listing endpoint; image and embedding
  // configs offer a static suggestion list instead
  const aiModels = useAIModels(apiType, capability === 'text' && modelsEnabled);
  const staticSuggestions =
    capability === 'image' ? imageModelSuggestions(apiType) : embeddingModelSuggestions(apiType);
  const modelOptions =
    capability === 'text' ? (aiModels.data?.map((aiModel) => aiModel.name) ?? []) : staticSuggestions;
  const modelsFetching = capability === 'text' && aiModels.isFetching;

  const missingModel = modelRequired && model.trim() === '';

  const handleProviderChange = (value: unknown) => {
    const type = ApiTypeFromValue(value);
    setApiType(type);
    setModel(defaultModelFor(capability, type));
    setTestResult(undefined);
  };

  const testConnection = async () => {
    setTestResult({ status: '', error: '', loading: true });

    let status = '';
    let error: string;
    try {
      // Test by provider type, not config id: the config may not be saved yet
      const query = new URLSearchParams({ apiType });
      const response = await fetch(`${appApiUrl}/debug/test-ai?${query.toString()}`);
      const result = await parseJsonResponse<AIHealthCheckResponse>(response, 'Unable to test AI connection');
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
    if (trimmedModel && modelSelectionSupported) {
      config.model = trimmedModel;
    }
    onSave(config);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{`${initial ? 'Edit' : 'Add'} ${definition.dialogNoun}`}</DialogTitle>
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
          {definition.apiTypes.map((type) => (
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
        {modelSelectionSupported ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              fullWidth
              size="small"
              options={modelOptions}
              filterOptions={(options, state) => (modelFilterActive ? modelFilter(options, state) : options)}
              inputValue={model}
              onOpen={() => {
                setModelFilterActive(false);
              }}
              onInputChange={(_event, value, reason) => {
                setModel(value);
                if (reason === 'input') {
                  setModelFilterActive(true);
                }
              }}
              loading={modelsFetching}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  required={modelRequired}
                  error={missingModel}
                  placeholder={modelRequired ? undefined : 'Server default model'}
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      endAdornment: (
                        <>
                          {modelsFetching ? <CircularProgress size={16} /> : null}
                          {params.slotProps.input.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            {capability === 'text' ? (
              <Tooltip title="Refresh Models">
                <span>
                  <IconButton
                    disabled={!modelsEnabled}
                    onClick={() => {
                      void aiModels.refetch();
                    }}
                  >
                    <SyncIcon />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </Box>
        ) : (
          <FormHelperText>Kobold AI always uses the model currently loaded on the Kobold AI server.</FormHelperText>
        )}
        {capability === 'text' && modelSelectionSupported && !connection.loading && !connection.ready ? (
          <FormHelperText>Set up the {ApiTypeName(apiType)} connection above to load models.</FormHelperText>
        ) : null}
        {capability === 'text' && modelsEnabled && aiModels.isError ? (
          <FormHelperText error>
            Could not load models ({aiModels.error.message}). Type the model name manually.
          </FormHelperText>
        ) : null}
        {apiType === ApiType.VLLM ? (
          <FormHelperText>Leave the model empty to use the VLLM server default.</FormHelperText>
        ) : null}
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

export function ProviderConfigsComponent({
  capability,
  children,
}: {
  capability: ProviderCapability;
  // Extra controls rendered between the description and the config table,
  // e.g. the memory retrieval toggle above the embedding configs
  children?: ReactNode;
}) {
  const definition = CAPABILITIES[capability];
  const configsSetting = useSetting<AIProviderConfig[]>(definition.configsKey, []);
  const defaultIdSetting = useSetting<string>(definition.defaultIdKey, '');
  const overridesSetting = useSetting<AIActionOverrides>(SettingsEnum.AI_ACTION_PROVIDER_OVERRIDES, {});
  const autoApiType = useAutoApiType(definition.apiTypes);
  const sentientSimsEmbeddingModel = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_EMBEDDING_MODEL,
    sentientSimsAIDefaultEmbeddingModel,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AIProviderConfig | undefined>();
  const [testResults, setTestResults] = useState<Record<string, AITestStatus | undefined>>({});

  const configs = configsSetting.value;
  const overrides = overridesSetting.value;
  const defaultConfig = configs.find((config) => config.id === defaultIdSetting.value);

  // What Auto resolves to right now: the backend keeps the legacy Sentient Sims
  // embedding model setting as the unpinned-model fallback
  const autoModel =
    capability === 'embedding' && (autoApiType === ApiType.SentientSimsAI || autoApiType === ApiType.CustomAI)
      ? sentientSimsEmbeddingModel.value
      : defaultModelFor(capability, autoApiType);

  const handleSave = (config: AIProviderConfig) => {
    const exists = configs.some((existing) => existing.id === config.id);
    const next = exists
      ? configs.map((existing) => (existing.id === config.id ? config : existing))
      : [...configs, config];
    void configsSetting.setSetting(next);
    if (definition.hasAutoRow) {
      // An empty default means Auto, which stays chosen unless this is the very
      // first configuration - adding another config never steals the default
      if (configs.length === 0) {
        void defaultIdSetting.setSetting(config.id);
      }
    } else if (!next.some((existing) => existing.id === defaultIdSetting.value)) {
      void defaultIdSetting.setSetting(config.id);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = (config: AIProviderConfig) => {
    const next = configs.filter((existing) => existing.id !== config.id);
    void configsSetting.setSetting(next);
    if (defaultIdSetting.value === config.id) {
      const fallbackId = definition.hasAutoRow || next.length === 0 ? '' : next[0].id;
      void defaultIdSetting.setSetting(fallbackId);
    }
    if (capability === 'text') {
      const prunedEntries = Object.entries(overrides).filter(
        ([, configId]) => configId !== config.id && next.some((existing) => existing.id === configId),
      );
      if (prunedEntries.length !== Object.keys(overrides).length) {
        void overridesSetting.setSetting(Object.fromEntries(prunedEntries));
      }
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
      const result = await parseJsonResponse<AIHealthCheckResponse>(response, 'Unable to test AI connection');
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

  const showTable = definition.hasAutoRow || configs.length > 0;

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <Typography variant="h6">{definition.title}</Typography>
        {capability === 'text' ? (
          <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
        ) : null}
      </Box>
      <FormHelperText sx={{ marginBottom: 1 }}>{definition.description}</FormHelperText>
      {children}
      {!showTable ? (
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
            {definition.hasAutoRow ? (
              <TableRow>
                <TableCell padding="checkbox">
                  <Radio
                    // A stale default id also resolves to Auto (the backend prunes it)
                    checked={!defaultConfig}
                    onChange={() => {
                      void defaultIdSetting.setSetting('');
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>Auto — follows your main provider (currently {ApiTypeName(autoApiType)})</TableCell>
                <TableCell>{ApiTypeName(autoApiType)}</TableCell>
                <TableCell>{autoModel}</TableCell>
                <TableCell align="right" />
              </TableRow>
            ) : null}
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
                    {capability === 'text' ? (
                      <Button
                        size="small"
                        loading={testResult?.loading}
                        onClick={() => {
                          void testConfig(config);
                        }}
                      >
                        Test
                      </Button>
                    ) : null}
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
      {capability === 'text' ? (
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
      ) : null}
      {dialogOpen ? (
        <ProviderConfigDialog
          capability={capability}
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
