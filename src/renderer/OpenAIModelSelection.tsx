import {
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import useDebugModeHook from './UseDebugModeHook';
import useSetting, { SettingsHook } from './hooks/useSetting';

export default function OpenAIModelSelection() {
  const [debugModeEnabled] = useDebugModeHook();
  const openAIModel: SettingsHook = useSetting('openaiModel', 'gpt-3.5-turbo');

  const handleChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    window.electron.setOpenAIModel(model);
    openAIModel.setSetting(model);
  };

  if (debugModeEnabled) {
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
        </Select>
      </div>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
