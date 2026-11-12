import { useCallback } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { defaultKokoroEndpoint } from 'main/sentient-sims/constants';
import { defaultKokoroAITTSSettings, KokoroAITTSSettings } from 'main/sentient-sims/models/KokoroAITTSSettings';
import { defaultKokoroSpeed } from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { buildKokoroSpeechRequest, kokoroBaseUrl, splitSentences } from 'main/sentient-sims/clients/KokoroTTSRequest';
import { fetchSpeechAudio, SpeechFailure } from './fetchSpeechAudio';
import { TTSHook } from './TTSHook';
import { SpeechAudioResult, useSpeechPlayback } from './useSpeechPlayback';

// A local server answers a line in well under a second on a GPU and a few seconds on a
// CPU, so half a minute of silence means the address is wrong or the server is stuck
const kokoroRequestTimeoutMs = 30000;

const maxServerMessageLength = 160;

function kokoroFailureText(failure: SpeechFailure, endpoint: string): string {
  const address = kokoroBaseUrl(endpoint);

  switch (failure.kind) {
    case 'status': {
      const message =
        failure.message.length > maxServerMessageLength
          ? `${failure.message.slice(0, maxServerMessageLength)}…`
          : failure.message;
      return `The Kokoro server returned an error (${failure.status})${message ? `: ${message}` : ''}`;
    }
    case 'not-audio':
      return `The server at ${address} answered, but not with audio. Check that the address points to a Kokoro server.`;
    case 'timeout':
      return `The Kokoro server at ${address} did not answer within ${kokoroRequestTimeoutMs / 1000} seconds.`;
    default:
      return `No Kokoro server answered at ${address}. Start your Kokoro server, or check the address.`;
  }
}

/**
 * Text to speech through a self-hosted Kokoro server (an OpenAI-compatible
 * /v1/audio/speech endpoint such as Kokoro-FastAPI). No account and no usage reporting.
 */
export function useKokoroTTS(): TTSHook {
  const kokoroEndpointSetting = useSetting<string>(SettingsEnum.KOKOROAI_ENDPOINT, defaultKokoroEndpoint);
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const fetchAudio = useCallback(
    async (text: string, voice: string[]): Promise<SpeechAudioResult> => {
      const request = buildKokoroSpeechRequest({
        endpoint: kokoroEndpointSetting.value,
        text,
        voice,
        model: kokoroTTSSettings.value.model,
        responseFormat: kokoroTTSSettings.value.response_format,
        speed: kokoroTTSSettings.value.speed ?? defaultKokoroSpeed,
      });
      const startedAt = Date.now();
      log.info(`[TTS] Kokoro request voice=${request.body.voice} chars=${text.length}`);

      const fetched = await fetchSpeechAudio({ ...request, timeoutMs: kokoroRequestTimeoutMs });
      const outcome = 'url' in fetched ? 'audio' : fetched.failure.kind;
      log.info(`[TTS] Kokoro response voice=${request.body.voice} ${outcome} in ${Date.now() - startedAt}ms`);

      if ('url' in fetched) return fetched;
      return { error: kokoroFailureText(fetched.failure, kokoroEndpointSetting.value) };
    },
    [kokoroEndpointSetting.value, kokoroTTSSettings.value],
  );

  const toSentences = useCallback((text: string) => Promise.resolve(splitSentences(text)), []);

  return useSpeechPlayback({
    pool: kokoroTTSSettings.value.voice,
    noVoiceError: 'At least one Kokoro voice must be selected',
    fetchAudio,
    toSentences,
  });
}
