import {
  Box,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import SyncIcon from '@mui/icons-material/Sync';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { LoadingButton } from '@mui/lab';
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
  const aiModel: SettingsHook = useSetting(modelSetting, defaultModel);
  const aiEndpoint: SettingsHook = useSetting(endpointSetting, defaultEndpoint);

  const handleChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    aiModel.setSetting(model);
  };

  const selectChildren = useMemo(() => {
    const menuItems: JSX.Element[] = [];
    const models: AIModel[] = [];

    if (!aiModels?.data)
      return {
        menuItems,
        models,
      };

    aiModels.data
      .filter((model) => shouldIncludeModel(model))
      .sort(compareAIModels)
      .forEach((model) => models.push(model));

    const currentSelectedModelAvailable = models.some(
      (model) => model.name === aiModel.value
    );

    models.forEach((model) =>
      menuItems.push(
        <MenuItem key={model.name} value={model.name}>
          {model.displayName}
        </MenuItem>
      )
    );

    return { menuItems, models, currentSelectedModelAvailable };
  }, [aiModels?.data, aiModel.value]);

  if (aiModels.isFetching || aiModels.isLoading) {
    return (
      <LoadingButton loading size="large" variant="outlined" disabled>
        <span>models</span>
      </LoadingButton>
    );
  }

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
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
          value={aiModel.value}
          onChange={handleChange}
        >
          {selectChildren.menuItems}
        </Select>
      )}
      {aiEndpoint.value === defaultEndpoint ? (
        <Tooltip title="Reset to Default">
          <IconButton
            sx={{ marginLeft: 1 }}
            onClick={() => aiModel.resetSetting()}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <Tooltip title="Refresh Models">
        <IconButton
          sx={{ marginLeft: 1 }}
          onClick={() => aiModels.refetch()}
          disabled={aiModels.isFetching || aiModels.isLoading}
        >
          <SyncIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
