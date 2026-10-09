import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import {
  defaultVoiceInputHotkeyFor,
  defaultVoiceInputModel,
  openaiDefaultEndpoint,
} from 'main/sentient-sims/constants';
import { voiceHotkeyPresets } from 'main/sentient-sims/models/VoiceHotkeyPresets';
import { VOICE_INPUT_LANGUAGES, normalizeVoiceInputLanguage } from 'main/sentient-sims/models/VoiceInputLanguages';
import useSetting from 'renderer/hooks/useSetting';
import {
  PLAYER_VOICE_PERSONAS,
  PLAYER_VOICE_PERSONA_LABELS,
  PlayerVoicePersona,
} from 'main/sentient-sims/models/PlayerVoicePersona';
import HelpButton from 'renderer/components/HelpButton';
import { rendererTiers } from '../../tiers/merge';

// AUTONOMY: the command chord, only in a build that can carry an order out
const VoiceCommandRow = rendererTiers.voiceCommandRow;

const testRecordMs = 3000;

export default function VoiceInputSettingsComponent() {
  const { isMac } = window.electron;
  const enabled = useSetting<boolean>(SettingsEnum.VOICE_INPUT_ENABLED, false);
  const provider = useSetting<ApiType>(SettingsEnum.VOICE_INPUT_PROVIDER, ApiType.SentientSimsAI);
  const endpoint = useSetting<string>(SettingsEnum.VOICE_INPUT_ENDPOINT, openaiDefaultEndpoint);
  const apiKey = useSetting<string>(SettingsEnum.VOICE_INPUT_KEY, '');
  const model = useSetting<string>(SettingsEnum.VOICE_INPUT_MODEL, defaultVoiceInputModel);
  const hotkey = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY, defaultVoiceInputHotkeyFor(isMac));
  const hotkeyMode = useSetting<string>(SettingsEnum.VOICE_INPUT_HOTKEY_MODE, 'hold');
  const language = useSetting<string>(SettingsEnum.VOICE_INPUT_LANGUAGE, '');
  const deviceId = useSetting<string>(SettingsEnum.VOICE_INPUT_DEVICE_ID, '');
  const persona = useSetting<string>(SettingsEnum.PLAYER_VOICE_PERSONA, 'voice');
  const personaBio = useSetting<string>(SettingsEnum.PLAYER_VOICE_PERSONA_BIO, '');
  const personaName = useSetting<string>(SettingsEnum.PLAYER_VOICE_PERSONA_NAME, '');
  const followsClock = useSetting<boolean>(SettingsEnum.PLAYBACK_FOLLOWS_GAME_CLOCK, true);

  const usesSentientSimsAI = provider.value !== ApiType.OpenAI;
  const hotkeyPresets = voiceHotkeyPresets(isMac, hotkey.value);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [testState, setTestState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [testResult, setTestResult] = useState<string>();
  const [testError, setTestError] = useState<string>();

  useEffect(() => {
    if (!enabled.value) {
      return;
    }
    void (async () => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        setDevices(all.filter((device) => device.kind === 'audioinput'));
      } catch (err) {
        log.error('Unable to enumerate audio devices', err);
      }
    })();
  }, [enabled.value, testState]);

  async function runTest() {
    setTestResult(undefined);
    setTestError(undefined);
    setTestState('recording');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId.value ? { deviceId: { exact: deviceId.value } } : true,
      });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setTestState('transcribing');
        void (async () => {
          try {
            const audio = await new Blob(chunks, { type: 'audio/webm' }).arrayBuffer();
            const result = await window.electron.testTranscribeVoice(audio, 'audio/webm');
            if (result.error) {
              setTestError(result.error);
            } else {
              setTestResult(result.text || '(heard nothing)');
            }
          } catch (err) {
            setTestError(err instanceof Error ? err.message : String(err));
          } finally {
            setTestState('idle');
          }
        })();
      };
      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, testRecordMs);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : String(err));
      setTestState('idle');
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Divider sx={{ marginY: 2 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <FormControlLabel
          label="Enable Voice Input (talk to Sims with your microphone)"
          control={
            <Checkbox checked={enabled.value} onChange={(change) => void enabled.setSetting(change.target.checked)} />
          }
        />
        <HelpButton url="https://github.com/guspuffygit/sentient-sims-app/wiki/Voice" />
      </Box>
      {enabled.value ? (
        <Stack spacing={2} sx={{ maxWidth: 640 }}>
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
            <Typography sx={{ minWidth: 110 }}>Hotkey:</Typography>
            <Select
              size="small"
              value={hotkey.value}
              onChange={(change) => void hotkey.setSetting(change.target.value)}
            >
              {hotkeyPresets.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={hotkeyMode.value}
              onChange={(change) => void hotkeyMode.setSetting(change.target.value)}
            >
              <MenuItem value="hold">Hold to talk</MenuItem>
              <MenuItem value="toggle">Press to start/stop</MenuItem>
            </Select>
          </Stack>
          {VoiceCommandRow ? <VoiceCommandRow talkHotkey={hotkey.value} presets={hotkeyPresets} /> : null}
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
            <Typography sx={{ minWidth: 110 }}>You are:</Typography>
            <Select
              size="small"
              value={persona.value}
              onChange={(change) => void persona.setSetting(change.target.value)}
            >
              {PLAYER_VOICE_PERSONAS.map((option) => (
                <MenuItem key={option} value={option}>
                  {PLAYER_VOICE_PERSONA_LABELS[option]}
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              fullWidth
              label="Your name"
              value={personaName.value}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              placeholder={PLAYER_VOICE_PERSONA_LABELS[persona.value as PlayerVoicePersona]}
              helperText="What your sims call you, in their memories and subtitles. Leave blank to use the persona above; one word reads best in game."
              onChange={(change) => void personaName.setSetting(change.target.value)}
            />
          </Stack>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label="About you"
            value={personaBio.value}
            placeholder="Sam is the creator of this world and watches over the household from above."
            helperText="One to three short sentences about you, written in third person. Your sims are told this every time you speak, so keep it brief."
            onChange={(change) => void personaBio.setSetting(change.target.value)}
          />
          <FormControlLabel
            label="Voices and subtitles follow the game clock (pause with the game, faster on speed 2/3)"
            control={
              <Checkbox
                checked={followsClock.value}
                onChange={(change) => void followsClock.setSetting(change.target.checked)}
              />
            }
          />
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
            <Typography sx={{ minWidth: 110 }}>Transcription:</Typography>
            <Select
              size="small"
              value={usesSentientSimsAI ? ApiType.SentientSimsAI : ApiType.OpenAI}
              onChange={(change) => void provider.setSetting(change.target.value)}
            >
              <MenuItem value={ApiType.SentientSimsAI}>Sentient Sims AI</MenuItem>
              <MenuItem value={ApiType.OpenAI}>OpenAI-compatible endpoint</MenuItem>
            </Select>
          </Stack>
          {usesSentientSimsAI ? (
            <FormHelperText>Uses your Sentient Sims AI login. No endpoint, key or model is needed.</FormHelperText>
          ) : (
            <>
              <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Typography sx={{ minWidth: 110 }}>Endpoint:</Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={endpoint.value}
                  onChange={(change) => void endpoint.setSetting(change.target.value)}
                  helperText="Any OpenAI-compatible /audio/transcriptions endpoint (OpenAI, Groq, local whisper server)"
                />
              </Stack>
              <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Typography sx={{ minWidth: 110 }}>API Key:</Typography>
                <TextField
                  size="small"
                  fullWidth
                  type="password"
                  value={apiKey.value}
                  onChange={(change) => void apiKey.setSetting(change.target.value)}
                  helperText="Leave empty to reuse your OpenAI key from the AI settings (OpenAI endpoint only)"
                />
              </Stack>
              <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Typography sx={{ minWidth: 110 }}>Model:</Typography>
                <TextField
                  size="small"
                  value={model.value}
                  onChange={(change) => void model.setSetting(change.target.value)}
                />
              </Stack>
            </>
          )}
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
            <Typography sx={{ minWidth: 110 }}>Language:</Typography>
            <Select
              size="small"
              displayEmpty
              value={normalizeVoiceInputLanguage(language.value)}
              onChange={(change) => void language.setSetting(change.target.value)}
              sx={{ minWidth: 260 }}
              MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
            >
              <MenuItem value="">Auto-detect</MenuItem>
              {VOICE_INPUT_LANGUAGES.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
            <Typography sx={{ minWidth: 110 }}>Microphone:</Typography>
            <Select
              size="small"
              displayEmpty
              value={deviceId.value}
              onChange={(change) => void deviceId.setSetting(change.target.value)}
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="">System default</MenuItem>
              {devices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone (${device.deviceId.slice(0, 8)})`}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              startIcon={<MicIcon />}
              disabled={testState !== 'idle'}
              onClick={() => void runTest()}
            >
              {testState === 'recording' ? 'Speak now…' : testState === 'transcribing' ? 'Transcribing…' : 'Test'}
            </Button>
          </Stack>
          {testResult ? <FormHelperText>Heard: “{testResult}”</FormHelperText> : null}
          {testError ? <FormHelperText error>Error: {testError}</FormHelperText> : null}
          <FormHelperText>
            Hold the hotkey while the game is focused, speak, and release — your words become your active Sim&apos;s
            spoken line to whoever they&apos;re talking to. The game&apos;s overlay listens for the key, so it works
            only while the game window is focused and the overlay is loaded; no system permission is needed.
          </FormHelperText>
        </Stack>
      ) : null}
    </Box>
  );
}
