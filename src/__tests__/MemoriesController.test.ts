import * as fs from 'fs';
import { Server } from 'http';
import { runApi } from 'main/sentient-sims/api';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { mockApiContext } from './util';

describe('MemoriesController', () => {
  const ctx = mockApiContext({ port: 25199 });
  const apiUrl = `http://localhost:${ctx.port}`;
  let server: Server;

  beforeAll(() => {
    server = runApi(ctx);
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: '5150', saveId: '1' });
    const rows: Array<[string, string]> = [
      ['outcome', "Marisol Vega tried 'pay_bills' and it succeeded."],
      ['interaction', 'Marisol Vega is asking Julio Brewer about their career.'],
      ['chat', 'Julio Brewer: Fine, thanks.'],
    ];
    rows.forEach(([event_type, content]) => {
      ctx.memoryRepository.createMemory({
        memory: { location_id: 1, content, event_type },
        participants: [{ id: '128937674' }],
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  async function eventTypes(query: string): Promise<string[]> {
    const res = await fetch(`${apiUrl}/memories${query}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as MemoryEntity[];
    return body.map((memory) => memory.event_type as string);
  }

  it('returns every row without a query', async () => {
    expect(await eventTypes('')).toEqual(['outcome', 'interaction', 'chat']);
  });

  it('leaves out the event types named in exclude_event_types', async () => {
    expect(await eventTypes('?exclude_event_types=outcome')).toEqual(['interaction', 'chat']);
    expect(await eventTypes('?exclude_event_types=outcome,chat')).toEqual(['interaction']);
    expect(await eventTypes('?exclude_event_types=outcome&exclude_event_types=chat')).toEqual(['interaction']);
  });

  it('ignores an empty or unknown exclude list', async () => {
    expect(await eventTypes('?exclude_event_types=')).toEqual(['outcome', 'interaction', 'chat']);
    expect(await eventTypes('?exclude_event_types=nothing_like_this')).toEqual(['outcome', 'interaction', 'chat']);
  });
});
