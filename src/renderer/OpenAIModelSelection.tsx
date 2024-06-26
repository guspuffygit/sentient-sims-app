import {
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting, { SettingsHook } from './hooks/useSetting';
import { useDebugMode } from './providers/DebugModeProvider';

export default function OpenAIModelSelection() {
  const debugMode = useDebugMode();
  const openAIModel: SettingsHook = useSetting(
    SettingsEnum.OPENAI_MODEL,
    'gpt-3.5-turbo'
  );

  const handleChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    openAIModel.setSetting(model);
  };

  if (debugMode.isEnabled) {
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
          <ListSubheader>gpt-3.5</ListSubheader>
          <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
          <MenuItem value="gpt-3.5-turbo-0613">gpt-3.5-turbo-0613</MenuItem>
          <MenuItem value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</MenuItem>
          <MenuItem value="gpt-3.5-turbo-16k-0613">
            gpt-3.5-turbo-16k-0613
          </MenuItem>
          <ListSubheader>gpt-4 (10x more $$$ BE AWARE)</ListSubheader>
          <MenuItem value="gpt-4">gpt-4 ($0.03/1Kt, $0.06/1Kt)</MenuItem>
          <MenuItem value="gpt-4-0613">gpt-4-0613</MenuItem>
          <MenuItem value="gpt-4o">gpt-4o</MenuItem>
        </Select>
      </div>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
