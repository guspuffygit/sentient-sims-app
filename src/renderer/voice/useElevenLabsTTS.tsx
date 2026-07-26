import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultElevenLabsEndpoint, sceneLineGapMs, sceneLineReadingHoldMs } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultElevenLabsTTSSettings,
  defaultElevenLabsVoiceSettings,
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
          // Supported on all models including v3; API range is 0.7-1.2
          speed: elevenLabsTTSSettings.value.voice_settings?.speed ?? defaultElevenLabsVoiceSettings.speed,
        },
      };

      const url = `${elevenLabsEndpointSetting.value}/text-to-speech/${voiceId}`;
      const startedAt = Date.now();
      log.info(`[TTS] ElevenLabs request voice=${voiceId} model=${requestBody.model_id} chars=${text.length}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKeySetting.value,
        },
        body: JSON.stringify(requestBody),
      });
      log.info(`[TTS] ElevenLabs response voice=${voiceId} status=${response.status} in ${Date.now() - startedAt}ms`);

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
    [
      elevenLabsEndpointSetting.value,
      elevenLabsKeySetting.value,
      elevenLabsTTSSettings.value.model,
      elevenLabsTTSSettings.value.voice_settings?.speed,
    ],
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

      const isV3 = elevenLabsTTSSettings.value.model.toString() === ElevenLabsSpeechModel.ELEVEN_V3.toString();

      const speakable = lines.filter((line) => line.text.trim());

      // Conversation pacing: each line runs for exactly its audio's duration, with the
      // next line's audio prefetched while this one plays so lines flow back-to-back
      const fetchLine = (line: DialogueLine): Promise<string | null> => {
        // v3 understands inline audio tags like [nervous] — use the delivery note as one
        const text = isV3 && line.deliveryNote ? `[${line.deliveryNote}] ${line.text}` : line.text;
        const voiceId = line.voiceId ?? elevenLabsTTSSettings.value.voice;
        // Voice inconsistencies are only debuggable if the cast is visible in the log
        log.info(`[TTS] Line for ${line.speaker}: voice=${voiceId}${line.voiceId ? '' : ' (default, no cast voice)'}`);
        return fetchAudioUrl(text, voiceId).catch((err: unknown) => {
          const errorMessage = `TTS request failed: ${err instanceof Error ? err.message : String(err)}`;
          log.error(errorMessage);
          setError(errorMessage);
          return null;
        });
      };
      const audioPromises: (Promise<string | null> | undefined)[] = [];
      const startFetch = (index: number) => {
        if (index < speakable.length && !audioPromises[index]) {
          audioPromises[index] = fetchLine(speakable[index]);
        }
      };
      startFetch(0);

      for (let i = 0; i < speakable.length; i += 1) {
        if (playSessionRef.current !== session) break;
        startFetch(i + 1);
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
