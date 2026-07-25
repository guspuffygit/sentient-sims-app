import { Box, FormHelperText, IconButton, MenuItem, Select, SelectChangeEvent, Tooltip, Button } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import SyncIcon from '@mui/icons-material/Sync';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { AIModel, compareAIModels } from 'main/sentient-sims/models/AIModel';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useMemo, JSX } from 'react';
import useSetting, { SettingsHook } from './hooks/useSetting';
import { useAIModels } from './hooks/useAIModels';

function shouldIncludeModel(model: AIModel): boolean {
  const name = model.name.toLowerCase();
  if (name.includes('text-embedding')) {
    return false;
  }

  if (name.includes('tts-')) {
    return false;
  }

  if (name.includes('davinci')) {
    return false;
  }

  if (name.includes('babbage')) {
    return false;
  }

  if (name.includes('dall-e')) {
    return false;
  }

  if (name.includes('whisper')) {
    return false;
  }

  return true;
}

type AIModelSelectionProps = {
  apiType: ApiType;
  defaultModel: string;
  defaultEndpoint: string;
  modelSetting: SettingsEnum;
  endpointSetting: SettingsEnum;
};

export default function AIModelSelection({
  apiType,
  defaultModel,
  defaultEndpoint,
  modelSetting,
  endpointSetting,
}: AIModelSelectionProps) {
  const aiModels = useAIModels(apiType);
  const aiModel: SettingsHook<string> = useSetting<string>(modelSetting, defaultModel);
  const aiEndpoint: SettingsHook<string> = useSetting<string>(endpointSetting, defaultEndpoint);

  const handleChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    void aiModel.setSetting(model);
  };

  const selectChildren = useMemo(() => {
    const menuItems: JSX.Element[] = [];
    const models: AIModel[] = [];

    if (!aiModels.data)
      return {
        menuItems,
        models,
      };

    aiModels.data
      .filter((model) => shouldIncludeModel(model))
      .sort(compareAIModels)
      .forEach((model) => models.push(model));

    const currentSelectedModelAvailable = models.some((model) => model.name === aiModel.value);

    models.forEach((model) =>
      menuItems.push(
        <MenuItem key={model.name} value={model.name}>
          {model.displayName}
        </MenuItem>,
      ),
    );

    return { menuItems, models, currentSelectedModelAvailable };
  }, [aiModels.data, aiModel.value]);

  if (aiModels.isFetching || aiModels.isLoading) {
    return (
      <Button loading size="large" variant="outlined" disabled>
        <span>models</span>
      </Button>
    );
  }

  // Switching endpoints (OpenAI to OpenRouter, say) leaves a model selected that the new
  // endpoint does not serve. Blanking the Select keeps MUI from warning about an
  // out-of-range value and makes it obvious a new pick is needed.
  const modelMissing = !selectChildren.currentSelectedModelAvailable && selectChildren.models.length > 0;

  return (
    <Box sx={{ marginBottom: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {aiModels.isError ? (
          <FormHelperText sx={{ m: 1 }} error>
            Error: {aiModels.error.message}
          </FormHelperText>
        ) : (
          <Select
            size="small"
            labelId="openai-model-label"
            id="openai-model"
            label="Model"
            value={modelMissing ? '' : aiModel.value}
            onChange={handleChange}
          >
            {selectChildren.menuItems}
          </Select>
        )}
        {aiEndpoint.value === defaultEndpoint ? (
          <Tooltip title="Reset to Default">
            <IconButton
              sx={{ marginLeft: 1 }}
              onClick={() => {
                void aiModel.resetSetting();
              }}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Tooltip title="Refresh Models">
          <IconButton
            sx={{ marginLeft: 1 }}
            onClick={() => {
              void aiModels.refetch();
            }}
          >
            <SyncIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {modelMissing ? (
        <FormHelperText sx={{ mx: 1 }} error>
          &quot;{aiModel.value}&quot; isn&apos;t available at this endpoint. Choose a model above.
        </FormHelperText>
      ) : null}
    </Box>
  );
}
