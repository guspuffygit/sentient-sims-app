import '@testing-library/jest-dom';
import {
  removeLastParagraph,
  trimIncompleteSentence,
} from 'main/sentient-sims/formatter/PromptFormatter';
import { removeNonPrintableCharacters } from 'main/sentient-sims/util/filter';
import {
  epochToFormattedDate,
  formatLog,
} from 'main/sentient-sims/util/format';

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

  it('remove non printable characters', () => {
    expect(removeNonPrintableCharacters('See what')).toEqual('Seewhat');
  });

  it('epochToFormattedDate', () => {
    const throwError = jest.fn(() => {
      epochToFormattedDate('invalid date');
    });
    expect(throwError).toThrow('Invalid epoch string');

    expect(
      formatLog({
        level: 'TEST',
        timestamp: '1731953773368',
        message: 'test',
      })
    ).toEqual('2024-11-18 18:16:13,368 - TEST - test');
  });
});
