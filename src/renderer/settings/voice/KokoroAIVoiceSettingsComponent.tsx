import { Box, Chip, FormHelperText, MenuItem, Select, Typography } from '@mui/material';
import {
  defaultKokoroAITTSSettings,
  KokoroAISpeechModel,
  KokoroAISpeechVoice,
  KokoroAITTSSettings,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import useSetting from 'renderer/hooks/useSetting';
import { VOICES } from 'renderer/kokoro/voices';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { AIEndpointComponent } from '../AIEndpointComponent';

export function KokoroAIVoiceSettingsComponent() {
  const aiSettings = useAISettings();
  const tts = useTTS();
  const kokoroaiTtsSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const modelMenuItems: any[] = [];
  Object.values(KokoroAISpeechModel).forEach((model) =>
    modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>),
  );

  const voiceMenuItems: any[] = [];
  Object.entries(KokoroAISpeechVoice).forEach((key) =>
    voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>),
  );

  async function handleModelChange(model: string) {
    return kokoroaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: kokoroaiTtsSettings.value.voice,
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  async function handleVoiceChange(voice: string | KokoroAISpeechVoice[]) {
    const voices: KokoroAISpeechVoice[] = [];
    if (typeof voice === 'string') {
      voice.split(',').forEach((v) => voices.push(toSpeechVoice(v)));
    } else {
      voice.forEach((v) => voices.push(v));
    }

    if (voices.length > 4) {
      return;
    }

    return kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: voices,
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="subtitle1">Kokoro</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        Speech generation from a Kokoro server you run yourself, such as Kokoro-FastAPI. It needs to offer an
        OpenAI-compatible /v1/audio/speech endpoint.
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Speech model
        </Typography>
        <Select
          size="small"
          labelId="tts-models"
          id="tts-models"
          label="TTS Model"
          value={kokoroaiTtsSettings.value.model}
          sx={{ width: '100%' }}
          onChange={(change) => {
            void handleModelChange(change.target.value);
          }}
        >
          {modelMenuItems}
        </Select>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Speech voice
        </Typography>
        <Select
          size="small"
          labelId="voice"
          id="voice"
          label="Voice"
          multiple
          value={kokoroaiTtsSettings.value.voice}
          sx={{ width: '100%' }}
          onChange={(change) => {
            void handleVoiceChange(change.target.value);
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={VOICES[value].name} />
              ))}
            </Box>
          )}
        >
          {voiceMenuItems}
        </Select>
      </Box>
      <AIEndpointComponent
        type={ApiType.Kokoro}
        selectedApiType={aiSettings.ttsApiType}
        settingsEnum={SettingsEnum.KOKOROAI_ENDPOINT}
      />
      <Box sx={{ marginTop: 2.5, marginBottom: 2 }}>
        <TestVoiceButton />
      </Box>
      {tts.error ? (
        <Box sx={{ marginBottom: 2 }}>
          <FormHelperText error>Error: {tts.error}</FormHelperText>
        </Box>
      ) : null}
    </Box>
  );
}
