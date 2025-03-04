import {
  Box,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
} from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import HelpButton from 'renderer/components/HelpButton';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import useSetting from '../hooks/useSetting';

export default function VoiceSettingsComponent() {
  const ttsEnabled = useSetting(SettingsEnum.TTS_ENABLED, true);
  const ttsApiType = useSetting(
    SettingsEnum.TTS_API_TYPE,
    ApiType.SentientSimsAI.toString()
  );

  let menuItems: any[] = [];
  if (!ttsApiType.isLoading && ttsApiType.value === ApiType.OpenAI) {
    menuItems.push(<MenuItem value="tts-1">tts-1</MenuItem>);
    menuItems.push(<MenuItem value="tts-1-hd">tts-1-hd</MenuItem>);
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <FormControlLabel
          label="Enable Text to Speech"
          control={
            <Checkbox
              checked={ttsEnabled.value}
              onChange={(change) =>
                ttsEnabled.setSetting(change.target.checked)
              }
            />
          }
        />
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/How%E2%80%90to-Use-The-Sentient-Sims-App#translation-and-language-support" />
      </Box>
      {ttsEnabled.value ? (
        <>
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <Select
              size="small"
              labelId="release-type-select-label"
              id="release-type-select"
              value={ttsApiType.value}
              sx={{ minWidth: 100, marginRight: 2 }}
              onChange={(change) => ttsApiType.setSetting(change.target.value)}
            >
              <MenuItem value={ApiType.OpenAI}>OpenAI</MenuItem>
              <MenuItem value={ApiType.SentientSimsAI}>
                Sentient Sims Uncensored AI (Founder/Patreon)
              </MenuItem>
              <MenuItem value={ApiType.Gemini}>Gemini</MenuItem>
            </Select>
            <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/AI-Backends" />
          </Box>
          <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
            <Select
              size="small"
              labelId="tts-models"
              id="tts-models"
              label="TTS Model"
              value="tts-1"
              // onChange={handleChange}
            >
              {menuItems}
            </Select>
          </Box>
        </>
      ) : null}
    </>
  );
}
