import { ApiType } from 'main/sentient-sims/models/ApiType';
import { KoboldAIService } from 'main/sentient-sims/services/KoboldAIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

// Nothing listens on port 1, so every request is refused the same way it is
// on a player's box where KoboldAI was never started
const closedEndpoint = 'http://127.0.0.1:1';

describe('KoboldAIService when KoboldAI is not running', () => {
  let ctx: ApiContext;
  let kobold: KoboldAIService;

  beforeEach(() => {
    ctx = mockApiContext();
    ctx.settings.aiApiType = ApiType.KoboldAI;
    ctx.settings.koboldaiEndpoint = closedEndpoint;
    kobold = ctx.genai as KoboldAIService;
    expect(kobold).toBeInstanceOf(KoboldAIService);
  });

  it('explains that KoboldAI is not reachable instead of "fetch failed"', async () => {
    await expect(kobold.generate('Hello', 10)).rejects.toThrow(`Could not connect to KoboldAI at ${closedEndpoint}`);
    await expect(kobold.generate('Hello', 10)).rejects.not.toThrow('fetch failed');
  });

  it('keeps the original network error as the cause', async () => {
    const err = await kobold.generate('Hello', 10).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).cause).toBeInstanceOf(TypeError);
  });

  it('reports the same guidance from the health check', async () => {
    const health = await kobold.healthCheck();
    expect(health.status).toContain(`Could not connect to KoboldAI at ${closedEndpoint}`);
    expect(health.status).toContain('switch to a different AI provider');
  });
});
