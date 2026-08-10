import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint, sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import { defaultElevenLabsTTSSettings, ElevenLabsTTSSettings } from 'main/sentient-sims/models/ElevenLabsTTSSettings';
import { buildElevenLabsSpeechRequest, elevenLabsLineText } from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
import { elevenLabsErrorMessage } from 'main/sentient-sims/clients/ElevenLabsError';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { AudioPlaybackHandle, playAudioStream, playAudioUrl } from './audioPlayback';
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

  const buildRequest = useCallback(
    (text: string, voiceId: string) =>
      buildElevenLabsSpeechRequest({
        text,
        voiceId,
        endpoint: elevenLabsEndpointSetting.value,
        apiKey: elevenLabsKeySetting.value,
        settings: elevenLabsTTSSettings.value,
      }),
    [elevenLabsEndpointSetting.value, elevenLabsKeySetting.value, elevenLabsTTSSettings.value],
  );

  const fetchAudioUrl = useCallback(
    async (text: string, voiceId: string): Promise<string> => {
      const { url, headers, body } = buildRequest(text, voiceId);
      const startedAt = Date.now();
      log.info(
        `[TTS] ElevenLabs request voice=${voiceId} model=${elevenLabsTTSSettings.value.model} chars=${text.length}`,
      );

      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      log.info(`[TTS] ElevenLabs response voice=${voiceId} status=${response.status} in ${Date.now() - startedAt}ms`);

      if (!response.ok) {
        throw new Error(elevenLabsErrorMessage(response.status, await response.text().catch(() => '')));
      }

      return URL.createObjectURL(await response.blob());
    },
    [buildRequest, elevenLabsTTSSettings.value.model],
  );

  // The /stream endpoint starts returning audio bytes ~0.6-0.8s in even on v3 (vs ~2-4s
  // for the whole file), so the first spoken line can start playing 1-3s sooner.
  const fetchAudioStream = useCallback(
    async (text: string, voiceId: string): Promise<ReadableStream<Uint8Array>> => {
      const { url, headers, body } = buildRequest(text, voiceId);
      const startedAt = Date.now();
      log.info(
        `[TTS] ElevenLabs stream request voice=${voiceId} model=${elevenLabsTTSSettings.value.model} chars=${text.length}`,
      );

      const response = await fetch(`${url}/stream`, { method: 'POST', headers, body: JSON.stringify(body) });
      log.info(
        `[TTS] ElevenLabs stream first byte voice=${voiceId} status=${response.status} in ${Date.now() - startedAt}ms`,
      );

      if (!response.ok || !response.body) {
        throw new Error(elevenLabsErrorMessage(response.status, await response.text().catch(() => '')));
      }

      return response.body;
    },
    [buildRequest, elevenLabsTTSSettings.value.model],
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

  const playStream = useCallback(
    async (stream: ReadableStream<Uint8Array>): Promise<void> => {
      try {
        const handle = await playAudioStream(stream, aiSettings.ttsVolume);
        setPlayback(handle); // Store reference for stopping
        await handle.finished;
      } finally {
        setPlayback(null);
      }
    },
    [aiSettings.ttsVolume],
  );

  const tts = useCallback(
    async (text: string): Promise<void> => {
      setError(undefined);

      if (!text.trim()) return;

      try {
        await playStream(await fetchAudioStream(text, elevenLabsTTSSettings.value.voice));
      } catch (err: any) {
        const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
        log.error(errorMessage);
        setError(errorMessage);
      }
    },
    [fetchAudioStream, playStream, elevenLabsTTSSettings.value.voice],
  );

  const speakLines = useCallback(
    async (lines: DialogueLine[], onLineStart?: (line: DialogueLine) => void): Promise<void> => {
      setError(undefined);
      playSessionRef.current += 1;
      const session = playSessionRef.current;

      const speakable = lines.filter((line) => line.text.trim());

      const lineText = (line: DialogueLine): string => elevenLabsLineText(line, elevenLabsTTSSettings.value.model);
      const lineVoice = (line: DialogueLine): string => {
        const voiceId = line.voiceId ?? elevenLabsTTSSettings.value.voice;
        // Voice inconsistencies are only debuggable if the cast is visible in the log
        log.info(`[TTS] Line for ${line.speaker}: voice=${voiceId}${line.voiceId ? '' : ' (default, no cast voice)'}`);
        return voiceId;
      };

      // Conversation pacing: each line runs for exactly its audio's duration. The first
      // line streams (playback starts on the first audio chunk); later lines prefetch
      // as full files while the previous line plays, so lines flow back-to-back.
      const fetchLine = (line: DialogueLine): Promise<string | null> =>
        fetchAudioUrl(lineText(line), lineVoice(line)).catch((err: unknown) => {
          const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
          log.error(errorMessage);
          setError(errorMessage);
          return null;
        });
      const audioPromises: (Promise<string | null> | undefined)[] = [];
      const startFetch = (index: number) => {
        if (index > 0 && index < speakable.length && !audioPromises[index]) {
          audioPromises[index] = fetchLine(speakable[index]);
        }
      };

      for (let i = 0; i < speakable.length; i += 1) {
        if (playSessionRef.current !== session) break;
        startFetch(i + 1);

        let played = false;
        if (i === 0) {
          try {
            const stream = await fetchAudioStream(lineText(speakable[0]), lineVoice(speakable[0]));
            if (playSessionRef.current !== session) {
              stream.cancel().catch(() => {});
              break;
            }
            onLineStart?.(speakable[0]);
            await playStream(stream);
            played = true;
          } catch (err: any) {
            // Fall back to the buffered path below
            const errorMessage = `TTS stream failed, retrying buffered: ${err instanceof Error ? err.message : String(err)}`;
            log.error(errorMessage);
            audioPromises[0] = fetchLine(speakable[0]);
          }
        }

        if (!played) {
          if (!audioPromises[i]) audioPromises[i] = fetchLine(speakable[i]);
          const audioUrl = (await audioPromises[i]) ?? null;
          if (playSessionRef.current !== session) {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            break;
          }

          onLineStart?.(speakable[i]);
          if (audioUrl) {
            try {
              await playUrl(audioUrl);
            } catch (err: any) {
              const errorMessage = `TTS playback failed: ${err instanceof Error ? err.message : String(err)}`;
              log.error(errorMessage);
              setError(errorMessage);
            }
          } else {
            // No audio to time the subtitle — hold for its reading time instead
            await new Promise((resolve) => {
              setTimeout(resolve, sceneLineReadingHoldMs(speakable[i].text));
            });
          }
        }

        if (i < speakable.length - 1 && playSessionRef.current === session) {
          await new Promise((resolve) => {
            setTimeout(resolve, sceneLineGapMs);
          });
        }
      }

      // Release any prefetched audio that never played (cancelled session)
      const leftovers = await Promise.allSettled(audioPromises.filter(Boolean) as Promise<string | null>[]);
      leftovers.forEach((settled) => {
        if (settled.status === 'fulfilled' && settled.value && playSessionRef.current !== session) {
          URL.revokeObjectURL(settled.value);
        }
      });
    },
    [
      fetchAudioUrl,
      fetchAudioStream,
      playUrl,
      playStream,
      elevenLabsTTSSettings.value.voice,
      elevenLabsTTSSettings.value.model,
    ],
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
