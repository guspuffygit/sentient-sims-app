import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultElevenLabsTTSSettings,
  ElevenLabsSpeechModel,
  ElevenLabsTTSSettings,
} from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { AudioPlaybackHandle, playAudioUrl } from './audioPlayback';
import { TTSHook } from './TTSHook';

export function useElevenLabsTTS(): TTSHook {
  const aiSettings = useAISettings();
  const elevenLabsKeySetting = useSetting<string>(SettingsEnum.ELEVENLABS_KEY, '');
  const elevenLabsEndpointSetting = useSetting<string>(SettingsEnum.ELEVENLABS_ENDPOINT, defaultElevenLabsEndpoint);
  const elevenLabsTTSSettings = useSetting<ElevenLabsTTSSettings>(
    SettingsEnum.ELEVENLABS_TTS_SETTINGS,
    defaultElevenLabsTTSSettings,
  );
  const [playback, setPlayback] = useState<AudioPlaybackHandle | null>(null);
  const [error, setError] = useState<string | undefined>();
  // Bumped by stop() and by each new speakLines run so an in-flight loop knows to bail out
  const playSessionRef = useRef(0);

  const fetchAudioUrl = useCallback(
    async (text: string, voiceId: string): Promise<string> => {
      const requestBody = {
        text,
        model_id: elevenLabsTTSSettings.value.model,
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
        },
      };

      const url = `${elevenLabsEndpointSetting.value}/text-to-speech/${voiceId}`;
      log.debug(`URL: ${url} Body: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKeySetting.value,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Unable to stream audio: ${response.status}`;
        try {
          errorMessage = await response.text();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: any) {
          // keep the status message
        }
        throw new Error(errorMessage);
      }

      return URL.createObjectURL(await response.blob());
    },
    [elevenLabsEndpointSetting.value, elevenLabsKeySetting.value, elevenLabsTTSSettings.value.model],
  );

  const playUrl = useCallback(
    async (audioUrl: string): Promise<void> => {
      try {
        const handle = await playAudioUrl(audioUrl, aiSettings.ttsVolume);
        setPlayback(handle); // Store reference for stopping
        await handle.finished;
      } finally {
        setPlayback(null);
        URL.revokeObjectURL(audioUrl);
      }
    },
    [aiSettings.ttsVolume],
  );

  const tts = useCallback(
    async (text: string): Promise<void> => {
      setError(undefined);

      if (!text.trim()) return;

      try {
        const audioUrl = await fetchAudioUrl(text, elevenLabsTTSSettings.value.voice);
        await playUrl(audioUrl);
      } catch (err: any) {
        const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
        log.error(errorMessage);
        setError(errorMessage);
      }
    },
    [fetchAudioUrl, playUrl, elevenLabsTTSSettings.value.voice],
  );

  const speakLines = useCallback(
    async (lines: DialogueLine[]): Promise<void> => {
      setError(undefined);
      playSessionRef.current += 1;
      const session = playSessionRef.current;

      const isV3 = elevenLabsTTSSettings.value.model.toString() === ElevenLabsSpeechModel.ELEVEN_V3.toString();

      for (const line of lines) {
        if (playSessionRef.current !== session) break;
        if (!line.text.trim()) continue;

        // v3 understands inline audio tags like [nervous] — use the delivery note as one
        const text = isV3 && line.deliveryNote ? `[${line.deliveryNote}] ${line.text}` : line.text;
        const voiceId = line.voiceId ?? elevenLabsTTSSettings.value.voice;

        try {
          const audioUrl = await fetchAudioUrl(text, voiceId);
          if (playSessionRef.current !== session) {
            URL.revokeObjectURL(audioUrl);
            break;
          }
          await playUrl(audioUrl);
        } catch (err: any) {
          const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
          log.error(errorMessage);
          setError(errorMessage);
        }
      }
    },
    [fetchAudioUrl, playUrl, elevenLabsTTSSettings.value.voice, elevenLabsTTSSettings.value.model],
  );

  const stopTTS = useCallback(() => {
    playSessionRef.current += 1;
    if (playback) {
      playback.stop();
      setPlayback(null);
    }
  }, [playback]);

  return { speak: tts, speakLines, stop: stopTTS, isPlaying: !!playback, error };
}
