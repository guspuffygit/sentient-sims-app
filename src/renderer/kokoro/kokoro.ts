/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import {
  StyleTextToSpeech2Model,
  AutoTokenizer,
  Tensor,
  RawAudio,
  TransformersJSConfig,
  PretrainedOptions,
} from '@huggingface/transformers';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { VoiceClient } from 'main/sentient-sims/clients/VoiceClient';
import { TextSplitterStream } from './splitter.js';
import { getVoiceData, VOICES } from './voices';

const STYLE_DIM = 256;
const SAMPLE_RATE = 24000;

export type GenerateOptions = {
  voice: keyof typeof VOICES;
  speed: number;
};

export type StreamGenerateOptions = {
  split_pattern?: RegExp;
} & GenerateOptions;

export type PretrainedModelOptions = TransformersJSConfig & PretrainedOptions;

const voiceClient: VoiceClient = new VoiceClient(appApiUrl);

export class KokoroTTS {
  model: any;

  tokenizer: any;

  /**
   * Create a new KokoroTTS instance.
   * @param {import('@huggingface/transformers').StyleTextToSpeech2Model} model The model
   * @param {import('@huggingface/transformers').PreTrainedTokenizer} tokenizer The tokenizer
   */
  constructor(model: any, tokenizer: any) {
    this.model = model;
    this.tokenizer = tokenizer;
  }

  /**
   * Load a KokoroTTS model from the Hugging Face Hub.
   * @param {string} model_id The model id
   * @param {Object} options Additional options
   * @param {"fp32"|"fp16"|"q8"|"q4"|"q4f16"} [options.dtype="fp32"] The data type to use.
   * @param {"wasm"|"webgpu"|"cpu"|null} [options.device=null] The device to run the model on.
   * @param {import("@huggingface/transformers").ProgressCallback} [options.progress_callback=null] A callback function that is called with progress information.
   */
  static async from_pretrained(
    model_id: any,
    options: PretrainedModelOptions,
  ): Promise<KokoroTTS> {
    const model = StyleTextToSpeech2Model.from_pretrained(model_id, {
      progress_callback: options.progress_callback,
      dtype: options.dtype,
      device: options.device,
    });
    const tokenizer = AutoTokenizer.from_pretrained(model_id, {
      progress_callback: options.progress_callback,
    });

    const info = await Promise.all([model, tokenizer]);
    return new KokoroTTS(...info);
  }

  get voices() {
    return VOICES;
  }

  getLanguage(voice: any) {
    if (!(voice in VOICES)) {
      log.error(`Voice "${voice}" not found. Available voices:`);
      throw new Error(
        `Voice "${voice}" not found. Should be one of: ${Object.keys(
          VOICES,
        ).join(', ')}.`,
      );
    }
    const language = /** @type {"a"|"b"} */ voice.at(0); // "a" or "b"
    return language;
  }

  getVoice(voice: any): keyof typeof VOICES {
    if (!(voice in VOICES)) {
      log.error(`Voice "${voice}" not found. Available voices:`);
      throw new Error(
        `Voice "${voice}" not found. Should be one of: ${Object.keys(
          VOICES,
        ).join(', ')}.`,
      );
    }

    return voice;
  }

  /**
   * Generate audio from text.
   */
  async generate(
    text: string,
    { voice = 'af_heart', speed = 1 }: GenerateOptions,
  ): Promise<RawAudio> {
    const language = this.getLanguage(voice);

    const phonemes = await voiceClient.phonemize(text, language);
    const { input_ids } = this.tokenizer(phonemes, {
      truncation: true,
    });

    return this.generate_from_ids(input_ids, {
      voice: this.getVoice(voice),
      speed,
    });
  }

  /**
   * Generate audio from input ids.
   * @param {Tensor} input_ids The input ids
   * @param {GenerateOptions} options Additional options
   * @returns {Promise<RawAudio>} The generated audio
   */
  async generate_from_ids(input_ids: any, options: GenerateOptions) {
    // Select voice style based on number of input tokens
    const num_tokens = Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);

    // Load voice style
    const data = await getVoiceData(options.voice);
    const offset = num_tokens * STYLE_DIM;
    const voiceData = data.slice(offset, offset + STYLE_DIM);

    // Prepare model inputs
    const inputs = {
      input_ids,
      style: new Tensor('float32', voiceData, [1, STYLE_DIM]),
      speed: new Tensor('float32', [options.speed], [1]),
    };

    // Generate audio
    const { waveform } = await this.model(inputs);
    return new RawAudio(waveform.data, SAMPLE_RATE);
  }

  async *stream(
    text: string | TextSplitterStream,
    { voice = 'af_heart', speed = 1, split_pattern }: StreamGenerateOptions,
  ): AsyncGenerator<
    { text: string; phonemes: string; audio: RawAudio },
    void,
    void
  > {
    const language = this.getLanguage(voice);

    /** @type {TextSplitterStream} */
    let splitter;
    if (text instanceof TextSplitterStream) {
      splitter = text;
    } else if (typeof text === 'string') {
      splitter = new TextSplitterStream();
      if (!split_pattern) {
        throw new Error('split_pattern required when using text');
      }
      const chunks = split_pattern
        ? text
            .split(split_pattern)
            .map((chunk) => chunk.trim())
            .filter((chunk) => chunk.length > 0)
        : [text];
      splitter.push(...chunks);
    } else {
      throw new Error(
        'Invalid input type. Expected string or TextSplitterStream.',
      );
    }
    for await (const sentence of splitter) {
      const phonemes = await voiceClient.phonemize(sentence, language);
      const { input_ids } = this.tokenizer(phonemes, {
        truncation: true,
      });

      // TODO: There may be some cases where - even with splitting - the text is too long.
      // In that case, we should split the text into smaller chunks and process them separately.
      // For now, we just truncate these exceptionally long chunks
      const audio = await this.generate_from_ids(input_ids, {
        voice: this.getVoice(voice),
        speed,
      });
      yield { text: sentence, phonemes, audio };
    }
  }
}

export { TextSplitterStream };
