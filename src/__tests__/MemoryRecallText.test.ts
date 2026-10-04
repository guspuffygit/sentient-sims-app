import { isAttributedLine, memoryRecallText } from 'main/sentient-sims/util/memoryRecallText';
import { summarizeMemory } from 'main/sentient-sims/services/PromptRequestBuilderService';

// A Twitch viewer's question (or the player's chat-window line) is stored on the row as
// `action`, attributed; the sim's reply is `content`. Recall used to read the reply alone.
describe('memoryRecallText', () => {
  it('recalls a reply to the player together with the line it answered', () => {
    const row = {
      location_id: 1,
      event_type: 'chat',
      action: 'Chat: would you consider getting full custody of your son?',
      content: "Vesper Hogan: That's not an issue, Ehren's always with me",
    };
    expect(memoryRecallText(row)).toBe(
      "Chat: would you consider getting full custody of your son?\nVesper Hogan: That's not an issue, Ehren's always with me",
    );
    expect(summarizeMemory(row)).toBe(
      "Chat: would you consider getting full custody of your son? Vesper Hogan: That's not an issue, Ehren's always with me",
    );
  });

  it('leaves an interaction row (bare verb action) and a thought row as they were', () => {
    expect(
      memoryRecallText({ location_id: 1, event_type: 'interaction', action: 'chat', content: 'They chatted.' }),
    ).toBe('They chatted.');
    expect(memoryRecallText({ location_id: 1, event_type: 'thought', content: 'I should call Vesper.' })).toBe(
      'I should call Vesper.',
    );
    // Outcome rows keep their observation, whatever the action says
    expect(
      memoryRecallText({
        location_id: 1,
        event_type: 'outcome',
        action: 'chat',
        observation: 'Jonah tried chat and it succeeded.',
      }),
    ).toBe('Jonah tried chat and it succeeded.');
  });

  it('does not repeat a line the content already opens with', () => {
    const row = { location_id: 1, action: 'The Voice: hello', content: 'The Voice: hello\nEhren Alder: hi' };
    expect(memoryRecallText(row)).toBe('The Voice: hello\nEhren Alder: hi');
  });

  it('falls back to the action, then the pre_action, when there is no body', () => {
    expect(memoryRecallText({ location_id: 1, action: 'Chat: are you there?' })).toBe('Chat: are you there?');
    expect(memoryRecallText({ location_id: 1, pre_action: 'Jonah is cooking' })).toBe('Jonah is cooking');
  });

  it('recognises an attributed line and nothing else', () => {
    expect(isAttributedLine('Chat: hello')).toBe(true);
    expect(isAttributedLine('Chat (nova, to Ehren): hello')).toBe(true);
    expect(isAttributedLine('chat')).toBe(false);
    expect(isAttributedLine('Note: to self')).toBe(true);
    expect(isAttributedLine(undefined)).toBe(false);
    expect(isAttributedLine('a: ')).toBe(false);
  });
});
