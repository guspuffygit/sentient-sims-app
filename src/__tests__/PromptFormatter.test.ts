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

    expect(formatter.formatMemory({})).toBeUndefined();

    expect(
      formatter.formatMemory({
        pre_action: `hello\n\n`,
        content: `\n hi\n`,
        observation: `obs`,
      })
    ).toEqual(
      `${formatter.userToken}\nhello\n${formatter.assistantToken}\nhi\n${formatter.userToken}\nobs`
    );

    expect(
      formatter.formatMemory({
        pre_action: '\nhello\n',
        observation: '1029j',
      })
    ).toEqual(`${formatter.userToken}\nhello\n${formatter.userToken}\n1029j`);
  });

  it('format actions', () => {
    const formatter = new MythoMaxPromptFormatter();

    expect(formatter.formatActions()).toBeUndefined();

    expect(formatter.formatActions(' pre action ')).toEqual(
      `${formatter.userToken}\npre action`
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
    ).toEqual([{ content: 'hello', role: 'user', tokens: 1 }]);

    expect(
      formatter.formatMemory({
        pre_action: 'hello\n\n',
        content: '\nhi\n',
        observation: 'obs',
      })
    ).toEqual([
      { content: 'obs', role: 'user', tokens: 1 },
      { content: 'hi', role: 'assistant', tokens: 1 },
      { content: 'hello', role: 'user', tokens: 1 },
    ]);

    expect(
      formatter.formatMemory({
        pre_action: '\nhello\n',
        observation: '1029j',
      })
    ).toEqual([
      { content: '1029j', role: 'user', tokens: 3 },
      { content: 'hello', role: 'user', tokens: 1 },
    ]);
  });
});
