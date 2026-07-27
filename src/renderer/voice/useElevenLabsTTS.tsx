import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint, subtitleLinePacingMs } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import { defaultElevenLabsTTSSettings, ElevenLabsTTSSettings } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { buildElevenLabsSpeechRequest, elevenLabsLineText } from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
import { elevenLabsErrorMessage } from 'main/sentient-sims/clients/ElevenLabsError';
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
      const { url, headers, body } = buildElevenLabsSpeechRequest({
        text,
        voiceId,
        endpoint: elevenLabsEndpointSetting.value,
        apiKey: elevenLabsKeySetting.value,
        settings: elevenLabsTTSSettings.value,
      });

      log.debug(`URL: ${url} Body: ${JSON.stringify(body, null, 2)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(elevenLabsErrorMessage(response.status, await response.text().catch(() => '')));
      }

      return URL.createObjectURL(await response.blob());
    },
    [elevenLabsEndpointSetting.value, elevenLabsKeySetting.value, elevenLabsTTSSettings.value],
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
    async (lines: DialogueLine[], onLineStart?: (line: DialogueLine) => void): Promise<void> => {
      setError(undefined);
      playSessionRef.current += 1;
      const session = playSessionRef.current;

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (playSessionRef.current !== session) break;
        if (!line.text.trim()) continue;

        const text = elevenLabsLineText(line, elevenLabsTTSSettings.value.model);
        const voiceId = line.voiceId ?? elevenLabsTTSSettings.value.voice;
        const lineStartedAt = Date.now();

        try {
          const audioUrl = await fetchAudioUrl(text, voiceId);
          if (playSessionRef.current !== session) {
            URL.revokeObjectURL(audioUrl);
            break;
          }
          onLineStart?.(line);
          await playUrl(audioUrl);
        } catch (err: any) {
          const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
          log.error(errorMessage);
          setError(errorMessage);
        }

        // Subtitle pacing: hold before the next line so line starts stay spaced apart
        if (i < lines.length - 1 && playSessionRef.current === session) {
          const holdMs = subtitleLinePacingMs - (Date.now() - lineStartedAt);
          if (holdMs > 0) {
            await new Promise((resolve) => {
              setTimeout(resolve, holdMs);
            });
          }
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
