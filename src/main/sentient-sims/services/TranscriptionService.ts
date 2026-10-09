import log from 'electron-log';
import { AxiosError } from 'axios';
import OpenAI, { toFile } from 'openai';
import { ApiContext } from './ApiContext';
import { AIHealthCheckResponse } from '../models/AIHealthCheckResponse';
import { ApiType } from '../models/ApiType';
import { openaiDefaultEndpoint } from '../constants';
import { buildTranscriptionPrompt } from '../util/nameCorrection';

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

// Speech-to-text over any OpenAI-compatible /audio/transcriptions endpoint (OpenAI,
// Groq, local faster-whisper/speaches). Deliberately separate from the generation
// providers: the STT endpoint/key/model are an independent settings axis, so this owns
// its own client instead of borrowing OpenAIService's LLM-configured one. Sentient
// Sims AI is the exception, since it speaks its own JSON request and login token.
export class TranscriptionService {
  private readonly ctx: ApiContext;

  private client?: OpenAI;

  private clientConfig?: string;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  private getApiKey(): string {
    const voiceKey = this.ctx.settings.voiceInputKey;
    if (voiceKey) {
      return voiceKey;
    }
    // Reuse the app's OpenAI key only against OpenAI itself — never send it to a
    // custom endpoint the user pointed elsewhere
    if (this.ctx.settings.voiceInputEndpoint === openaiDefaultEndpoint && this.ctx.settings.openaiKey) {
      return this.ctx.settings.openaiKey;
    }
    // Local whisper servers ignore auth entirely; a placeholder keeps the SDK happy
    // there while a real endpoint rejects it with a clear 401
    return 'not-set';
  }

  private getClient(): OpenAI {
    const apiKey = this.getApiKey();
    const baseURL = this.ctx.settings.voiceInputEndpoint;
    const clientConfig = `${baseURL}:${apiKey}`;
    if (!this.client || this.clientConfig !== clientConfig) {
      this.client = new OpenAI({
        dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
        apiKey,
        baseURL,
        timeout: 30000,
        maxRetries: 0,
      });
      this.clientConfig = clientConfig;
    }

    return this.client;
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
        locations = this.ctx.locationRepository
          .getAllLocations()
          .filter((location) => lotId === undefined || String(location.id) === String(lotId))
          .map((location) => location.name);
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

    if (this.ctx.settings.voiceInputProvider === ApiType.SentientSimsAI) {
      const format = mimeType.split(';')[0].split('/')[1] ?? 'webm';
      try {
        const text = await this.ctx.sentientSimsTranscription.transcribe(Buffer.from(audio), format, language, prompt);
        return text.trim();
      } catch (error) {
        log.error('Voice transcription failed:', error);
        throw new TranscriptionError(errorMessage(error));
      }
    }

    const client = this.getClient();
    // The filename extension is how whisper servers detect the container format
    const file = await toFile(Buffer.from(audio), 'speech.webm', { type: mimeType });

    try {
      const response = await client.audio.transcriptions.create({
        file,
        model: this.ctx.settings.voiceInputModel,
        ...(language ? { language } : {}),
        ...(prompt ? { prompt } : {}),
      });
      return response.text.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error('Voice transcription failed:', error);
      throw new TranscriptionError(message);
    }
  }

  async healthCheck(): Promise<AIHealthCheckResponse> {
    if (this.ctx.settings.voiceInputProvider === ApiType.SentientSimsAI) {
      return this.ctx.sentientSimsTranscription.healthCheck();
    }

    // No cheap transcription ping exists; a models listing works on OpenAI, Groq,
    // and the common local whisper servers
    try {
      await this.getClient().models.list();
      return { status: 'OK' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error('Error testing transcription endpoint:', error);
      return { error: `not working, ${message}` };
    }
  }
}
