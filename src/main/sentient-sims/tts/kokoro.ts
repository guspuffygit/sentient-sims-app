/* eslint-disable class-methods-use-this */
import {
  StyleTextToSpeech2Model,
  AutoTokenizer,
  Tensor,
  RawAudio,
  PreTrainedTokenizer,
  PreTrainedModel,
} from '@huggingface/transformers';
import log from 'electron-log';
import { PretrainedModelOptions } from '@huggingface/transformers/types/utils/hub.js';
import { phonemize } from './phonemize';
import { TextSplitterStream } from './splitter';
import { getVoiceData, VOICES } from './voices';

const STYLE_DIM = 256;
const SAMPLE_RATE = 24000;

export type GenerateOptions = {
  voice: keyof typeof VOICES;
  speed: number;
};

export type StreamProperties = {
  splitPattern?: RegExp;
};

export type StreamGenerateOptions = GenerateOptions & StreamProperties;

export class KokoroTTS {
  /**
   * Create a new KokoroTTS instance.
   */
  private model: PreTrainedModel;

  private tokenizer: PreTrainedTokenizer;

  constructor(model: PreTrainedModel, tokenizer: PreTrainedTokenizer) {
    this.model = model;
    this.tokenizer = tokenizer;
  }

  /**
   * Load a KokoroTTS model from the Hugging Face Hub.
   * @param {Object} options Additional options
   * @param {"fp32"|"fp16"|"q8"|"q4"|"q4f16"} [options.dtype="fp32"] The data type to use.
   * @param {"wasm"|"webgpu"|"cpu"|null} [options.device=null] The device to run the model on.
   * @param {import("@huggingface/transformers").ProgressCallback} [options.progress_callback=null] A callback function that is called with progress information.
   * @returns {Promise<KokoroTTS>} The loaded model
   */
  static async from_pretrained(
    modelId: string,
    options?: PretrainedModelOptions
  ): Promise<KokoroTTS> {
    const model = StyleTextToSpeech2Model.from_pretrained(modelId, {
      progress_callback: options?.progress_callback,
      dtype: options?.dtype,
      device: options?.device,
    });
    const tokenizer = AutoTokenizer.from_pretrained(modelId, {
      progress_callback: options?.progress_callback,
    });

    const info = await Promise.all([model, tokenizer]);
    return new KokoroTTS(...info);
  }

  get voices() {
    return VOICES;
  }

  list_voices() {
    log.info(JSON.stringify(VOICES, null, 2));
  }

  private validateVoice(voice: string): 'a' | 'b' {
    if (!(voice in VOICES)) {
      throw new Error(
        `Voice "${voice}" not found. Should be one of: ${Object.keys(
          VOICES
        ).join(', ')}.`
      );
    }
    const language = voice.at(0);

    if (language !== 'a' && language !== 'b') {
      throw new Error('It didnt match');
    }

    return language;
  }

  /**
   * Generate audio from text.
   */
  async generate(text: string, options: GenerateOptions): Promise<RawAudio> {
    const language = this.validateVoice(options.voice);

    const phonemes = await phonemize(text, language);
    log.debug(`phonemes: ${phonemes}`);
    // eslint-disable-next-line camelcase
    const result = this.tokenizer(phonemes, {
      truncation: true,
    });

    return this.generateFromIds(result.input_ids, options);
  }

  /**
   * Generate audio from input ids.
   */
  async generateFromIds(
    inputIds: Tensor,
    options: GenerateOptions
  ): Promise<RawAudio> {
    // Select voice style based on number of input tokens
    const inputIdDims = inputIds.dims.at(-1);
    if (inputIdDims === undefined) {
      throw new Error('InputIdDims was undefined');
    }
    const numTokens = Math.min(Math.max(inputIdDims - 2, 0), 509);

    // Load voice style
    const data = await getVoiceData(options.voice);
    const offset = numTokens * STYLE_DIM;
    const voiceData = data.slice(offset, offset + STYLE_DIM);

    // Prepare model inputs
    const inputs = {
      input_ids: inputIds,
      style: new Tensor('float32', voiceData, [1, STYLE_DIM]),
      speed: new Tensor('float32', [options.speed], [1]),
    };

    // Generate audio
    const { waveform } = await this.model(inputs);
    return new RawAudio(waveform.data, SAMPLE_RATE);
  }

  /**
   * Generate audio from text in a streaming fashion.
   * @param {StreamGenerateOptions} options Additional options
   * @returns {AsyncGenerator<{text: string, phonemes: string, audio: RawAudio}, void, void>}
   */
  async *stream(
    text: string | TextSplitterStream,
    options: StreamGenerateOptions
  ): AsyncGenerator<
    { text: string; phonemes: string; audio: RawAudio },
    void,
    void
  > {
    const language = this.validateVoice(options.voice);

    let splitter: TextSplitterStream;
    if (text instanceof TextSplitterStream) {
      splitter = text;
    } else if (typeof text === 'string') {
      splitter = new TextSplitterStream();
      const chunks = options.splitPattern
        ? text
            .split(options.splitPattern)
            .map((chunk) => chunk.trim())
            .filter((chunk) => chunk.length > 0)
        : [text];
      splitter.push(chunks);
    } else {
      throw new Error(
        'Invalid input type. Expected string or TextSplitterStream.'
      );
    }
    // eslint-disable-next-line no-restricted-syntax
    for await (const sentence of splitter.sentences) {
      const phonemes = await phonemize(sentence, language);
      // eslint-disable-next-line camelcase
      const { input_ids } = this.tokenizer(phonemes, {
        truncation: true,
      });

      // TODO: There may be some cases where - even with splitting - the text is too long.
      // In that case, we should split the text into smaller chunks and process them separately.
      // For now, we just truncate these exceptionally long chunks
      const audio = await this.generateFromIds(input_ids, options);
      yield { text: sentence, phonemes, audio };
    }
  }
}

export { TextSplitterStream };
