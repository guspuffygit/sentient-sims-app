import log from 'electron-log';
import { AxiosError } from 'axios';
import OpenAI, { toFile } from 'openai';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { ApiContext } from './ApiContext';
import { AIHealthCheckResponse } from '../models/AIHealthCheckResponse';
import { ApiType } from '../models/ApiType';
import { VoiceInputProvider, voiceInputProviderName } from '../models/VoiceInputProvider';
import { isOpenRouterEndpoint, openrouterAttributionHeaders } from '../models/OpenRouterModels';
import { VOICE_INPUT_LANGUAGES } from '../models/VoiceInputLanguages';
import { buildTranscriptionPrompt, isPromptEcho } from '../util/nameCorrection';
import { getRandomItem } from '../util/getRandomItem';
import { plainKeyTestError } from '../util/providerErrorWords';

export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

// The server answers a bad request with its reason in the body
function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const reason = (error.response?.data as { error?: unknown; message?: unknown } | undefined) ?? {};
    if (typeof reason.error === 'string') {
      return reason.error;
    }
    if (typeof reason.message === 'string') {
      return reason.message;
    }
  }
  return error instanceof Error ? error.message : String(error);
}

// Local whisper servers ignore auth entirely; a placeholder keeps the SDK happy there
// while a real endpoint rejects it with a clear 401
const noKey = 'not-set';

const requestTimeoutMs = 30000;

const geminiSafetySettings = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_NONE }));

// Speech-to-text for the player's voice. OpenAI, OpenRouter and any custom server share
// the OpenAI /audio/transcriptions wire format and differ only in endpoint, key and
// model, so one cached OpenAI client serves all three. Gemini has no speech endpoint and
// is handed the audio inline by a text model. Sentient Sims AI speaks its own JSON
// request and login token.
export class TranscriptionService {
  private readonly ctx: ApiContext;

  private client?: OpenAI;

  private clientConfig?: string;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  get provider(): VoiceInputProvider {
    return this.ctx.settings.voiceInputProvider;
  }

  private connection(provider: VoiceInputProvider): { baseURL: string; apiKey: string } {
    const { settings } = this.ctx;
    switch (provider) {
      case ApiType.OpenAI:
        return {
          baseURL: settings.openaiEndpoint,
          apiKey: settings.openaiKey || process.env.OPENAI_KEY || noKey,
        };
      case ApiType.OpenRouter:
        return {
          baseURL: settings.openrouterEndpoint,
          apiKey: settings.openrouterKey || process.env.OPENROUTER_KEY || noKey,
        };
      default:
        return { baseURL: settings.voiceInputEndpoint, apiKey: settings.voiceInputKey || noKey };
    }
  }

  private getClient(provider: VoiceInputProvider): OpenAI {
    const { baseURL, apiKey } = this.connection(provider);
    const clientConfig = `${baseURL}:${apiKey}`;
    if (!this.client || this.clientConfig !== clientConfig) {
      this.client = new OpenAI({
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
        apiKey,
        baseURL,
        timeout: requestTimeoutMs,
        maxRetries: 0,
        defaultHeaders: isOpenRouterEndpoint(baseURL) ? openrouterAttributionHeaders : undefined,
      });
      this.clientConfig = clientConfig;
    }

    return this.client;
  }

  private geminiKeys(): string[] {
    return (this.ctx.settings.geminiKeys || '')
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  private getGeminiClient(): GoogleGenAI {
    const keys = this.geminiKeys();
    if (keys.length === 0) {
      throw new TranscriptionError('No Gemini API key set, add one under AI settings');
    }
    return new GoogleGenAI({ apiKey: getRandomItem(keys) });
  }

  // V-7: the names in play, tightest scope first (on-lot sims, then everyone the
  // household knows, then the current location), as a soft transcription bias
  namePrompt(): string | undefined {
    try {
      const report = this.ctx.simStateCache.getReport();
      const onLot = (report?.sims ?? []).map((entry) => entry.sim_name ?? '').filter(Boolean);
      const known = (report?.known_sims ?? []).map((sim) => sim.name ?? '').filter(Boolean);
      const perceived = (report?.sims ?? [])
        .flatMap((entry) => entry.sims.map((sim) => sim.name ?? ''))
        .filter(Boolean);
      let participants: string[] = [];
      try {
        participants = this.ctx.participantRepository.getAllParticipants().map((participant) => participant.name ?? '');
      } catch {
        participants = [];
      }
      let locations: string[] = [];
      try {
        const lotId = report?.lot?.zone_id;
        if (lotId !== undefined) {
          locations = this.ctx.locationRepository
            .getAllLocations()
            .filter((location) => String(location.id) === String(lotId))
            .map((location) => location.name);
        }
      } catch {
        locations = [];
      }
      return buildTranscriptionPrompt([onLot, perceived, known, participants, locations]);
    } catch {
      return undefined;
    }
  }

  async transcribe(
    audio: ArrayBuffer,
    mimeType = 'audio/webm',
    options: { namePrompt?: boolean } = {},
  ): Promise<string> {
    const language = this.ctx.settings.voiceInputLanguage;
    const prompt = options.namePrompt === false ? undefined : this.namePrompt();
    const { provider } = this;

    try {
      let text: string;
      if (provider === ApiType.SentientSimsAI) {
        const format = mimeType.split(';')[0].split('/')[1] ?? 'webm';
        text = (
          await this.ctx.sentientSimsTranscription.transcribe(Buffer.from(audio), format, language, prompt)
        ).trim();
      } else if (provider === ApiType.Gemini) {
        text = await this.transcribeWithGemini(audio, mimeType, language, prompt);
      } else {
        text = await this.transcribeOpenAICompatible(provider, audio, mimeType, language, prompt);
      }
      return isPromptEcho(text, prompt) ? '' : text;
    } catch (error) {
      log.error(`Voice transcription failed (${voiceInputProviderName(provider)}):`, error);
      throw error instanceof TranscriptionError ? error : new TranscriptionError(errorMessage(error));
    }
  }

  private async transcribeOpenAICompatible(
    provider: VoiceInputProvider,
    audio: ArrayBuffer,
    mimeType: string,
    language: string,
    prompt: string | undefined,
  ): Promise<string> {
    const client = this.getClient(provider);
    // The filename extension is how whisper servers detect the container format
    const file = await toFile(Buffer.from(audio), 'speech.webm', { type: mimeType });
    const response = await client.audio.transcriptions.create({
      file,
      model: this.ctx.settings.voiceInputModelFor(provider) ?? '',
      ...(language ? { language } : {}),
      ...(prompt ? { prompt } : {}),
    });
    return response.text.trim();
  }

  // Gemini hears the recording as an inline audio part next to a transcription
  // instruction; the names and language hints ride along as plain text
  private async transcribeWithGemini(
    audio: ArrayBuffer,
    mimeType: string,
    language: string,
    prompt: string | undefined,
  ): Promise<string> {
    const client = this.getGeminiClient();
    const model = this.ctx.settings.voiceInputModelFor(ApiType.Gemini) ?? '';
    const languageName = VOICE_INPUT_LANGUAGES.find((option) => option.code === language)?.name;
    const instruction = [
      'Transcribe the speech in this recording word for word.',
      'Reply with the transcript only, with no quotes, labels or commentary.',
      'If nothing is said, reply with nothing at all.',
      languageName ? `The speaker is speaking ${languageName}.` : undefined,
      prompt,
    ]
      .filter(Boolean)
      .join(' ');

    const response = await client.models.generateContent({
      model,
      config: {
        temperature: 0,
        safetySettings: geminiSafetySettings,
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: instruction },
            { inlineData: { mimeType: mimeType.split(';')[0], data: Buffer.from(audio).toString('base64') } },
          ],
        },
      ],
    });
    const text = response.text ?? '';
    return text
      .trim()
      .replace(/^["“](.*)["”]$/s, '$1')
      .trim();
  }

  async healthCheck(): Promise<AIHealthCheckResponse> {
    const { provider } = this;
    if (provider === ApiType.SentientSimsAI) {
      return this.ctx.sentientSimsTranscription.healthCheck();
    }

    // No cheap transcription ping exists; a models listing works on every provider
    try {
      if (provider === ApiType.Gemini) {
        await this.getGeminiClient().models.list();
      } else {
        await this.getClient(provider).models.list();
      }
      return { status: 'OK' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error('Error testing transcription endpoint:', error);
      return { error: plainKeyTestError(message) };
    }
  }
}
