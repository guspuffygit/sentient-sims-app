/* eslint-disable class-methods-use-this */
import { llamaTokenizer } from './llama/LLamaTokenizer';
import { TokenCounter } from './TokenCounter';

export class LLaMaTokenCounter implements TokenCounter {
  countTokens(text: string): number {
    // Add 1 for newline character when joining messages together
    return llamaTokenizer.encode(text).length + 1;
  }
}
