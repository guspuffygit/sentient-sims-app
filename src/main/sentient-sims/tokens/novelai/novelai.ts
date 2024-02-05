/* eslint-disable */
interface Vocabulary {
  [key: string]: number;
}

interface Config {
  splitRegex: string;
}

interface DataEncoder {
  [key: string]: number;
}

interface DataDecoder {
  [key: number]: string;
}

interface GPTPair {
  left: string;
  right: string;
}

interface BGERank {
  rank: number;
  bigram: GPTPair;
}

interface SpecialsTreeNode {
  char: string;
  children: SpecialsTreeNode[];
  value?: string;
}

function charCode(char: string): number {
  return char.codePointAt(0) || 0;
}

function character(characterCode: number): string {
  return String.fromCodePoint(characterCode);
}

const buildByteEncoderDecoder = (): {
  byteDecoder: DataDecoder;
  byteEncoder: DataEncoder;
} => {
  const bytesUnicodeMap: DataDecoder = {};
  const unicodeBytes: DataEncoder = {};
  for (let i = charCode('!'); i <= charCode('~'); i++) {
    bytesUnicodeMap[i] = character(i);
    unicodeBytes[character(i)] = i;
  }
  for (let i = charCode('¡'); i <= charCode('¬'); i++) {
    bytesUnicodeMap[i] = character(i);
    unicodeBytes[character(i)] = i;
  }
  for (let i = charCode('®'); i <= charCode('ÿ'); i++) {
    bytesUnicodeMap[i] = character(i);
    unicodeBytes[character(i)] = i;
  }
  let utc = 0;
  const bytesUnicode: DataDecoder = {};
  for (let i = 0; i < 256; i++) {
    if (bytesUnicodeMap[i] === undefined) {
      bytesUnicodeMap[i] = character(256 + utc);
      unicodeBytes[character(256 + utc)] = i;
      utc++;
    }
    bytesUnicode[i] = bytesUnicodeMap[i];
  }
  return { byteDecoder: bytesUnicode, byteEncoder: unicodeBytes };
};

export class Encoder {
  private vocab: Vocabulary;

  private merges: string[][];

  private specials: Vocabulary;

  private specialsTree: SpecialsTreeNode;

  private config: Config;

  private splitRegex: RegExp;

  private bpeRanks: Map<string, number>;

  private tokenMerges: Map<string, number>;

  private encoder: DataEncoder;

  private decoder: DataDecoder;

  private charToByte: DataEncoder;

  private byteToChar: DataDecoder;

  private bytesEncoder: DataEncoder | undefined; // Used for sentencepiece

  private cache: Map<string, number[]> = new Map<string, number[]>();

  constructor(
    vocab: Vocabulary,
    merges: string[][],
    specials: string[],
    config: Config
  ) {
    this.vocab = vocab;
    this.merges = merges;
    this.specials = specials
      .map((special) => [special, vocab[special]])
      .reduce((obj: Vocabulary, [key, value]) => {
        obj[key] = value as number;
        return obj;
      }, {});
    this.config = config;

    const { byteDecoder, byteEncoder } = buildByteEncoderDecoder();

    this.byteToChar = byteDecoder;
    this.charToByte = byteEncoder;

    this.encoder = vocab;
    const bytesEncoder: DataEncoder = {};
    let hasByteRunes = false;
    // Go through the encoderMappings for possible byte runes.
    // Read Encoder mappings and also generate reverse mappings.
    this.decoder = {};
    for (const [key, value] of Object.entries(this.encoder)) {
      if (key.startsWith('0x')) {
        // Byte rune
        hasByteRunes = true;
        const byte = Number.parseInt(key, 16);
        bytesEncoder[byte] = value;
      }
      this.decoder[value] = key;
    }
    if (hasByteRunes) {
      this.bytesEncoder = bytesEncoder;
    }

    const bpeRanks = new Map<string, number>();
    for (const [i, merge] of this.merges.entries()) {
      bpeRanks.set(merge.join(''), i);
    }
    this.bpeRanks = bpeRanks;

    const tokenMerges = new Map<string, number>();
    for (const pair of bpeRanks.keys()) {
      tokenMerges.set(pair, this.encoder[pair]);
    }
    this.tokenMerges = tokenMerges;

    // Sort specials in descending order of length.
    const specialsSorted = Object.entries(this.specials).sort(
      (a, b) => b[0].length - a[0].length
    );

    // Create a specials tree by going through the specials. Starting node is empty.
    const specialsTree: SpecialsTreeNode = {
      char: '',
      children: [],
    };
    for (const [special] of specialsSorted) {
      let currentNode = specialsTree;
      for (const char of special) {
        let found = false;
        for (const child of currentNode.children) {
          if (child.char === char) {
            currentNode = child;
            found = true;
            break;
          }
        }
        if (!found) {
          const newNode: SpecialsTreeNode = {
            char,
            children: [],
          };
          currentNode.children.push(newNode);
          currentNode = newNode;
        }
      }
      currentNode.value = special;
    }
    this.specialsTree = specialsTree;

    this.splitRegex = new RegExp(this.config.splitRegex, 'gu');
  }

  // Splits a string into words according to BPE encoder rules.
  private splitWords(text: string): string[] {
    const words: string[] = [];
    const specialRoot = this.specialsTree;
    const { splitRegex } = this;
    let accumulated = '';
    let accumulatedSpecial = '';
    let currentSpecialNode = specialRoot;

    function split() {
      if (accumulated) {
        // Split accumulated based on the split regex.
        const matches = accumulated.matchAll(splitRegex);
        const stringMatches = [...matches].map((match) => match[0]);
        for (const match of stringMatches) {
          words.push(match);
        }
        accumulated = '';
      }
      if (accumulatedSpecial) {
        words.push(accumulatedSpecial);
        accumulatedSpecial = '';
        currentSpecialNode = specialRoot;
      }
    }

    // Go through each character in the text and split accordingly.
    let i = 0;
    let lastFullSpecialNode: SpecialsTreeNode | undefined;
    while (i < text.length) {
      const char = text[i];
      let specialFound = false;
      for (const child of currentSpecialNode.children) {
        if (child.char === char) {
          currentSpecialNode = child;
          specialFound = true;
          break;
        }
      }
      // If we found a special, we keep going.
      if (specialFound) {
        accumulatedSpecial += char;
        i++;
      } else {
        // If we didn't find a special, but we haven't been accumulating a special, we just add the char to accumulated.
        if (accumulatedSpecial.length === 0) {
          accumulated += char;
          i++;
        }
        // If we were accumulating a special, but we haven't found a full special yet,
        // add the first char of the accumulated special to accumulated.
        // Then, backup the index and reset the accumulated special.
        else if (!lastFullSpecialNode) {
          accumulated += accumulatedSpecial[0];
          i -= accumulatedSpecial.length - 1;
          accumulatedSpecial = '';
          currentSpecialNode = specialRoot;
        }
        // If we were accumulating a special, and we had found a full special,
        // isolate the full special and move the index back.
        else if (lastFullSpecialNode.value) {
          const extra = accumulatedSpecial.slice(
            lastFullSpecialNode.value.length
          );
          accumulatedSpecial = lastFullSpecialNode.value;
          i -= extra.length;
          lastFullSpecialNode = undefined;
          split();
        }
      }

      if (
        currentSpecialNode.value &&
        accumulatedSpecial === currentSpecialNode.value
      ) {
        // We found a full special.
        lastFullSpecialNode = currentSpecialNode;
      }
    }
    if (accumulatedSpecial) {
      if (lastFullSpecialNode?.value) {
        const extra = accumulatedSpecial.slice(
          lastFullSpecialNode.value.length
        );
        accumulatedSpecial = lastFullSpecialNode.value;
        split();
        accumulated = extra;
      } else {
        accumulated += accumulatedSpecial;
        accumulatedSpecial = '';
      }
    }
    split();

    return words;
  }

  encodeStr = (str: string): number[] => {
    const textEncoder = new TextEncoder();
    return [...textEncoder.encode(str)];
  };

  decodeStr = (arr: Iterable<number>): string => {
    const textDecoder = new TextDecoder('utf8');
    return textDecoder.decode(new Uint8Array(arr));
  };

  private toUnicode(data: string): string {
    if (this.bytesEncoder) {
      // No transformation needed.
      return data;
    }
    // Transform using byteToChar.
    return [...this.encodeStr(data)]
      .map((byte) => this.byteToChar[byte])
      .join('');
  }

  private insertSortedNoDups(data: BGERank[], item: BGERank) {
    let i = 0;
    while (i < data.length && data[i].rank < item.rank) {
      i++;
    }
    if (i < data.length && data[i].rank === item.rank) {
      return;
    }
    data.splice(i, 0, item);
  }

  private getRankedPairs(word: string[]): BGERank[] {
    const rankedPairs: BGERank[] = [];
    let prev = word[0];
    for (let i = 1; i < word.length; i++) {
      const current = word[i];
      const pair: string = prev + current;
      let rank = this.bpeRanks.get(pair);
      if (rank === undefined) {
        rank = Number.POSITIVE_INFINITY;
      }
      this.insertSortedNoDups(rankedPairs, {
        rank,
        bigram: {
          left: prev,
          right: current,
        },
      });
      prev = current;
    }
    return rankedPairs;
  }

  private toBPE(text: string): number[] {
    if (this.cache.has(text)) {
      const cached = this.cache.get(text);
      if (cached) {
        return cached;
      }
    }
    let word: string[] = [...text];
    let rankedPairs = this.getRankedPairs(word);
    if (rankedPairs.length === 0) {
      const tokens = [];
      if (this.encoder[text] !== undefined) {
        tokens.push(this.encoder[text]);
      } else if (this.bytesEncoder) {
        for (const char of this.encodeStr(text)) {
          tokens.push(this.bytesEncoder[char]);
        }
      }
      this.cache.set(text, tokens);
      return tokens;
    }

    for (;;) {
      const { bigram } = rankedPairs[0];
      if (!this.bpeRanks.has(bigram.left + bigram.right)) {
        break;
      }
      const first = bigram.left;
      const second = bigram.right;
      let newWord: string[] = [];
      let i = 0;
      while (i < word.length) {
        const j = word.indexOf(first, i);
        if (j === -1) {
          newWord = [...newWord, ...word.slice(i)];
          break;
        }
        newWord = [...newWord, ...word.slice(i, j)];
        i = j;
        if (
          word[i] === first &&
          i < word.length - 1 &&
          word[i + 1] === second
        ) {
          newWord.push(first + second);
          i += 2;
        } else {
          newWord.push(word[i]);
          i += 1;
        }
      }
      word = newWord;
      if (word.length === 1) {
        break;
      } else {
        rankedPairs = this.getRankedPairs(word);
      }
    }
    const tokens = [];
    for (const token of word) {
      if (this.encoder[token] !== undefined) {
        tokens.push(this.encoder[token]);
      } else if (this.bytesEncoder) {
        for (const char of this.encodeStr(token)) {
          tokens.push(this.bytesEncoder[char]);
        }
      }
    }
    this.cache.set(text, tokens);
    return tokens;
  }

  encode(data: string): number[] {
    // Split the data into words.
    const words = this.splitWords(data);
    const encodedTokens: number[] = [];
    for (const word of words) {
      // Handle special tokens.
      if (this.specials[word] !== undefined) {
        encodedTokens.push(this.specials[word]);
        continue;
      } else {
        // Encode the word.
        const fragment = this.toUnicode(word);
        encodedTokens.push(...this.toBPE(fragment));
      }
    }
    return encodedTokens;
  }

  decode(tokens: number[]): string {
    let text = '';
    let accumulatedBytes: number[] = [];
    for (const token of tokens) {
      const str = this.decoder[token];
      // If it starts with 0x, it's a byte token.
      if (str.startsWith('0x')) {
        // Accumulate bytes.
        accumulatedBytes.push(Number.parseInt(str));
      } else {
        // Decode accumulated bytes.
        if (accumulatedBytes.length > 0) {
          text += this.decodeStr(accumulatedBytes);
          accumulatedBytes = [];
        }
        // Decode the token.
        text += str;
      }
    }
    // Decode remaining bytes.
    if (accumulatedBytes.length > 0) {
      text += this.decodeStr(accumulatedBytes);
    }

    if (!this.bytesEncoder) {
      return this.decodeStr(
        [...text].flatMap((x) => {
          const converted = this.charToByte[x] ?? this.encodeStr(x);
          return converted;
        })
      );
    }

    return text;
  }

  tokensContaining = (str: string): { token: string; id: number }[] => {
    const keys = Object.keys(this.encoder);
    const arr = [];
    for (const key of keys) {
      if (key.includes(str)) arr.push({ token: key, id: this.encoder[key] });
    }
    return arr;
  };

  // Note: This is very slow.
  makeUnitrim(): number[] {
    const unicodeReq: number[] = [];
    for (let i = 0; i < Object.keys(this.encoder).length; i++) {
      const v = this.decoder[i];
      let need = 0;
      let min_need = 0;
      // Turn the string into bytes.
      let bytes: number[] = [];
      if (this.bytesEncoder && v.startsWith('0x')) {
        // Byte tokens start with 0x.
        bytes.push(Number.parseInt(v));
      } else {
        bytes = this.encodeStr(v);
      }

      for (const c of bytes) {
        if ((c & 0b10000000) === 0) {
          need = 0;
        } else if ((c & 0b11000000) === 0b10000000) {
          need -= 1;
        } else if ((c & 0b11100000) === 0b11000000) {
          need = 1;
        } else if ((c & 0b11110000) === 0b11100000) {
          need = 2;
        } else if ((c & 0b11111000) === 0b11110000) {
          need = 3;
        }
        if (need < min_need) {
          min_need = need;
        }
      }
      if (need === 0) {
        need = min_need;
      }
      unicodeReq.push(need);
    }

    return unicodeReq;
  }

  totalTokens(): number {
    return Object.keys(this.encoder).length;
  }
}
