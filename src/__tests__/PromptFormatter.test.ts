import '@testing-library/jest-dom';
import { MythoMaxPromptFormatter } from 'main/sentient-sims/formatter/MythoMaxPromptFormatter';
import { OpenAIPromptFormatter } from 'main/sentient-sims/formatter/OpenAIPromptFormatter';

describe('MythoMax Prompt Formatter', () => {
  it('should trim output user and assistant tokens', () => {
    const formatter = new MythoMaxPromptFormatter();

    const sentence = `This is a sentence. ${formatter.userToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentence)).toEqual('This is a sentence.');

    const sentenceTwo = `This is a sentence. ${formatter.assistantToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentenceTwo)).toEqual('This is a sentence.');

    const sentenceThree = `This is a sentence.${formatter.assistantToken} ${formatter.userToken} oqiwjdoiqjwd`;
    expect(formatter.formatOutput(sentenceThree)).toEqual(
      'This is a sentence.'
    );
  });

  it('format memory', () => {
    const formatter = new MythoMaxPromptFormatter();

    expect(formatter.formatMemory({})).toEqual([]);

    expect(
      formatter.formatMemory({
        pre_action: `hello\n\n`,
        content: `\n hi\n`,
        observation: `obs`,
      })
    ).toEqual([
      `${formatter.userToken}\nobs`,
      `${formatter.assistantToken}\nhi`,
      `${formatter.userToken}\nhello`,
    ]);

    expect(
      formatter.formatMemory({
        pre_action: '\nhello\n',
        observation: '1029j',
      })
    ).toEqual([
      `${formatter.userToken}\n1029j`,
      `${formatter.userToken}\nhello`,
    ]);
  });

  it('format actions', () => {
    const formatter = new MythoMaxPromptFormatter();

    expect(formatter.formatActions()).toEqual('### Response:\n');

    expect(formatter.formatActions(' pre action ')).toEqual(
      `${formatter.userToken}\npre action\n${formatter.assistantActionResponseToken}`
    );
  });
});

describe('OpenAI Prompt Formatter', () => {
  it('output remains the same', () => {
    const formatter = new OpenAIPromptFormatter();
    const expected = 'output';
    expect(formatter.formatOutput(expected)).toEqual(expected);
  });

  it('format memory', () => {
    const formatter = new OpenAIPromptFormatter();

    expect(formatter.formatMemory({})).toEqual([]);

    expect(
      formatter.formatMemory({
        pre_action: 'hello',
      })
    ).toEqual([{ content: 'hello', role: 'user', tokens: 5 }]);

    expect(
      formatter.formatMemory({
        pre_action: 'hello\n\n',
        content: '\nhi\n',
        observation: 'obs',
      })
    ).toEqual([
      { content: 'obs', role: 'user', tokens: 5 },
      { content: 'hi', role: 'assistant', tokens: 5 },
      { content: 'hello', role: 'user', tokens: 5 },
    ]);

    expect(
      formatter.formatMemory({
        pre_action: '\nhello\n',
        observation: '1029j',
      })
    ).toEqual([
      { content: '1029j', role: 'user', tokens: 7 },
      { content: 'hello', role: 'user', tokens: 5 },
    ]);
  });
});
