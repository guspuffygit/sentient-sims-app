import { Server } from 'http';
import fs from 'fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { MessageImage } from 'main/sentient-sims/models/OpenAIMessage';
import { mockApiContext, mockEnvironment } from './util';

// "Auto-Generate Description" on the Locations page: POST /locations/:id/describe writes a card from the
// lot block the game reported, hands it to the editor, and stores nothing. A lot the game has
// not reported this app run is a 409, not a description written from no facts.
describe('POST /locations/:locationId/describe', () => {
  const { directoryService, settingsService } = mockEnvironment();
  const ctx = mockApiContext({ port: 25209, directoryService, settingsService });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;
  const prompts: string[] = [];
  const sentImages: Array<MessageImage[] | undefined> = [];
  const screenshot: MessageImage = { mimeType: 'image/jpeg', data: 'aGVsbG8=' };

  async function describeLot(id: string, screenshots?: MessageImage[]) {
    const response = await fetch(`${apiUrl}/locations/${id}/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(screenshots ? { screenshots } : {}),
    });
    return { status: response.status, body: (await response.json()) as Record<string, string> };
  }

  function describeWith(apiType: ApiType) {
    vi.spyOn(ctx.providerConfigs, 'getConfigForDirectedStage').mockReturnValue({
      id: 'test',
      name: 'test',
      apiType,
      model: 'test-model',
    });
  }

  beforeAll(() => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `describe-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label, _system, userText, ...rest) => {
      prompts.push(userText);
      sentImages.push(rest[4]?.images);
      const text =
        'Pectoral Fitness is a gym in Del Sol Valley with floor-to-ceiling windows. Treadmills and weight machines fill the floor, with a boxing ring in one corner. Locker rooms with showers are at the back.';
      return Promise.resolve({
        exchange: { label, request: { messages: [], maxResponseTokens: 0 }, responseText: text },
        text,
      });
    });
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 1,
      lot: {
        zone_id: 7,
        lot_id: '2841378864',
        lot_name: 'Pectoral Fitness',
        venue: 'venue_gym',
        owned: { punchingbag: 2 },
      },
      sims: [],
    } as unknown as SimStateReport);
    server = runApi(ctx);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  it('writes from the reported lot block and stores nothing', async () => {
    const { status, body } = await describeLot('2841378864');
    expect(status).toBe(200);
    expect(body.description).toContain('Pectoral Fitness is a gym');
    expect(body.facts).toContain('Kind of place: a gym');
    expect(prompts[0]).toContain('Name: Pectoral Fitness');
    // The row is untouched: the editor holds the text until the player saves it
    expect(ctx.locationRepository.getModifiedLocations().map((location) => String(location.id))).not.toContain(
      '2841378864',
    );
  });

  it('is a 409 for a lot the game has not reported this app run', async () => {
    const { status, body } = await describeLot('90336000');
    expect(status).toBe(409);
    expect(body.error).toContain('Visit this lot');
  });

  it('writes from screenshots alone for a lot not visited, and sends them with the facts', async () => {
    describeWith(ApiType.OpenAI);
    const { status, body } = await describeLot('90336000', [screenshot]);
    expect(status).toBe(200);
    expect(body.description).toBeTruthy();
    expect(prompts.at(-1)).toContain('Screenshots of this lot are attached');
    expect(sentImages.at(-1)).toEqual([screenshot]);
  });

  it('is a 400 naming the providers when the description AI cannot see images', async () => {
    describeWith(ApiType.SentientSimsAI);
    const { status, body } = await describeLot('2841378864', [screenshot]);
    expect(status).toBe(400);
    expect(body.error).toContain('OpenAI, Gemini or OpenRouter');
  });

  it('names the lot as the app knows it, not by a name it was given in game', async () => {
    describeWith(ApiType.OpenAI);
    ctx.simStateCache.ingest({
      type: 'state_report',
      seq: 2,
      lot: { zone_id: 8, lot_id: '90369424', lot_name: 'Jazz Hands Bar', venue: 'venue_bar', owned: {} },
      sims: [],
    } as unknown as SimStateReport);
    const { status } = await describeLot('90369424');
    expect(status).toBe(200);
    expect(prompts.at(-1)).toContain('Name: The Blue Velvet');
    expect(prompts.at(-1)).not.toContain('Jazz Hands');
  });
});
