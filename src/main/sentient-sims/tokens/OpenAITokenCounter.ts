/* eslint-disable class-methods-use-this */
import { encode } from '@nem035/gpt-3-encoder';
import { TokenCounter } from './TokenCounter';

export class OpenAITokenCounter implements TokenCounter {
  countTokens(text: string): number {
    // See how awful it is to count tokens for chat completions then just go with adding 4
    // https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
    return encode(text).length + 4;
  }
}
