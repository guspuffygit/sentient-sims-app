import '@testing-library/jest-dom';
import {
  removeLastParagraph,
  trimIncompleteSentence,
} from 'main/sentient-sims/formatter/PromptFormatter';

describe('PromptFormatter', () => {
  it('should trim sentence', () => {
    const imcompleteSentence = 'This is a sentence. This is a';
    expect(trimIncompleteSentence(imcompleteSentence)).toEqual(
      'This is a sentence.'
    );
  });

  it('should remove last paragraph', () => {
    const lineOne = 'Line one.';
    const lineTwo = 'Line two.';
    const lineThree = 'Line three.';
    const multipleParagraphs = [lineOne, lineTwo, lineThree];
    expect(removeLastParagraph(multipleParagraphs.join('\n\n'))).toEqual(
      [lineOne, lineTwo].join('\n\n')
    );
  });
});
