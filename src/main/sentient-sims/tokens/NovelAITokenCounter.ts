/* eslint-disable class-methods-use-this */
import { TokenCounter } from './TokenCounter';
import { Encoder } from './novelai/novelai';
import { NovelAITokenizer } from './novelai/tokenizer';

import nerdstash2 from './novelai/tokenizer_files/nerdstash_tokenizer_v2.json';

const nerdstash2Tokenizer: NovelAITokenizer = nerdstash2 as NovelAITokenizer;

const encoder: Encoder = new Encoder(
  nerdstash2Tokenizer.vocab,
  nerdstash2Tokenizer.merges,
  nerdstash2Tokenizer.specialTokens,
  nerdstash2Tokenizer.config,
);

export class NovelAITokenCounter implements TokenCounter {
  countTokens(text: string): number {
    return encoder.encodeStr(text).length;
  }
}
