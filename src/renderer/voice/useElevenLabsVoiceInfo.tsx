import { useCallback, useEffect, useRef, useState } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint } from 'main/sentient-sims/constants';
import {
  buildElevenLabsVoiceRequest,
  ElevenLabsVoiceInfo,
  ElevenLabsVoiceResponse,
  toElevenLabsVoiceInfo,
} from 'main/sentient-sims/clients/ElevenLabsVoiceRequest';
import { elevenLabsErrorMessage } from 'main/sentient-sims/clients/ElevenLabsError';
import { defaultElevenLabsTTSSettings, ElevenLabsTTSSettings } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import useSetting from 'renderer/hooks/useSetting';

export type ElevenLabsVoiceInfoHook = {
  voice?: ElevenLabsVoiceInfo;
  error?: string;
  isLoading: boolean;
  loadVoice: (voiceId: string) => Promise<void>;
};

export function useElevenLabsVoiceInfo(): ElevenLabsVoiceInfoHook {
  const elevenLabsKeySetting = useSetting<string>(SettingsEnum.ELEVENLABS_KEY, '');
  const elevenLabsEndpointSetting = useSetting<string>(SettingsEnum.ELEVENLABS_ENDPOINT, defaultElevenLabsEndpoint);
  const elevenLabsTTSSettings = useSetting<ElevenLabsTTSSettings>(
    SettingsEnum.ELEVENLABS_TTS_SETTINGS,
    defaultElevenLabsTTSSettings,
  );
  const [voice, setVoice] = useState<ElevenLabsVoiceInfo | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchVoice = useCallback(
    async (voiceId: string): Promise<ElevenLabsVoiceInfo> => {
      const { url, headers } = buildElevenLabsVoiceRequest({
        voiceId,
        endpoint: elevenLabsEndpointSetting.value,
        apiKey: elevenLabsKeySetting.value,
      });

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? `No voice found for ID ${voiceId}`
            : elevenLabsErrorMessage(response.status, await response.text().catch(() => '')),
        );
      }

      return toElevenLabsVoiceInfo(voiceId, (await response.json()) as ElevenLabsVoiceResponse);
    },
    [elevenLabsEndpointSetting.value, elevenLabsKeySetting.value],
  );

  const loadVoice = useCallback(
    async (voiceId: string): Promise<void> => {
      setError(undefined);

      if (!voiceId.trim()) {
        setVoice(undefined);
        setError('Enter a voice ID first');
        return;
      }

      if (!elevenLabsKeySetting.value.trim()) {
        setVoice(undefined);
        setError('Add your ElevenLabs key below to look up voices');
        return;
      }

      setIsLoading(true);
      try {
        setVoice(await fetchVoice(voiceId.trim()));
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log.error(`Unable to look up ElevenLabs voice: ${errorMessage}`);
        setVoice(undefined);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [elevenLabsKeySetting.value, fetchVoice],
  );

  // Fills the card for the saved voice as soon as settings arrive. The user didn't ask for this
  // lookup, so failures stay silent (no spinner, no error) — clicking Test runs loadVoice, which
  // does surface them.
  const autoLoadAttemptedRef = useRef(false);
  useEffect(() => {
    if (
      autoLoadAttemptedRef.current ||
      elevenLabsKeySetting.isLoading ||
      elevenLabsEndpointSetting.isLoading ||
      elevenLabsTTSSettings.isLoading
    ) {
      return;
    }
    autoLoadAttemptedRef.current = true;

    const voiceId = elevenLabsTTSSettings.value.voice.trim();
    if (!voiceId || !elevenLabsKeySetting.value.trim()) {
      return;
    }

    const prefill = async () => {
      try {
        setVoice(await fetchVoice(voiceId));
      } catch (err) {
        log.error(`Unable to prefill ElevenLabs voice card: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    void prefill();
  }, [
    elevenLabsKeySetting.isLoading,
    elevenLabsKeySetting.value,
    elevenLabsEndpointSetting.isLoading,
    elevenLabsTTSSettings.isLoading,
    elevenLabsTTSSettings.value.voice,
    fetchVoice,
  ]);

  return { voice, error, isLoading, loadVoice };
}
