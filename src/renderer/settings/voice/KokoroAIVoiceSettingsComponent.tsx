import { Alert, AlertTitle, Box, Button, FormHelperText, Link, Typography } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { defaultKokoroAITTSSettings, KokoroAITTSSettings } from 'main/sentient-sims/models/KokoroAITTSSettings';
import { defaultKokoroSpeed } from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultKokoroEndpoint, kokoroSetupGuideUrl } from 'main/sentient-sims/constants';
import { kokoroBaseUrl } from 'main/sentient-sims/clients/KokoroTTSRequest';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import handleOpenExternalLink from 'renderer/hooks/handleOpenExternalLink';
import { useKokoroServerStatus } from 'renderer/hooks/useKokoroServerStatus';
import useSetting from 'renderer/hooks/useSetting';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { AIEndpointComponent } from '../AIEndpointComponent';
import { KokoroSpeedSlider, KokoroVoiceSelect } from './KokoroVoiceControls';

const openSetupGuide = handleOpenExternalLink(kokoroSetupGuideUrl);

function KokoroServerNotice({ endpoint }: { endpoint: string }) {
  const status = useKokoroServerStatus(endpoint);
  const address = kokoroBaseUrl(endpoint);

  if (status === 'checking') {
    return (
      <Alert severity="info" sx={{ marginBottom: 2.5 }}>
        Looking for your Kokoro server at {address}...
      </Alert>
    );
  }

  if (status === 'online') {
    return (
      <Alert severity="success" sx={{ marginBottom: 2.5 }}>
        Connected to your Kokoro server at {address}.
      </Alert>
    );
  }

  return (
    <Alert severity="warning" sx={{ marginBottom: 2.5 }}>
      <AlertTitle>No Kokoro server is running at {address}</AlertTitle>
      Sims stay silent until you install Kokoro-FastAPI on your computer and start it. It has to keep running while you
      play. If you did not plan to set up your own server, choose Sentient Sims AI TTS or ElevenLabs under Provider
      instead.
      <Box sx={{ marginTop: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={openSetupGuide}
        >
          Open the Kokoro-FastAPI setup guide
        </Button>
      </Box>
    </Alert>
  );
}

export function KokoroAIVoiceSettingsComponent() {
  const aiSettings = useAISettings();
  const tts = useTTS();
  const kokoroEndpoint = useSetting<string>(SettingsEnum.KOKOROAI_ENDPOINT, defaultKokoroEndpoint);
  const kokoroaiTtsSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  function update(change: Partial<KokoroAITTSSettings>) {
    void kokoroaiTtsSettings.setSetting({ ...kokoroaiTtsSettings.value, ...change });
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="subtitle1">Kokoro (self-hosted)</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        Free voices from a Kokoro server that you install and run on your own computer. Sentient Sims does not include
        or start one. Setting it up takes Docker and a few commands, and the{' '}
        <Link component="button" variant="body2" onClick={openSetupGuide} sx={{ verticalAlign: 'baseline' }}>
          Kokoro-FastAPI setup guide
        </Link>{' '}
        walks through it.
      </Typography>
      <KokoroServerNotice endpoint={kokoroEndpoint.value} />
      <AIEndpointComponent
        type={ApiType.Kokoro}
        selectedApiType={aiSettings.ttsApiType}
        settingsEnum={SettingsEnum.KOKOROAI_ENDPOINT}
      />
      <KokoroVoiceSelect
        value={kokoroaiTtsSettings.value.voice}
        onChange={(voice) => {
          update({ voice });
        }}
      />
      <KokoroSpeedSlider
        value={kokoroaiTtsSettings.value.speed ?? defaultKokoroSpeed}
        onChange={(speed) => {
          update({ speed });
        }}
      />
      <Box sx={{ marginTop: 2.5 }}>
        <TestVoiceButton />
      </Box>
      {tts.error ? (
        <Box sx={{ marginTop: 1.5, marginBottom: 2 }}>
          <FormHelperText error>Error: {tts.error}</FormHelperText>
        </Box>
      ) : null}
    </Box>
  );
}
