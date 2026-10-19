import { ApiType } from 'main/sentient-sims/models/ApiType';
import { OpenAICompatibleRequest } from 'main/sentient-sims/models/OpenAICompatibleRequest';

type GenerateContentRequest = {
  model: string;
  config?: { maxOutputTokens?: number; thinkingConfig?: { thinkingBudget?: number; thinkingLevel?: string } };
};

const calls: GenerateContentRequest[] = [];
let respond: (request: GenerateContentRequest) => Promise<{ text: string }>;

vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  GoogleGenAI: class {
    models = {
      generateContent: (request: GenerateContentRequest) => {
        calls.push(request);
        return respond(request);
      },
    };
  },
}));

// Imported after the mock so the service picks up the fake Gemini client
const { mockApiContext } = await import('./util');

function rejection(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

// Thinking tokens count against maxOutputTokens: a 220-token description on gemini-3.8-flash
// spent 209 thinking and stopped mid-sentence (2026-10-17)
describe('Gemini thinking cap', () => {
  const request = (model: string): OpenAICompatibleRequest => ({
    model,
    maxResponseTokens: 220,
    messages: [{ role: 'user', content: 'Facts about Pectoral Fitness', tokens: 1 }],
  });

  function gemini() {
    const ctx = mockApiContext();
    ctx.settings.geminiKeys = 'key1';
    return ctx.getGenerationService(ApiType.Gemini);
  }

  beforeEach(() => {
    calls.length = 0;
    respond = () => Promise.resolve({ text: 'Pectoral Fitness is a two-story gym.' });
  });

  it('turns thinking off and keeps the reply budget as asked', async () => {
    const response = await gemini().sentientSimsGenerate(request('models/gemini-3.8-flash'));
    expect(response.text).toEqual('Pectoral Fitness is a two-story gym.');
    expect(calls).toHaveLength(1);
    expect(calls[0].config).toMatchObject({ maxOutputTokens: 220, thinkingConfig: { thinkingBudget: 0 } });
  });

  it('falls back to low thinking with room for it, and remembers the model', async () => {
    respond = (sent) =>
      sent.config?.thinkingConfig?.thinkingBudget === 0
        ? Promise.reject(rejection('Budget 0 is invalid. This model only works in thinking mode.'))
        : Promise.resolve({ text: 'A gym.' });
    const service = gemini();
    await service.sentientSimsGenerate(request('models/gemini-3-pro'));
    expect(calls.map((sent) => sent.config?.thinkingConfig)).toEqual([{ thinkingBudget: 0 }, { thinkingLevel: 'LOW' }]);
    expect(calls[1].config?.maxOutputTokens).toBe(220 + 1024);

    calls.length = 0;
    await service.sentientSimsGenerate(request('models/gemini-3-pro'));
    expect(calls.map((sent) => sent.config?.thinkingConfig)).toEqual([{ thinkingLevel: 'LOW' }]);
  });

  it('sends no thinking setting to a model that takes neither, with the same headroom', async () => {
    respond = (sent) =>
      sent.config?.thinkingConfig
        ? Promise.reject(rejection('Thinking is not supported for this model.'))
        : Promise.resolve({ text: 'A gym.' });
    await gemini().sentientSimsGenerate(request('models/gemini-2.5-pro'));
    expect(calls).toHaveLength(3);
    expect(calls[2].config?.thinkingConfig).toBeUndefined();
    expect(calls[2].config?.maxOutputTokens).toBe(220 + 1024);
  });

  it('does not treat other errors as a thinking rejection', async () => {
    respond = () => Promise.reject(Object.assign(new Error('Internal error'), { status: 500 }));
    await expect(gemini().sentientSimsGenerate(request('models/gemini-3.8-flash'))).rejects.toThrow('Internal error');
    // The ordinary retries, all on the first setting
    expect(calls.every((sent) => sent.config?.thinkingConfig?.thinkingBudget === 0)).toBe(true);
  });
});
