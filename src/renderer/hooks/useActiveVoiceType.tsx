import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { voiceTypeForTTS, VoiceType } from 'main/sentient-sims/models/VoiceType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import useSetting from './useSetting';

/**
 * The voice type (per-sim voice pool) the active TTS setup speaks with, or undefined
 * for setups without per-sim voices. Drives which pinned voice the Sims tab shows and edits.
 */
export function useActiveVoiceType(): VoiceType | undefined {
  const aiSettings = useAISettings();
  const sentientSimsAITTSSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  return voiceTypeForTTS(aiSettings.ttsApiType, sentientSimsAITTSSettings.value.model);
}
