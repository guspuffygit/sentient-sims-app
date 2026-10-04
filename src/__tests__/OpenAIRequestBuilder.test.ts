import { describe, expect, it } from 'vitest';
import {
  MIN_ONE_SHOT_USER_TOKENS,
  OneShotRequest,
  OpenAIRequestBuilder,
} from 'main/sentient-sims/models/OpenAIRequestBuilder';
import { TokenCounter } from 'main/sentient-sims/tokens/TokenCounter';

// One token per character keeps every assertion below arithmetic instead of tokenizer trivia.
const charTokenCounter: TokenCounter = {
  countTokens: (text: string) => text.length,
};

function build(request: Partial<OneShotRequest> & Pick<OneShotRequest, 'systemPrompt' | 'messages'>) {
  const builder = new OpenAIRequestBuilder(charTokenCounter);
  return builder.buildOneShotOpenAIRequest({
    maxResponseTokens: 100,
    maxTokens: 1000,
    ...request,
  });
}

describe('OpenAIRequestBuilder.buildOneShotOpenAIRequest', () => {
  it('sends the user message untouched when it fits the budget', () => {
    const request = build({
      systemPrompt: 'system',
      messages: ['the whole payload'],
      maxTokens: 1000,
    });

    const [system, user] = request.messages;
    expect(system.role).toBe('system');
    expect(system.content).toBe('system');
    expect(user.role).toBe('user');
    expect(user.content).toBe('the whole payload');
    expect(request.promptOverflow).toBeUndefined();
  });

  it('truncates an oversized user message instead of dropping it', () => {
    // 600 chars of payload against a 400 budget: the old builder sent an empty user message.
    const payload = 'x'.repeat(600);
    const request = build({
      systemPrompt: 'system',
      messages: [payload],
      maxTokens: 400,
    });

    const user = request.messages[1];
    expect(user.role).toBe('user');
    expect(user.content.length).toBeGreaterThan(0);
    expect(user.content.length).toBeLessThan(payload.length);
    // Budget minus the six-character system prompt, and the tail is what survives
    expect(user.content.length).toBeLessThanOrEqual(400 - 'system'.length);
    expect(payload.endsWith(user.content)).toBe(true);
    expect(request.promptOverflow).toEqual({
      budgetTokens: 400,
      requestedTokens: 'system'.length + payload.length + 1,
      // 394 of the 601 requested tokens fit (400 budget less the 6-token system prompt)
      droppedTokens: 207,
    });
  });

  it('keeps a floor of user text even when the system prompt alone blows the budget', () => {
    const payload = 'y'.repeat(5000);
    const request = build({
      systemPrompt: 'z'.repeat(500),
      messages: [payload],
      maxTokens: 100,
    });

    const user = request.messages[1];
    // The floor's worth of tail, less the message's trailing newline that trimEnd removes
    expect(user.content.length).toBe(MIN_ONE_SHOT_USER_TOKENS - 1);
    expect(payload.endsWith(user.content)).toBe(true);
    expect(request.promptOverflow?.droppedTokens).toBe(5000 + 1 - MIN_ONE_SHOT_USER_TOKENS);
  });

  it('flags an overflow when the system prompt alone is over budget and nothing was cut', () => {
    // The director briefing carries the whole scene context in the system prompt; the user
    // text is small and fits inside the floor, so nothing is dropped — but the request is
    // still oversized and the exchange log has to say so.
    const request = build({
      systemPrompt: 'z'.repeat(500),
      messages: ['short'],
      maxTokens: 100,
    });

    expect(request.messages[1].content).toBe('short');
    expect(request.promptOverflow).toEqual({
      budgetTokens: 100,
      requestedTokens: 500 + 'short\n'.length,
      droppedTokens: 0,
    });
  });

  it('keeps the newest messages whole and cuts only the one that straddles the budget', () => {
    const request = build({
      systemPrompt: 's',
      // 201 tokens each once the joining newline is counted; 499 available after the system prompt
      messages: ['a'.repeat(200), 'b'.repeat(200), 'c'.repeat(200)],
      maxTokens: 500,
    });

    const user = request.messages[1];
    // The two newest fit whole (402 of 499); the oldest is cut down to its tail
    expect(user.content.endsWith('c'.repeat(200))).toBe(true);
    expect(user.content).toContain('b'.repeat(200));
    const survivingA = user.content.length - user.content.replaceAll('a', '').length;
    expect(survivingA).toBeGreaterThan(0);
    expect(survivingA).toBeLessThan(200);
    expect(request.promptOverflow?.droppedTokens).toBe(200 - survivingA);
  });

  it('charges the pre-response against the budget but never truncates it', () => {
    const request = build({
      systemPrompt: 'system',
      userPreResponse: '### Input:\n',
      messages: ['payload'],
      maxTokens: 1000,
    });

    const user = request.messages[1];
    expect(user.content.startsWith('### Input:')).toBe(true);
    expect(user.content.endsWith('payload')).toBe(true);
    expect(request.promptOverflow).toBeUndefined();
  });

  it('puts the assistant pre-response after the user message and counts it', () => {
    const request = build({
      systemPrompt: 'system',
      assistantPreResponse: 'Buff Title:',
      messages: ['payload'],
    });

    expect(request.messages.map((message) => message.role)).toEqual(['system', 'user', 'assistant']);
    expect(request.messages[2].content).toBe('Buff Title:');
  });

  it('carries guidedChoice and the response budget through', () => {
    const request = build({
      systemPrompt: 'system',
      messages: ['payload'],
      maxResponseTokens: 15,
      guidedChoice: ['happy', 'sad'],
    });

    expect(request.maxResponseTokens).toBe(15);
    expect(request.guidedChoice).toEqual(['happy', 'sad']);
  });

  it('produces an empty user message only when there was no user text', () => {
    const request = build({ systemPrompt: 'system', messages: [] });

    expect(request.messages[1].content).toBe('');
    expect(request.promptOverflow).toBeUndefined();
  });
});
