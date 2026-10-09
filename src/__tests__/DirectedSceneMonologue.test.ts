import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { isForeignSpeakerLine, parseActorPerformance, parseSceneScores } from 'main/sentient-sims/services/AIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { mockApiContext } from './util';

const SPEAKERS = ['Ricky Rickerson', 'Richy Richardson'];

function loadedContext(sessionId: string): ApiContext {
  const ctx = mockApiContext();
  fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
  ctx.db.loadDatabase({ sessionId, saveId: '1' });
  return ctx;
}

describe('parseActorPerformance', () => {
  it('parses the SAY/THINK format', () => {
    const parsed = parseActorPerformance('SAY: Nice weather today.\nTHINK: I cannot stand this guy.', SPEAKERS);
    expect(parsed.say).toEqual('Nice weather today.');
    expect(parsed.think).toEqual('I cannot stand this guy.');
  });

  it('handles reordered tags, quotes, and speaker prefixes', () => {
    const parsed = parseActorPerformance(
      'THINK: "Why is he even here?"\nSAY: Ricky Rickerson: "Good to see you."',
      SPEAKERS,
    );
    expect(parsed.say).toEqual('Good to see you.');
    expect(parsed.think).toEqual('Why is he even here?');
  });

  it('handles bare labels with the text on the next line', () => {
    const parsed = parseActorPerformance('SAY:\nHello.\nTHINK:\nUgh, not again.', SPEAKERS);
    expect(parsed.say).toEqual('Hello.');
    expect(parsed.think).toEqual('Ugh, not again.');
  });

  it('falls back to plain-subtitle parsing when no tags are present', () => {
    const parsed = parseActorPerformance('Nice weather today.', SPEAKERS);
    expect(parsed.say).toEqual('Nice weather today.');
    expect(parsed.think).toEqual('');
  });

  it('keeps only the first of duplicated tags', () => {
    const parsed = parseActorPerformance('SAY: First line.\nSAY: Second line.\nTHINK: One thought.', SPEAKERS);
    expect(parsed.say).toEqual('First line.');
    expect(parsed.think).toEqual('One thought.');
  });
});

describe('isForeignSpeakerLine', () => {
  it('flags a line the actor wrote for the player persona', () => {
    expect(isForeignSpeakerLine("The Voice: Let's just say I've been watching.", 'Ricky Rickerson', SPEAKERS)).toBe(
      true,
    );
    expect(isForeignSpeakerLine('"Guardian Angel: hush now"', 'Ricky Rickerson', SPEAKERS)).toBe(true);
  });

  it('flags a line the actor wrote for the player under their custom name', () => {
    // The caller appends the live playerSpeakerName, so a renamed player ("Robin") is
    // guarded exactly like the built-in persona labels
    expect(isForeignSpeakerLine('Robin: hush now', 'Ricky Rickerson', [...SPEAKERS, 'Robin'])).toBe(true);
    expect(isForeignSpeakerLine('I keep hearing Robin in my head', 'Ricky Rickerson', [...SPEAKERS, 'Robin'])).toBe(
      false,
    );
  });

  it('flags a line the actor wrote for another sim, but not their own label', () => {
    expect(isForeignSpeakerLine('Richy Richardson: I never said that.', 'Ricky Rickerson', SPEAKERS)).toBe(true);
    expect(isForeignSpeakerLine('Ricky Rickerson: I never said that.', 'Ricky Rickerson', SPEAKERS)).toBe(false);
  });

  it('leaves ordinary lines alone, including ones that merely mention the voice', () => {
    expect(isForeignSpeakerLine('Why is The Voice telling me this now?', 'Ricky Rickerson', SPEAKERS)).toBe(false);
    expect(isForeignSpeakerLine('I hope it tells me something true for once', 'Ricky Rickerson', SPEAKERS)).toBe(false);
  });
});

describe('parseSceneScores', () => {
  const NAMES = ['Alice', 'Bob'];

  it('parses a clean score object', () => {
    const scores = parseSceneScores(
      '{"Alice": {"memory": 4, "action": 8, "action_reason": "I want to leave."}, "Bob": {"memory": 2, "action": 1, "action_reason": "Happy right here."}}',
      NAMES,
    );
    expect(scores.get('Alice')).toEqual({ memory: 4, action: 8, action_reason: 'I want to leave.' });
    expect(scores.get('Bob')).toEqual({ memory: 2, action: 1, action_reason: 'Happy right here.' });
  });

  it('tolerates prose around the JSON, string numbers, and case-insensitive names', () => {
    const scores = parseSceneScores('Here are the scores:\n{"alice": {"memory": "7", "action": "3"}}\nDone.', NAMES);
    expect(scores.get('Alice')).toEqual({ memory: 7, action: 3, action_reason: undefined });
  });

  it('clamps out-of-range values into 1-10', () => {
    const scores = parseSceneScores('{"Alice": {"memory": 15, "action": 0}}', NAMES);
    expect(scores.get('Alice')?.memory).toEqual(10);
    expect(scores.get('Alice')?.action).toEqual(1);
  });

  it('drops unknown names and returns empty on garbage', () => {
    expect(parseSceneScores('{"Eve": {"memory": 5, "action": 5}}', NAMES).size).toEqual(0);
    expect(parseSceneScores('no json here', NAMES).size).toEqual(0);
    expect(parseSceneScores('{broken json', NAMES).size).toEqual(0);
  });
});

describe('private memory ownership', () => {
  it('createMemory stamps owner and importance into memory_index synchronously', () => {
    const ctx = loadedContext('monologue-stamp');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const created = ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 1, content: 'I wish he would just leave.', event_type: 'monologue' },
        participants: [{ id: '300' }],
        index: { owner: '300', importance: 9 },
      },
      { notifyMod: false },
    );

    const row = ctx.memoryIndexRepository.getIndex(String(created?.id));
    expect(row?.importance).toEqual(9);
    expect(Number(row?.owner_participant_id)).toEqual(300);
  });

  it('annotate keeps a precomputed importance (no rating call) and preserves the owner', async () => {
    const ctx = loadedContext('monologue-annotate');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const created = ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 1, content: 'A pre-scored private thought.', event_type: 'monologue' },
        participants: [{ id: '300' }],
        index: { owner: '300', importance: 8 },
      },
      { notifyMod: false },
    );
    if (!created) {
      throw new Error('test memory rejected');
    }

    const rateSpy = vi.fn(() => Promise.reject(new Error('should not rate a pre-scored memory')));
    (ctx.ai as unknown as { runOneShot: unknown }).runOneShot = rateSpy;

    await ctx.memoryAnnotation.annotate(created);

    expect(rateSpy).not.toHaveBeenCalled();
    const row = ctx.memoryIndexRepository.getIndex(String(created.id));
    expect(row?.importance).toEqual(8);
    expect(Number(row?.owner_participant_id)).toEqual(300);
  });

  it('retrieval candidates fail closed: private rows need their owner in scope', () => {
    const ctx = loadedContext('monologue-scope');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const shared = ctx.memoryRepository.createMemory({
      memory: { location_id: 1, content: 'A shared scene everyone saw.' },
      participants: [{ id: '100' }, { id: '200' }],
    });
    const privateA = ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 1, content: 'Private thought of sim 100.', event_type: 'monologue' },
        participants: [{ id: '100' }],
        index: { owner: '100' },
      },
      { notifyMod: false },
    );
    const privateB = ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 1, content: 'Private thought of sim 200.', event_type: 'monologue' },
        participants: [{ id: '200' }],
        index: { owner: '200' },
      },
      { notifyMod: false },
    );

    const ids = (rows: { id?: string }[]) => rows.map((row) => row.id).sort();

    // No scope: shared only — another sim's head is never a default
    expect(ids(ctx.memoryIndexRepository.getRetrievalCandidates(['100', '200'], 10, 'fake-model'))).toEqual([
      shared?.id,
    ]);
    // Sim 100 retrieving for itself sees its own private row, never sim 200's
    expect(ids(ctx.memoryIndexRepository.getRetrievalCandidates(['100', '200'], 10, 'fake-model', ['100']))).toEqual(
      ids([{ id: shared?.id }, { id: privateA?.id }]),
    );
    // A scene containing both sims (the omniscient director) sees everything
    expect(
      ids(ctx.memoryIndexRepository.getRetrievalCandidates(['100', '200'], 10, 'fake-model', ['100', '200'])),
    ).toEqual(ids([{ id: shared?.id }, { id: privateA?.id }, { id: privateB?.id }]));
  });

  it('gates 64-bit owner ids without precision loss', () => {
    const ctx = loadedContext('monologue-bigint');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});
    const bigOwner = '772948625141858301';
    const almostSame = '772948625141858302'; // same float64 neighborhood — a Number() compare would collide

    const owned = ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 1, content: 'Big-handle private thought.', event_type: 'monologue' },
        participants: [{ id: bigOwner }],
        index: { owner: bigOwner },
      },
      { notifyMod: false },
    );

    const forOwner = ctx.memoryIndexRepository.getRetrievalCandidates([bigOwner], 10, 'fake-model', [bigOwner]);
    expect(forOwner.map((row) => row.id)).toEqual([owned?.id]);
    const forNeighbor = ctx.memoryIndexRepository.getRetrievalCandidates([bigOwner], 10, 'fake-model', [almostSame]);
    expect(forNeighbor).toEqual([]);
  });

  it('scene history excludes inner life (thought and monologue rows)', () => {
    const ctx = loadedContext('monologue-scene-history');
    ctx.memoryRepository.setOnMemoryUpserted(() => {});

    const visible = ctx.memoryRepository.createMemory({
      memory: { location_id: 5, content: 'Alice: Hello there.' },
      participants: [{ id: '100' }],
    });
    ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 5, content: 'Private monologue line.', event_type: 'monologue' },
        participants: [{ id: '100' }],
        index: { owner: '100' },
      },
      { notifyMod: false },
    );
    ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 5, content: 'Private tick thought.', event_type: 'thought' },
        participants: [{ id: '100' }],
        index: { owner: '100' },
      },
      { notifyMod: false },
    );
    ctx.memoryRepository.createMemory(
      {
        memory: { location_id: 5, content: 'A reflection on the scene.', event_type: 'reflection' },
        participants: [{ id: '100' }],
      },
      { notifyMod: false },
    );

    const sceneRows = ctx.memoryRepository.getSceneMemories(5, '2000-01-01 00:00:00');
    expect(sceneRows.map((row) => row.id)).toEqual([visible?.id]);
  });
});
