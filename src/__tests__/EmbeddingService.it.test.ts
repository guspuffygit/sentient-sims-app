import {
  OPENAI_EMBEDDING_MODEL,
  OpenAIEmbeddingService,
  bufferToEmbedding,
  cosineSimilarity,
  embeddingToBuffer,
} from 'main/sentient-sims/services/EmbeddingService';
import { mockApiContext } from './util';

// Real OpenAI round-trip; skipped when no key is configured (e.g. Scott's machine)
describe.runIf(Boolean(process.env.OPENAI_KEY))('OpenAIEmbeddingService', () => {
  it('embeds related texts closer together than unrelated ones', async () => {
    const service = new OpenAIEmbeddingService(mockApiContext());
    expect(service.isAvailable()).toBe(true);
    expect(service.model).toEqual(OPENAI_EMBEDDING_MODEL);

    const [cat, kitten, invoice] = await service.embed([
      'A fluffy cat curled up asleep on the sofa.',
      'A small kitten napping on a couch cushion.',
      'Quarterly invoice for plumbing services, due within thirty days.',
    ]);
    if (!cat || !kitten || !invoice) {
      throw new Error('Expected embeddings for all three texts');
    }

    // Survives the BLOB serialization used by memory_index
    const roundTripped = bufferToEmbedding(embeddingToBuffer(cat));
    expect(cosineSimilarity(cat, roundTripped)).toBeCloseTo(1);

    expect(cosineSimilarity(cat, kitten)).toBeGreaterThan(cosineSimilarity(cat, invoice));
  });
});
