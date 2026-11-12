import { reportUsageHeader } from 'renderer/billing/reportUsageHeader';
import { useCallback } from 'react';
import log from 'electron-log';
import axios from 'axios';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import useSetting from 'renderer/hooks/useSetting';
import { defaultSentientSimsAIHost } from 'main/sentient-sims/constants';
import {
  defaultSentientSimsAITTSSettings,
  isElevenLabsSpeechModel,
  SentientSimsAITTSSettings,
} from 'main/sentient-sims/models/SentientSimsAITTSSettings';
import { dialogueContext, elevenLabsLineText } from 'main/sentient-sims/clients/ElevenLabsTTSRequest';
import { axiosClient } from 'main/sentient-sims/clients/AxiosClient';
import { SentenceTokenizeResponse } from 'main/sentient-sims/models/SentenceTokenizeResponse';
import { SentenceTokenizeRequest } from 'main/sentient-sims/models/SentenceTokenizerRequest';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { fetchSpeechAudio, SpeechFailure } from './fetchSpeechAudio';
import { TTSHook } from './TTSHook';
import { LineContext, SpeechAudioResult, useSpeechPlayback } from './useSpeechPlayback';

// Matches the sentence tokenizer's limit, and stays under the mod's 80 second timeout
const requestTimeoutMs = 65000;

function failureText(failure: SpeechFailure): string {
  switch (failure.kind) {
    case 'status':
      return failure.message || `Unable to fetch audio: ${failure.status}`;
    case 'not-audio':
      return 'TTS server returned a non-audio response';
    case 'timeout':
      return `TTS request failed: no answer within ${requestTimeoutMs / 1000} seconds`;
    default:
      return `TTS request failed: ${failure.reason}`;
  }
}

export function useSentientSimsTTS(): TTSHook {
  const sentientSimsAIEndpointSetting = useSetting<string>(
    SettingsEnum.SENTIENTSIMSAI_ENDPOINT,
    defaultSentientSimsAIHost,
  );
  const sentientSimsAITokenSetting = useSetting<string>(SettingsEnum.ACCESS_TOKEN, '');
  const sentientSimsAITTSSettings = useSetting<SentientSimsAITTSSettings>(
    SettingsEnum.SENTIENTSIMSAI_TTS_SETTINGS,
    defaultSentientSimsAITTSSettings,
  );

  const fetchAudio = useCallback(
    async (text: string, voice: string[], context?: LineContext): Promise<SpeechAudioResult> => {
      const { model } = sentientSimsAITTSSettings.value;
      const body = isElevenLabsSpeechModel(model)
        ? {
            model,
            input: text,
            voice: voice[0],
            response_format: sentientSimsAITTSSettings.value.response_format,
            previous_text: dialogueContext(context?.previousText, 'previous'),
            next_text: dialogueContext(context?.nextText, 'next'),
          }
        : {
            model,
            input: text,
            voice: voice.join('+'),
            response_format: sentientSimsAITTSSettings.value.response_format,
            speed: sentientSimsAITTSSettings.value.speed ?? defaultSentientSimsAITTSSettings.speed,
          };

      const fetched = await fetchSpeechAudio({
        url: `${sentientSimsAIEndpointSetting.value}/v2/audio/speech`,
        headers: {
          'Content-Type': 'application/json',
          'Authentication': sentientSimsAITokenSetting.value,
          'sentient-sims-model': model,
          'X-Sentient-Sims-Purpose': 'tts',
        },
        body,
        timeoutMs: requestTimeoutMs,
        onResponse: reportUsageHeader,
      });

      if ('url' in fetched) return fetched;
      return { error: failureText(fetched.failure) };
    },
    [sentientSimsAITTSSettings.value, sentientSimsAIEndpointSetting.value, sentientSimsAITokenSetting.value],
  );

  const toSentences = useCallback(
    async (text: string): Promise<string[]> => {
      try {
        const request: SentenceTokenizeRequest = { paragraph: text };
        const response = await axiosClient<SentenceTokenizeResponse>({
          url: '/sent-tokenize',
          method: 'POST',
          data: request,
          baseURL: sentientSimsAIEndpointSetting.value,
          headers: { Authentication: sentientSimsAITokenSetting.value },
          timeout: requestTimeoutMs,
        });
        return response.data.sentences;
      } catch (err) {
        const errorMessage = `Sentence tokenization failed: ${err instanceof Error ? err.message : String(err)}`;
        const responseData: unknown = axios.isAxiosError(err) ? err.response?.data : undefined;
        log.error(errorMessage, responseData);
        throw new Error(errorMessage, { cause: err });
      }
    },
    [sentientSimsAIEndpointSetting.value, sentientSimsAITokenSetting.value],
  );

  // ElevenLabs reads the neighbouring lines to carry tone across a scene
  const lineRequest = useCallback(
    (lines: DialogueLine[], index: number) => {
      const { model } = sentientSimsAITTSSettings.value;
      if (!isElevenLabsSpeechModel(model)) {
        return { text: lines[index].text };
      }
      return {
        text: elevenLabsLineText(lines[index], model),
        context: { previousText: lines[index - 1]?.text, nextText: lines[index + 1]?.text },
      };
    },
    [sentientSimsAITTSSettings.value],
  );

  return useSpeechPlayback({
    pool: sentientSimsAITTSSettings.value.voice,
    noVoiceError: 'At least one Sentient Sims Voice must be selected',
    fetchAudio,
    toSentences,
    lineRequest,
  });
}
