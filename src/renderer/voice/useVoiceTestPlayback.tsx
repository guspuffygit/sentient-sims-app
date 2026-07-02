import { useCallback } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { defaultSentientSimsAIHost } from 'main/sentient-sims/constants';
import {
  defaultSentientSimsAITTSSettings,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { parseDialogueLines } from 'main/sentient-sims/formatter/PromptFormatter';
import { assignVoicesToSpeakers } from 'main/sentient-sims/formatter/VoiceAssignment';

export type VoiceTestLine = {
  speaker: string;
  text: string;
  voice: string;
  audioUrl?: string;
  loading: boolean;
  error?: string;
};

/**
 * Dev-mode-only helper for the Chat testing page: parses a chat response into per-character
 * dialogue lines, assigns each speaker a voice from the configured SentientSimsAI voice pool,
 * and fetches real TTS audio for each line so it can be played back with a click (no auto-play).
 */
export function useVoiceTestPlayback() {
  const sentientSimsAIEndpointSetting = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    defaultSentientSimsAIHost,
  );
  const sentientSimsAITokenSetting = useSetting<string>(SettingsEnum.ACCESS_TOKEN, '');
  const sentientSimsAITTSSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const fetchLineAudio = useCallback(
    async (text: string, voice: string): Promise<string> => {
      const url = `${sentientSimsAIEndpointSetting.value}/v2/audio/speech`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': sentientSimsAITokenSetting.value,
          'sentient-sims-model': sentientSimsAITTSSettings.value.model,
        },
        body: JSON.stringify({
          model: sentientSimsAITTSSettings.value.model,
          input: text,
          voice,
          response_format: sentientSimsAITTSSettings.value.response_format,
          speed: sentientSimsAITTSSettings.value.speed ?? defaultSentientSimsAITTSSettings.speed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Unable to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
    [sentientSimsAIEndpointSetting.value, sentientSimsAITokenSetting.value, sentientSimsAITTSSettings.value],
  );

  const buildVoiceTestLines = useCallback(
    (text: string): VoiceTestLine[] => {
      const dialogueLines = parseDialogueLines(text);
      const pool = sentientSimsAITTSSettings.value.voice;
      const assignments = assignVoicesToSpeakers(
        dialogueLines.map((line) => line.speaker),
        pool,
      );

      return dialogueLines.map((line) => ({
        speaker: line.speaker,
        text: line.text,
        voice: (assignments.get(line.speaker) ?? pool).join('+'),
        loading: true,
      }));
    },
    [sentientSimsAITTSSettings.value],
  );

  const fetchVoiceLines = useCallback(
    async (text: string, onUpdate: (lines: VoiceTestLine[]) => void): Promise<void> => {
      const lines = buildVoiceTestLines(text);
      if (lines.length === 0) return;

      if (!sentientSimsAITokenSetting.value) {
        log.error('Voice test mode: no SentientSimsAI access token configured, skipping TTS fetch');
        onUpdate(
          lines.map((line) => ({
            ...line,
            loading: false,
            error: 'No Sentient Sims access token configured (log in via Patreon in Settings)',
          })),
        );
        return;
      }

      onUpdate(lines);

      for (let i = 0; i < lines.length; i += 1) {
        try {
          const audioUrl = await fetchLineAudio(lines[i].text, lines[i].voice);
          lines[i] = { ...lines[i], audioUrl, loading: false };
        } catch (err) {
          log.error('Voice test mode: failed to fetch line audio', err);
          lines[i] = {
            ...lines[i],
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
        onUpdate([...lines]);
      }
    },
    [buildVoiceTestLines, fetchLineAudio, sentientSimsAITokenSetting.value],
  );

  return { fetchVoiceLines };
}
