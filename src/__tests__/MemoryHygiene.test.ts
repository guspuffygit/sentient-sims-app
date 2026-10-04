import * as fs from 'fs';
import { validateMemoryContent, stripArtifacts } from 'main/sentient-sims/util/memoryHygiene';
import { mockApiContext } from './util';

describe('memoryHygiene', () => {
  it('rejects the refusal phrasings observed in the playtest DB', () => {
    const refusals = [
      "I can't help with that.",
      // Curly apostrophe variant (playtest id 3275) must not dodge the ASCII pattern
      'I can’t help with that.',
      "I'm not going to describe that scene.",
      'I cannot comply with this request.',
      "I'm sorry, but I can't continue this.",
      'As an AI, I cannot write that.',
      "I'm not seeing any dialogue in the provided text.",
      "I'll review the scene according to the guidelines you provided.",
    ];
    refusals.forEach((text) => {
      const result = validateMemoryContent(text);
      expect(result.ok).toBe(false);
    });
  });

  it('rejects leaked prompt scaffolding', () => {
    const scaffolds = [
      '2 SPEAKERS. Each speaker gets their OWN separate line. No speaker may continue.',
      '[AI: Hello! PLEASE SKIP describing the time of day] Alex waves.',
      'Something something <PERCEPTION> block here',
    ];
    scaffolds.forEach((text) => {
      expect(validateMemoryContent(text).ok).toBe(false);
    });
  });

  it('rejects empty content and accepts real prose', () => {
    expect(validateMemoryContent('').ok).toBe(false);
    expect(validateMemoryContent('   ').ok).toBe(false);
    expect(validateMemoryContent(undefined).ok).toBe(false);
    expect(validateMemoryContent('Alex: I missed you.\nBella: Missed you too.').ok).toBe(true);
    // Prose that merely mentions inability mid-sentence is not a refusal
    expect(validateMemoryContent("Jake sighed. He couldn't help but smile at the mess.").ok).toBe(true);
  });

  it('strips the article artifact prefix but keeps the prose', () => {
    expect(stripArtifacts('article: Adrian spun up the decks.')).toBe('Adrian spun up the decks.');
    expect(stripArtifacts('Adrian spun up the decks.')).toBe('Adrian spun up the decks.');
    // Fused prefix (playtest id 913) and capitalized variant (id 920)
    expect(stripArtifacts("articleSweat beaded on Milo's forehead.")).toBe("Sweat beaded on Milo's forehead.");
    expect(stripArtifacts('Article As Tessa turned away, Milo froze.')).toBe('As Tessa turned away, Milo froze.');
    // Real words that merely start with "articl" survive
    expect(stripArtifacts('articulate as ever, Adrian won the room.')).toBe('articulate as ever, Adrian won the room.');
  });
});

describe('MemoryRepository hygiene gate', () => {
  function loadedContext() {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: `${Date.now()}${Math.floor(Math.random() * 10000)}`, saveId: '2' });
    return ctx;
  }

  it('refuses to persist refusal content', () => {
    const ctx = loadedContext();
    const result = ctx.memoryRepository.createMemory({
      memory: { content: "I can't help with that.", location_id: 1, event_type: 'wickedwhims' },
      participants: [{ id: '1' }],
    });
    expect(result).toBeUndefined();
    expect(ctx.memoryRepository.getMemories()).toHaveLength(0);
  });

  it('refuses rows with no text anywhere', () => {
    const ctx = loadedContext();
    const result = ctx.memoryRepository.createMemory({
      memory: { location_id: 1, event_type: 'interaction', interaction_name: 'sim_Chat' },
      participants: [{ id: '1' }],
    });
    expect(result).toBeUndefined();
    expect(ctx.memoryRepository.getMemories()).toHaveLength(0);
  });

  it('keeps pre-action fallback rows (they render and carry scene context)', () => {
    const ctx = loadedContext();
    const result = ctx.memoryRepository.createMemory({
      memory: { pre_action: 'Alex waves', location_id: 1, event_type: 'interaction', interaction_name: 'sim_Chat' },
      participants: [{ id: '1' }],
    });
    expect(result).toBeDefined();
  });

  it('accepts observation-only outcome rows', () => {
    const ctx = loadedContext();
    const result = ctx.memoryRepository.createMemory({
      memory: {
        observation: "Jonah tried 'chat' with Alex and it succeeded.",
        location_id: 1,
        event_type: 'outcome',
      },
      participants: [{ id: '1' }],
    });
    expect(result).toBeDefined();
    expect(result?.observation).toContain('succeeded');
  });

  it('strips the article prefix before persisting', () => {
    const ctx = loadedContext();
    const result = ctx.memoryRepository.createMemory({
      memory: { content: 'article: Adrian nailed the transition.', location_id: 1, event_type: 'interaction' },
      participants: [{ id: '1' }],
    });
    expect(result?.content).toBe('Adrian nailed the transition.');
  });
});

describe('near-duplicate detection (N-6)', () => {
  it('scores a re-stored thought as an echo and a different thought as fresh', async () => {
    const { trigramJaccard, NEAR_DUP_JACCARD } = await import('../main/sentient-sims/util/memoryHygiene');
    const a = "Milo (thinking): I should really call Tessa before she thinks I've forgotten her.";
    const b = "Milo (thinking): I should really call Tessa before she thinks I've forgotten her!";
    const c = 'Milo (thinking): The fridge is empty again and the bills are due.';
    expect(trigramJaccard(a, b)).toBeGreaterThanOrEqual(NEAR_DUP_JACCARD);
    expect(trigramJaccard(a, c)).toBeLessThan(NEAR_DUP_JACCARD);
    expect(trigramJaccard('', c)).toBe(0);
  });
});
