import { plainKeyTestError, plainProviderError } from 'main/sentient-sims/util/providerErrorWords';

// What a provider's error means for the player, by the raw texts seen live or documented
describe('plainProviderError', () => {
  const plain = (raw: string) => plainProviderError(raw).plain;

  it('says a model cannot see pictures, not that it was not found (OpenRouter, 2026-10-17)', () => {
    const raw = '404 No endpoints found that support image input';
    expect(plain(raw)).toContain("can't look at pictures");
    expect(plainProviderError(raw)).toMatchObject({ raw, inSettings: true });
  });

  it('points a bad or missing key at Settings', () => {
    expect(plain('401 Incorrect API key provided: sk-...')).toContain("didn't accept your API key");
    expect(plain('No Gemini API keys set. Please configure them in settings')).toContain('API key');
    expect(plainProviderError('401 Unauthorized').inSettings).toBe(true);
    expect(plain('403 Forbidden')).toContain('refused the request');
  });

  it("tells Gemini's switched-off API apart from a plain 403", () => {
    expect(
      plain('403 Generative Language API has not been used in project 123 before or it is disabled. SERVICE_DISABLED'),
    ).toContain('Generative Language API');
  });

  it('tells an empty account apart from a busy one', () => {
    expect(plain('429 You exceeded your current quota, please check your plan and billing details')).toContain(
      'out of credits',
    );
    expect(plain('402 Insufficient credits')).toContain('out of credits');
    expect(plain('429 Rate limit exceeded: free-models-per-min')).toContain('too many requests');
  });

  it('names a model the provider does not have', () => {
    expect(plain('404 The model `gpt-9` does not exist')).toContain("doesn't have the model");
  });

  it('says what a connection failure means', () => {
    expect(plain('connect ECONNREFUSED 127.0.0.1:5001')).toContain('make sure it is started');
    expect(plain('getaddrinfo ENOTFOUND openrouter.ai')).toContain('internet connection');
    expect(plain('Request timed out.')).toContain('took too long');
    expect(plain('503 Service Unavailable')).toContain('on its end');
  });

  it('falls back to a plain sentence, never the raw text', () => {
    expect(plainProviderError('something odd')).toEqual({
      plain: 'The AI provider returned an error.',
      raw: 'something odd',
      inSettings: false,
    });
  });
});

// The key test on the setup wizard and Settings, by the raw texts seen there (2026-10-26)
describe('plainKeyTestError', () => {
  it('says a made-up OpenAI key did not work, and never echoes it', () => {
    const raw =
      '401 Incorrect API key provided: sk-made-up-1234. You can find your API key at https://platform.openai.com/account/api-keys.';
    const message = plainKeyTestError(raw);
    expect(message).toBe("That key didn't work. Check that you copied all of it.");
    expect(message).not.toContain('sk-made-up');
  });

  it("reads Gemini's JSON error as a refused key", () => {
    const raw = JSON.stringify({
      error: {
        code: 400,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'INVALID_ARGUMENT',
        details: [{ reason: 'API_KEY_INVALID', domain: 'googleapis.com' }],
      },
    });
    expect(plainKeyTestError(raw)).toBe("That key didn't work. Check that you copied all of it.");
  });

  it('keeps the plain words for anything that is not the key', () => {
    expect(plainKeyTestError('getaddrinfo ENOTFOUND api.openai.com')).toContain('internet connection');
    expect(plainKeyTestError('something odd')).toBe('The AI provider returned an error.');
  });
});
