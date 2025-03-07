/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-continue */
/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import log from 'electron-log';
import { mergesBinary, vocabBase64 } from './vocab';

class PriorityQueue {
  private comparator: (a: number, b: number) => boolean;

  private heap: any[];

  // PriorityQueue implementation is copied from https://stackoverflow.com/a/42919752 with minor refactoring
  constructor(comparator = (a: number, b: number) => a > b) {
    this.heap = [];
    this.comparator = comparator;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this.heap[0];
  }

  push(...values: any[]) {
    values.forEach((value) => {
      this.heap.push(value);
      this.siftUp();
    });
    return this.size();
  }

  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > 0) {
      this.swap(0, bottom);
    }
    this.heap.pop();
    this.siftDown();
    return poppedValue;
  }

  parent(i: number) {
    return ((i + 1) >>> 1) - 1;
  }

  left(i: number) {
    return (i << 1) + 1;
  }

  right(i: number) {
    return (i + 1) << 1;
  }

  greater(i: number, j: number) {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  siftUp() {
    let node = this.size() - 1;
    while (node > 0 && this.greater(node, this.parent(node))) {
      this.swap(node, this.parent(node));
      node = this.parent(node);
    }
  }

  siftDown() {
    let node = 0;
    while (
      (this.left(node) < this.size() && this.greater(this.left(node), node)) ||
      (this.right(node) < this.size() && this.greater(this.right(node), node))
    ) {
      const maxChild =
        this.right(node) < this.size() &&
        this.greater(this.right(node), this.left(node))
          ? this.right(node)
          : this.left(node);
      this.swap(node, maxChild);
      node = maxChild;
    }
  }
}

function base64decode(encodedString: string) {
  if (typeof window !== 'undefined') {
    return atob(encodedString);
  }

  return Buffer.from(encodedString, 'base64').toString('binary');
}

const vocab = decodeVocabulary(vocabBase64);
const vocabByString = new Map();
vocab.forEach((tokenString, tokenId) => {
  vocabByString.set(tokenString, tokenId);
});
const merges = decompressMerges(mergesBinary);

function getMergeIdentifierString(firstTokenId: number, secondTokenId: number) {
  return `${vocab[firstTokenId]} ${vocab[secondTokenId]}`;
}

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8');

function decompressMerges(binaryMerges: string) {
  // Base64 decode binary.
  const byteArrayString = base64decode(binaryMerges);

  // Convert byteArrayString to byteArray.
  const byteArray = new Uint8Array(byteArrayString.length);
  for (let i = 0; i < byteArrayString.length; i++) {
    byteArray[i] = byteArrayString.charCodeAt(i);
  }

  // Each byte-pair represents a tokenId.
  // Convert byte-pairs to tokenIds (integers between 0 and 32000).
  const tokenIds = [];
  for (let i = 0; i < byteArray.length; i += 2) {
    const byte1 = byteArray[i];
    const byte2 = byteArray[i + 1];
    const tokenId = byte1 + (byte2 << 8);
    tokenIds.push(tokenId);
  }

  // Each pair of tokenIds represents a merge.
  const mergedTokenIds = new Map();
  for (let i = 0; i < tokenIds.length; i += 2) {
    const id1 = tokenIds[i];
    const id2 = tokenIds[i + 1];
    const mergeIdentifierString = getMergeIdentifierString(id1, id2);
    // Key identifies token pair, value represents merge priority
    mergedTokenIds.set(mergeIdentifierString, i + 1);
  }
  return mergedTokenIds;
}

function decodeVocabulary(base64Vocab: string) {
  const byteArray = Uint8Array.from(base64decode(base64Vocab), (c) =>
    c.charCodeAt(0),
  );
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(byteArray).split('\n');
}

function utf8ByteToHex(c: any) {
  const hexValue = c.toString(16).toUpperCase().padStart(2, '0');
  return `<0x${hexValue}>`;
}

function hexToUtf8Byte(hex: string) {
  const strippedHex = hex.replace(/<0x|>/g, '');
  return parseInt(strippedHex, 16);
}

function mapCharactersToTokenIds(
  prompt: string,
  addBosToken: boolean,
  addPrecedingSpace: boolean,
) {
  const tokenIds = [];
  // Special "beginning of string" token.
  if (addBosToken) {
    tokenIds.push(1);
  }
  // Special "preceding space" added to beginning of prompt.
  if (addPrecedingSpace) {
    prompt = ` ${prompt}`;
  }
  // Special: spaces are represented as thick underscore ▁ (id 29871)
  const promptAltered = prompt.replaceAll(' ', vocab[29871]);
  // We need to use Array.from to iterate over characters in order to support UTF-8 multipoint characters
  const charArray = Array.from(promptAltered);
  // Transform each character to its corresponding token
  charArray.forEach((character) => {
    if (vocabByString.has(character)) {
      tokenIds.push(vocabByString.get(character));
    } else {
      // Special case where token not found and we have to fallback to byte-level tokens.
      const bytes = utf8Encoder.encode(character);
      bytes.forEach((byte) => {
        const hex = vocabByString.get(utf8ByteToHex(byte));
        tokenIds.push(hex);
        if (!(hex >= 0)) {
          // This is not supposed to happen because the LLaMA vocabulary has a token corresponding to each byte,
          // but if this happens regardless, let's follow the protocol and tokenize to <UNK> token instead of crashing.
          log.error(
            `Encountered unknown character ${character} (partial UTF-8 byte ${byte} + hex + ${utf8ByteToHex(
              byte,
            )})`,
          );
          tokenIds[tokenIds.length - 1] = 0;
        }
      });
    }
  });
  return tokenIds;
}

type TokenNode = {
  origPos: number;
  tokenId: number;
  prev: any;
  next: any;
};

function encode(prompt: string, addBosToken = true, addPrecedingSpace = true) {
  if (prompt.length === 0) {
    return [];
  }
  // Initially each character is transformed to a tokenId, later there will be merges of these.
  const tokenIds = mapCharactersToTokenIds(
    prompt,
    addBosToken,
    addPrecedingSpace,
  );

  // Set up priority queue to efficiently iterate merge possibilities in priority order
  const mergeQueue = new PriorityQueue((a: any, b: any) => {
    return a.mergePrio < b.mergePrio;
  });

  // eslint-disable-next-line func-names
  const addToMergeQueue = function (leftNode: {
    origPos: any;
    tokenId: any;
    prev?: any;
    next: any;
    mergePrio?: any;
    mergeToString?: any;
  }) {
    const mergeIdentifierString = getMergeIdentifierString(
      leftNode.tokenId,
      leftNode.next.tokenId,
    );
    // Merge priority is primarily determined by the location of the merge in the "merges" data,
    // secondarily determined by the relative position of the node in the linked list
    // (We want to perform equal merges from left to right)
    const mergePrio =
      merges.get(mergeIdentifierString) * 100000 + leftNode.origPos;
    if (mergePrio) {
      // If mergePrio not found in merges, that means this merge is not possible according to vocabulary.
      leftNode.mergePrio = mergePrio;
      leftNode.mergeToString = mergeIdentifierString.replace(' ', '');
      mergeQueue.push(leftNode);
    }
  };

  // Fill merge queue from initial merge possibilities and construct linked list
  let firstTokenNode: TokenNode = {
    origPos: 0,
    tokenId: tokenIds[0],
    prev: null,
    next: null,
  };
  let prevTokenNode = firstTokenNode;
  for (let i = 1; i < tokenIds.length; i++) {
    const currTokenNode = {
      origPos: i,
      tokenId: tokenIds[i],
      prev: prevTokenNode,
      next: null,
    };
    prevTokenNode.next = currTokenNode;
    addToMergeQueue(prevTokenNode);
    prevTokenNode = currTokenNode;
  }

  // Perform merges in priority order
  while (!mergeQueue.isEmpty()) {
    const leftOfMerge = mergeQueue.pop();
    // Check that this merge is still possible
    if (leftOfMerge.deleted) continue;
    if (!leftOfMerge.next) continue;
    if (leftOfMerge.next.deleted) continue;

    // Mark leftOfMerge and rightOfMerge as being deleted, because they are actually being replaced by a merged token.
    leftOfMerge.deleted = true;
    leftOfMerge.next.deleted = true;
    // It's a little bit more complicated to fix the prev of leftOfMerge.
    if (leftOfMerge.prev) {
      const oldPrev = leftOfMerge.prev;
      // Mark oldPrev as deleted, to avoid erroneous merges later (ref to this node might exist in priorityqueue)
      oldPrev.deleted = true;
      // Replace oldPrev within the linked list with a copy of itself
      const newPrev = {
        origPos: oldPrev.origPos,
        tokenId: oldPrev.tokenId,
        prev: oldPrev.prev,
        next: oldPrev.next,
      };
      leftOfMerge.prev = newPrev;
      // Update linked list reference of "prev of prev"
      if (newPrev.prev) {
        newPrev.prev.next = newPrev;
      } else {
        // If "prev of prev" does not exist, that means newPrev must be the new firstNode
        firstTokenNode = newPrev;
      }
    }
    // Create node representing merge result
    const resultOfMerge = {
      origPos: leftOfMerge.origPos,
      tokenId: vocabByString.get(leftOfMerge.mergeToString),
      prev: leftOfMerge.prev,
      next: leftOfMerge.next.next,
    };
    // Consider adding to merge queue: prev--resultOfMerge
    if (resultOfMerge.prev) {
      resultOfMerge.prev.next = resultOfMerge;
      resultOfMerge.prev;
      addToMergeQueue(resultOfMerge.prev);
    } else {
      // If prev does not exist then this is the new firstNode
      firstTokenNode = resultOfMerge;
    }
    // Consider adding to merge queue: resultOfMerge--next
    if (resultOfMerge.next) {
      resultOfMerge.next.prev = resultOfMerge;
      addToMergeQueue(resultOfMerge);
    }
  }

  // Get final tokenIds by traversing the linked list
  const mergedTokenIds = [];
  for (
    let currTokenNode = firstTokenNode;
    currTokenNode !== null;
    currTokenNode = currTokenNode.next
  ) {
    mergedTokenIds.push(currTokenNode.tokenId);
  }

  return mergedTokenIds;
}

function decode(
  tokenIds: readonly number[],
  addBosToken = true,
  addPrecedingSpace = true,
) {
  const utf8byteVals: number[] = [];
  const startIndex = addBosToken ? 1 : 0;
  for (let i = startIndex; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const tokenString = vocab[tokenId];
    if (tokenString.startsWith('<0x') && tokenString.endsWith('>')) {
      // Special case
      const utf8byte = hexToUtf8Byte(tokenString);
      utf8byteVals.push(utf8byte);
    } else {
      // Typical case
      const utf8bytes = utf8Encoder.encode(tokenString);
      utf8bytes.forEach((utf8Byte) => utf8byteVals.push(utf8Byte));
    }
  }
  const uint8Array = new Uint8Array(utf8byteVals);
  const decodedString = utf8Decoder.decode(uint8Array);
  const spacesFixed = decodedString.replaceAll(vocab[29871], ' ');
  // Note that preceding space must be removed here at string level, not earlier at token level, because multiple consecutive spaces are represented as single token.
  return addPrecedingSpace ? spacesFixed.slice(1) : spacesFixed;
}

export const llamaTokenizer = {
  encode,
  decode,
};
