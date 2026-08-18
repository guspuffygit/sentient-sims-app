import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType, ApiTypeFromValue, ApiTypeName, embeddingApiTypes } from 'main/sentient-sims/models/ApiType';
import { sentientSimsAIDefaultEmbeddingModel } from 'main/sentient-sims/constants';
import useSetting from '../hooks/useSetting';
import { useDebugMode } from '../providers/DebugModeProvider';

export default function EmbeddingSettingsComponent() {
  const memoryRetrievalEnabled = useSetting(SettingsEnum.MEMORY_RETRIEVAL_ENABLED, false);
  const embeddingApiType = useSetting<ApiType>(SettingsEnum.EMBEDDING_API_TYPE, ApiType.OpenAI);
  const embeddingModel = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_EMBEDDING_MODEL,
    sentientSimsAIDefaultEmbeddingModel,
  );
  const debugMode = useDebugMode();

  if (!debugMode.isEnabled) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: 2 }}>
      <FormControl size="small" sx={{ minWidth: 220 }} disabled={!memoryRetrievalEnabled.value}>
        <InputLabel id="embedding-provider-label">Embedding Provider</InputLabel>
        <Select
          labelId="embedding-provider-label"
          label="Embedding Provider"
          value={embeddingApiType.value}
          onChange={(change) => {
            void embeddingApiType.setSetting(ApiTypeFromValue(change.target.value));
          }}
        >
          {embeddingApiTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {ApiTypeName(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {embeddingApiType.value === ApiType.SentientSimsAI ? (
        <TextField
          label="Embedding Model"
          size="small"
          sx={{ marginLeft: 2, minWidth: 280 }}
          disabled={!memoryRetrievalEnabled.value}
          value={embeddingModel.value}
          placeholder={sentientSimsAIDefaultEmbeddingModel}
          onChange={(change) => {
            void embeddingModel.setSetting(change.target.value);
          }}
        />
      ) : null}
      <FormHelperText>
        Which AI provider generates the embeddings behind relevant-memory retrieval and semantic search. Embeddings only
        match others made by the same model, so switching to a new model re-embeds stored memories in the background.
        Each model&apos;s embeddings are kept separately, so switching back to a previous model reuses what it already
        embedded.
      </FormHelperText>
    </Box>
  );
}
