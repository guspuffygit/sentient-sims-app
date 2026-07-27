import { DialogueLine } from '../formatter/PromptFormatter';
import {
  defaultElevenLabsVoiceSettings,
  ElevenLabsSpeechModel,
  ElevenLabsTTSSettings,
} from '../models/ElevenLabsTTSSettings';

export type ElevenLabsSpeechRequest = {
  url: string;
  headers: Record<string, string>;
  body: {
    text: string;
    model_id: string;
    voice_settings: {
      stability: number;
      similarity_boost: number;
      speed: number;
    };
  };
};

export function isElevenLabsV3(model: string): boolean {
  return model === ElevenLabsSpeechModel.ELEVEN_V3.toString();
}

/**
 * The text to actually send for a dialogue line. v3 understands inline audio tags like
 * [nervous], so a parenthetical delivery note becomes one; older models would read the
 * note aloud, so they only ever get the spoken text.
 */
export function elevenLabsLineText(line: DialogueLine, model: string): string {
  return isElevenLabsV3(model) && line.deliveryNote ? `[${line.deliveryNote}] ${line.text}` : line.text;
}

/**
 * Builds the ElevenLabs text-to-speech call. `model_id` matters: without it the API falls
 * back to its own default and the configured model is silently ignored.
 */
export function buildElevenLabsSpeechRequest(params: {
  text: string;
  voiceId: string;
  endpoint: string;
  apiKey: string;
  settings: ElevenLabsTTSSettings;
}): ElevenLabsSpeechRequest {
  const { text, voiceId, endpoint, apiKey, settings } = params;

  return {
    url: `${endpoint}/text-to-speech/${voiceId}`,
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: {
      text,
      model_id: settings.model,
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
        // Supported on all models including v3; API range is 0.7-1.2
        speed: settings.voice_settings?.speed ?? defaultElevenLabsVoiceSettings.speed,
      },
    },
  };
}
