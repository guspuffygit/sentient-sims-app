import {
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { LoadingButton } from '@mui/lab';
import { AIModel, compareAIModels } from 'main/sentient-sims/models/AIModel';
import { openaiDefaultEndpoint } from 'main/sentient-sims/constants';
import { UseQueryResult } from '@tanstack/react-query';
import log from 'electron-log';
import useSetting, { SettingsHook } from './hooks/useSetting';

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

type OpenAIModelSelectionProps = {
  aiModels: UseQueryResult<AIModel[], Error>;
};

export default function OpenAIModelSelection({
  aiModels,
}: OpenAIModelSelectionProps) {
  const openAIModel: SettingsHook = useSetting(
    SettingsEnum.OPENAI_MODEL,
    'gpt-3.5-turbo'
  );
  const openAIEndpoint: SettingsHook = useSetting(
    SettingsEnum.OPENAI_ENDPOINT,
    openaiDefaultEndpoint
  );

  const handleChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    openAIModel.setSetting(model);
  };

  if (aiModels.isFetching || aiModels.isLoading) {
    return (
      <LoadingButton loading size="large" variant="outlined" disabled>
        <span>models</span>
      </LoadingButton>
    );
  }

  if (aiModels.isError) {
    return (
      <div>
        <FormHelperText sx={{ m: 1 }} error>
          Error: {aiModels.error.message}
        </FormHelperText>
      </div>
    );
  }

  const selectChildren: any[] = [];

  if (aiModels?.data?.filter) {
    const models = aiModels.data
      .filter((model) => shouldIncludeModel(model))
      .sort(compareAIModels);

    let currentSelectedModelAvailable = false;
    const currentModel = openAIModel.value;
    models.forEach((model) => {
      selectChildren.push(
        <MenuItem value={model.name}>{model.displayName}</MenuItem>
      );
      if (model.name === currentModel) {
        currentSelectedModelAvailable = true;
      }
    });
    if (!currentSelectedModelAvailable) {
      log.info(
        `Currently selected OpenAI model ${currentModel} is not available`
      );
      if (openAIEndpoint.value === openaiDefaultEndpoint) {
        openAIModel.resetSetting();
      } else if (models.length > 0) {
        openAIModel.setSetting(models[0].name);
      } else {
        log.error(
          'Unable to set an OpenAI model because none were returned from the API'
        );
      }
    }
  }

  return (
    <div>
      <Select
        size="small"
        labelId="openai-model-label"
        id="openai-model"
        label="OpenAI Model"
        value={openAIModel.value}
        onChange={handleChange}
      >
        {selectChildren}
      </Select>
      {openAIEndpoint.value === openaiDefaultEndpoint ? (
        <Tooltip title="Reset to Default">
          <IconButton
            sx={{ marginLeft: 1 }}
            onClick={() => openAIModel.resetSetting()}
          >
            <RotateLeftIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </div>
  );
}
