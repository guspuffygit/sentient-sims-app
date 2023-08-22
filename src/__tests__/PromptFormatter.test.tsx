import '@testing-library/jest-dom';
import { PromptFormatter } from '../main/sentient-sims/PromptFormatter';

describe('Prompt Formatter', () => {
  it('should trim output user and assistant tokens', () => {
    const formatter: PromptFormatter = new PromptFormatter(true);

    const sentence = `This is a sentence. ${formatter.userToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentence)).toEqual('This is a sentence.');

    const sentenceTwo = `This is a sentence. ${formatter.assistantToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentenceTwo)).toEqual('This is a sentence.');

    const sentenceThree = `This is a sentence.${formatter.assistantToken} ${formatter.userToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentenceThree)).toEqual(
      'This is a sentence.'
    );
  });
});
