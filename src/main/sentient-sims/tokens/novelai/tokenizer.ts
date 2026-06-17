export type NovelAITokenizer = {
  config: { splitRegex: string };
  vocab: Record<string, number>;
  specialTokens: string[];
  merges: string[][];
};
