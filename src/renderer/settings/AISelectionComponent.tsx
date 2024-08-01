import { Box, FormHelperText, MenuItem, Select } from '@mui/material';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import HelpButton from 'renderer/components/HelpButton';

function getAIHelperText(apiType: ApiType) {
  if (apiType === ApiType.OpenAI) {
    return 'OpenAI AI using the same API as ChatGPT and your personal API key.';
  }
  if (apiType === ApiType.SentientSimsAI) {
    return 'Sentient Sims uncensored AI hosted on the Sentient Sims servers.';
  }
  if (apiType === ApiType.KoboldAI) {
    return 'KoboldAI backend self hosted.';
  }

  return 'Custom Local or remote AI running on your own PC';
}

type AISelectionComponentProps = {
  aiType: any;
  apiType: ApiType;
};

export function AISelectionComponent({
  aiType,
  apiType,
}: AISelectionComponentProps) {
  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <Select
        size="small"
        labelId="release-type-select-label"
        id="release-type-select"
        value={apiType}
        sx={{ minWidth: 100, marginRight: 2 }}
        onChange={(change) => aiType.setSetting(change.target.value)}
      >
        <MenuItem value={ApiType.OpenAI}>OpenAI</MenuItem>
        <MenuItem value={ApiType.SentientSimsAI}>
          Sentient Sims Uncensored AI (Founder/Patreon)
        </MenuItem>
        <MenuItem value={ApiType.NovelAI}>NovelAI</MenuItem>
        <MenuItem value={ApiType.KoboldAI}>Kobold AI</MenuItem>
      </Select>
      <FormHelperText>{getAIHelperText(apiType)}</FormHelperText>
      <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
    </Box>
  );
}
