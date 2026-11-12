import { Box, Chip, FormHelperText, MenuItem, Select, Typography } from '@mui/material';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { JSX } from 'react';
import {
  DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE,
  defaultKokoroSpeed,
  defaultSentientSimsAITTSSettings,
  isElevenLabsSpeechModel,
  SentientSimsAISpeechModel,
  SentientSimsAISpeechKokoroVoice,
  SentientSimsAITTSSettings,
  speechModelName,
  toSpeechModel,
  toSpeechVoice,
  SentientSimsAISpeechVoice,
  SentientSimsAISpeechOrpheusVoice,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { VOICES } from 'renderer/kokoro/voices';
import { elevenLabsVoiceCatalog } from 'main/sentient-sims/formatter/ElevenLabsVoiceCasting';
import { elevenLabsCatalogVoiceLabel } from 'renderer/components/ElevenLabsCatalogSimVoiceSelect';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { useMembership } from 'renderer/hooks/useMembership';
import { SUBSCRIPTION_REQUIRED_LABEL } from 'renderer/billing/membershipView';
import { PLAN_TAB, SUBSCRIBE_HINT } from 'main/sentient-sims/exceptions/SubscriptionRequiredError';
import { useAuth } from '../../providers/AuthProvider';
import { KokoroSpeedSlider, KokoroVoiceSelect } from './KokoroVoiceControls';

export function SentientSimsAIVoiceSettingsComponent() {
  const { userAttributes } = useAuth();

  const { membership } = useMembership();

  const showLogInError = !userAttributes;
  const showMemberError = !membership.canUseSentientSimsAI();

  const errors: JSX.Element[] = [];
  if (showLogInError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        You must be logged in to use the Sentient Sims AI API
      </FormHelperText>,
    );
  }
  if (showMemberError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        A Sentient Sims membership is needed for Sentient Sims AI voices. {SUBSCRIBE_HINT}
      </FormHelperText>,
    );
  }
  const tts = useTTS();
  const sentientsimsaiTtsSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  // Orpheus runs at an outside provider, so a founder without a plan cannot use it
  const workerOnly = membership.isWorkerOnly();
  const needsSubscription = (model: string) => workerOnly && toSpeechModel(model) === SentientSimsAISpeechModel.ORPHEUS;
  const showSubscriptionError = needsSubscription(sentientsimsaiTtsSettings.value.model);
  if (showSubscriptionError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        Orpheus voices need a Sentient Sims subscription. Founders can use the Kokoro voices, or subscribe from{' '}
        {PLAN_TAB}.
      </FormHelperText>,
    );
  }

  // ElevenLabs voices come with Tier 3 and Tier 4
  const includesElevenLabs = membership.canUseElevenLabs();
  const isElevenLabs = isElevenLabsSpeechModel(sentientsimsaiTtsSettings.value.model);
  const isKokoro = sentientsimsaiTtsSettings.value.model === SentientSimsAISpeechModel.KOKORO;
  const showTierError = isElevenLabs && !includesElevenLabs;
  if (showTierError) {
    errors.push(
      <FormHelperText sx={{ marginBottom: 2 }} error>
        ElevenLabs voices need a Tier 3 or Tier 4 Sentient Sims membership. Upgrade from {PLAN_TAB}, or pick Kokoro or
        Orpheus.
      </FormHelperText>,
    );
  }

  const modelLabel = (model: string) => {
    if (needsSubscription(model)) return `${speechModelName(model)} (${SUBSCRIPTION_REQUIRED_LABEL.toLowerCase()})`;
    if (isElevenLabsSpeechModel(model)) {
      return includesElevenLabs
        ? `${speechModelName(model)} (Tier 3 and 4)`
        : `${speechModelName(model)} (needs Tier 3 or 4)`;
    }
    return speechModelName(model);
  };

  const modelMenuItems: any[] = [];
  Object.values(SentientSimsAISpeechModel).forEach((model) =>
    modelMenuItems.push(
      <MenuItem key={model} value={model}>
        {modelLabel(model)}
      </MenuItem>,
    ),
  );

  const voiceLabel = (voice: string) => {
    if (isElevenLabs) return elevenLabsVoiceCatalog.find((v) => v.voiceId === voice)?.name ?? voice;
    return voice in VOICES ? VOICES[voice].name : voice;
  };

  const voiceMenuItems: any[] = [];
  if (isElevenLabs) {
    elevenLabsVoiceCatalog.forEach((voice) => {
      voiceMenuItems.push(
        <MenuItem key={voice.voiceId} value={voice.voiceId}>
          {elevenLabsCatalogVoiceLabel(voice.voiceId)}
        </MenuItem>,
      );
    });
  } else if (!isKokoro) {
    Object.entries(SentientSimsAISpeechOrpheusVoice).forEach((key) => {
      voiceMenuItems.push(
        <MenuItem key={key[1]} value={key[1]}>
          {key[0]}
        </MenuItem>,
      );
    });
  }

  function handleModelChange(model: string) {
    const speechModel = toSpeechModel(model);

    let voice: SentientSimsAISpeechVoice[] = [SentientSimsAISpeechKokoroVoice.Heart];
    if (speechModel === SentientSimsAISpeechModel.ORPHEUS) {
      voice = [SentientSimsAISpeechOrpheusVoice.Tara];
    } else if (speechModel === SentientSimsAISpeechModel.ELEVEN_V4_TURBO) {
      voice = [DEFAULT_SENTIENT_SIMS_AI_ELEVENLABS_VOICE];
    }

    void sentientsimsaiTtsSettings.setSetting({
      model: speechModel,
      voice,
      response_format: sentientsimsaiTtsSettings.value.response_format,
      speed: sentientsimsaiTtsSettings.value.speed,
    });
  }

  function update(change: Partial<SentientSimsAITTSSettings>) {
    void sentientsimsaiTtsSettings.setSetting({ ...sentientsimsaiTtsSettings.value, ...change });
  }

  // Orpheus and ElevenLabs speak with one voice
  function handleSingleVoiceChange(voice: string) {
    update({ voice: [isElevenLabs ? voice : toSpeechVoice(voice)] });
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="subtitle1">Sentient Sims AI TTS</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
        Kokoro and Orpheus voices generated by the Sentient Sims AI service. ElevenLabs v4 Turbo voices come with Tier 3
        and Tier 4.
      </Typography>
      <Box>{errors}</Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
          Speech model
        </Typography>
        <Select
          size="small"
          labelId="tts-models"
          id="tts-models"
          label="TTS Model"
          value={sentientsimsaiTtsSettings.value.model}
          sx={{ width: '100%' }}
          onChange={(change) => {
            handleModelChange(change.target.value);
          }}
        >
          {modelMenuItems}
        </Select>
      </Box>
      {isKokoro ? (
        <>
          <KokoroVoiceSelect
            value={sentientsimsaiTtsSettings.value.voice}
            onChange={(voice) => {
              update({ voice });
            }}
          />
          <KokoroSpeedSlider
            value={sentientsimsaiTtsSettings.value.speed ?? defaultKokoroSpeed}
            onChange={(speed) => {
              update({ speed });
            }}
          />
        </>
      ) : (
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 0.75 }}>
            Speech voice
          </Typography>
          <Select
            size="small"
            labelId="voice"
            id="voice"
            label="Voice"
            value={sentientsimsaiTtsSettings.value.voice[0] ?? ''}
            sx={{ width: '100%' }}
            onChange={(change) => {
              handleSingleVoiceChange(change.target.value);
            }}
            renderValue={(selected) => <Chip label={voiceLabel(selected)} />}
          >
            {voiceMenuItems}
          </Select>
        </Box>
      )}
      <Box sx={{ marginTop: 2.5 }}>
        <TestVoiceButton disabled={showLogInError || showMemberError || showSubscriptionError || showTierError} />
      </Box>
      {tts.error && (
        <Box sx={{ marginTop: 1.5 }}>
          <FormHelperText error>Error: {tts.error}</FormHelperText>
        </Box>
      )}
    </Box>
  );
}
