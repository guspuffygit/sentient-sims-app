import fs from 'fs';
import path from 'path';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { EmbeddingService, NoopEmbeddingService } from 'main/sentient-sims/services/EmbeddingService';
import { InteractionSemanticSearchService } from 'main/sentient-sims/services/InteractionSemanticSearchService';
import { BrowsableInteraction } from 'main/sentient-sims/db/dto/InteractionDTO';
import { mockApiContext } from './util';

// Deterministic embeddings: one dimension per topic word plus a shared base
// dimension so unrelated texts still have nonzero similarity to rank below matches
function vectorFor(text: string): Float32Array {
  const lowered = text.toLowerCase();
  return Float32Array.from([lowered.includes('kiss') ? 1 : 0, lowered.includes('joke') ? 1 : 0, 0.1]);
}

class FakeEmbeddingService implements EmbeddingService {
  readonly model = 'fake';

  embedCalls: string[][] = [];

  isAvailable(): boolean {
    return true;
  }

  embed(texts: string[]): Promise<(Float32Array | undefined)[]> {
    this.embedCalls.push(texts);
    return Promise.resolve(texts.map(vectorFor));
  }
}

const browsable = new Map<string, BrowsableInteraction>(
  Object.entries({
    mixer_social_PassionateKiss_targeted_romance_emotionSpecific: {
      name: 'mixer_social_PassionateKiss_targeted_romance_emotionSpecific',
      action: '{actor.0} is leaning in, passionately kissing {actor.1}.',
      source: 'built-in',
    },
    mixer_socials_TellJoke_group_Funny_alwaysOn: {
      name: 'mixer_socials_TellJoke_group_Funny_alwaysOn',
      action: '{actor.0} is telling a funny joke to {actor.1}.',
      source: 'built-in',
    },
    mixer_ScienceTable_Empty: {
      name: 'mixer_ScienceTable_Empty',
      action: '{actor.0} is preparing a scientific experiment.',
      source: 'built-in',
    },
  }),
);

describe('InteractionSemanticSearchService', () => {
  let ctx: ApiContext;
  let fakeEmbedding: FakeEmbeddingService;

  beforeEach(() => {
    ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    fakeEmbedding = new FakeEmbeddingService();
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(fakeEmbedding);
    vi.spyOn(ctx.interactionRepository, 'getBrowsableInteractions').mockResolvedValue(browsable);
  });

  it('ranks the semantically closest interaction first', async () => {
    const response = await ctx.interactionSemanticSearch.search('kiss');

    expect(response.available).toBe(true);
    expect(response.results.length).toBe(3);
    expect(response.results[0].name).toEqual('mixer_social_PassionateKiss_targeted_romance_emotionSpecific');
    expect(response.results[0].score).toBeGreaterThan(response.results[1].score);
  });

  it('persists embeddings so the second search only embeds the query', async () => {
    await ctx.interactionSemanticSearch.search('kiss');

    const cachePath = path.join(ctx.directory.getSentientSimsFolder(), 'interaction_embeddings.json');
    expect(fs.existsSync(cachePath)).toBe(true);

    // A fresh service instance has no in-memory cache, so finding the catalog
    // embeddings proves they were loaded back from disk
    fakeEmbedding.embedCalls = [];
    const response = await new InteractionSemanticSearchService(ctx).search('joke');

    expect(response.results[0].name).toEqual('mixer_socials_TellJoke_group_Funny_alwaysOn');
    expect(fakeEmbedding.embedCalls).toEqual([['joke']]);
  });

  it('reports unavailable without an embedding provider', async () => {
    vi.spyOn(ctx, 'embedding', 'get').mockReturnValue(new NoopEmbeddingService());

    const response = await ctx.interactionSemanticSearch.search('kiss');

    expect(response).toEqual({ available: false, results: [] });
  });

  it('returns no results for an empty query', async () => {
    const response = await ctx.interactionSemanticSearch.search('   ');

    expect(response).toEqual({ available: true, results: [] });
  });
});
