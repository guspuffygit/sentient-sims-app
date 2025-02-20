import { Box, FormHelperText, MenuItem, Select } from '@mui/material';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import HelpButton from 'renderer/components/HelpButton';
import { useAISettings } from 'renderer/providers/AISettingsProvider';

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
  // [NEW] Added helper text for Gemini
  if (apiType === ApiType.Gemini) {
    return 'Google Gemini AI using your personal API keys (supports multiple keys separated by commas).';
  }

  return 'Custom Local or remote AI running on your own PC';
}

export function AISelectionComponent() {
  const { aiApiType, aiApiTypeSetting } = useAISettings();

  return (
    <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
      <Select
        size="small"
        labelId="release-type-select-label"
        id="release-type-select"
        value={aiApiType}
        sx={{ minWidth: 100, marginRight: 2 }}
        onChange={(change) => aiApiTypeSetting.setSetting(change.target.value)}
      >
        <MenuItem value={ApiType.OpenAI}>OpenAI</MenuItem>
        <MenuItem value={ApiType.SentientSimsAI}>
          Sentient Sims Uncensored AI (Founder/Patreon)
        </MenuItem>
        <MenuItem value={ApiType.NovelAI}>NovelAI</MenuItem>
        <MenuItem value={ApiType.KoboldAI}>Kobold AI</MenuItem>
        {/* [NEW] Added Gemini as a selectable option in the dropdown */}
        <MenuItem value={ApiType.Gemini}>Gemini</MenuItem>
      </Select>
      <FormHelperText>{getAIHelperText(aiApiType)}</FormHelperText>
      <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
    </Box>
  );
}
