import { Server } from 'http';
import fs from 'fs';
import { afterAll, beforeAll, describe, expect, it, MockInstance, vi } from 'vitest';
import { runApi } from 'main/sentient-sims/api';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { mockApiContext, mockEnvironment } from './util';

// "Auto-Generate Description" on the Locations page: POST /locations/:id/describe writes three cards from the
// lot block the game reported, hands them to the editor, and stores nothing. A lot the game has
// not reported this app run is a 409, not a description written from no facts; a provider error comes back in plain words.
describe('POST /locations/:locationId/describe', () => {
  const { directoryService, settingsService } = mockEnvironment();
  const ctx = mockApiContext({ port: 25209, directoryService, settingsService });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;
  const prompts: string[] = [];
  let writer: MockInstance<typeof ctx.ai.runOneShot>;

  async function describeLot(id: string) {
    const response = await fetch(`${apiUrl}/locations/${id}/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return {
      status: response.status,
      body: (await response.json()) as {
        description?: string;
        versions?: string[];
        facts?: string;
        error?: string;
        inSettings?: boolean;
      },
    };
  }

  beforeAll(() => {
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `describe-${Math.random().toString(36).slice(2)}`, saveId: '1' });
    writer = vi.spyOn(ctx.ai, 'runOneShot').mockImplementation((label, _system, userText) => {
      prompts.push(userText);
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

  it('writes three drafts from the reported lot block and stores nothing', async () => {
    const { status, body } = await describeLot('2841378864');
    expect(status).toBe(200);
    expect(body.description).toContain('Pectoral Fitness is a gym');
    expect(body.versions).toHaveLength(3);
    expect(body.versions?.[0]).toEqual(body.description);
    expect(writer).toHaveBeenCalledTimes(3);
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

  it('calls the writer as an editor press, outside provider health', async () => {
    await describeLot('2841378864');
    expect(writer.mock.calls.at(-1)?.[7]).toMatchObject({ interactive: true });
  });

  it("says what the provider's error means and that the fix is in Settings", async () => {
    writer.mockRejectedValueOnce(new Error('401 Incorrect API key provided: sk-abc'));
    const { status, body } = await describeLot('2841378864');
    expect(status).toBe(500);
    expect(body.error).toContain("didn't accept your API key");
    expect(body.error).not.toContain('sk-abc');
    expect(body.inSettings).toBe(true);
  });

  it('names the lot as the app knows it, not by a name it was given in game', async () => {
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
