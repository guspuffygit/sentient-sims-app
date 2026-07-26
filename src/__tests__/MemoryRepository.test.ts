import * as fs from 'fs';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { ParticipantDTO } from 'main/sentient-sims/db/dto/ParticipantDTO';
import { migrate } from 'main/sentient-sims/db/migrations';
import { mockApiContext } from './util';

describe('MemoryRepository', () => {
  it('CRUD', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '7981723',
      saveId: '2',
    });
    const participants: ParticipantDTO[] = [{ id: '128937674' }, { id: '18276365' }];
    const memory: MemoryEntity = {
      location_id: 90369424,
      pre_action: 'dioawjd',
      content: 'foiwje9if91082u',
      observation: 'joijofi10298',
      action: 'ojf0192830hkljh12',
    };
    const result = ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    expect(result.id).toBeGreaterThanOrEqual(0);
    expect(result.content).toEqual(memory.content);
    expect(result.pre_action).toEqual(memory.pre_action);
    expect(result.observation).toEqual(memory.observation);
    expect(result.location_id).toEqual(memory.location_id);
    expect(result.timestamp).toBeTruthy();
    expect(result.action).toEqual(memory.action);

    // Check createMemory also created memory_participants rows
    const memoryParticipants = ctx.memoryRepository.getMemoryParticipants({
      memory_id: Number(result.id),
    });
    expect(memoryParticipants).toHaveLength(2);

    const participantIds = participants.map((participant) => participant.id);
    memoryParticipants.forEach((memoryParticipant) => {
      expect(memoryParticipant.memory_id).toEqual(result.id);
      expect(participantIds).toContain(memoryParticipant.participant_id);
    });

    const expectedObservation = '10982730j1lj';
    memory.id = result.id;
    memory.observation = expectedObservation;

    ctx.memoryRepository.updateMemory(memory);

    const updatedMemory = ctx.memoryRepository.getMemory({
      id: Number(memory.id),
    });
    expect(updatedMemory.observation).toEqual(expectedObservation);

    const results = ctx.memoryRepository.getMemories();
    expect(results).toHaveLength(1);
    expect(updatedMemory).toEqual(results[0]);

    const noParticipantMemories = ctx.memoryRepository.getParticipantsMemories({
      participant_ids: ['9857897436'],
    });
    expect(noParticipantMemories).toHaveLength(0);

    const participantMemories = ctx.memoryRepository.getParticipantsMemories({
      participant_ids: ['128937674', '18276365'],
    });
    expect(participantMemories).toHaveLength(1);

    // Delete item
    ctx.memoryRepository.deleteMemory({ id: Number(memory.id) });
    const noResults = ctx.memoryRepository.getMemories();
    expect(noResults).toHaveLength(0);

    // Links rows in memory_participants table should be cascade deleted
    const noMemoryParticipants = ctx.memoryRepository.getMemoryParticipants({
      memory_id: Number(result.id),
    });
    expect(noMemoryParticipants).toHaveLength(0);

    // Test deleteAllMemories
    ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    ctx.memoryRepository.createMemory({
      memory,
      participants,
    });
    ctx.memoryRepository.deleteAllMemories();
    const noResultsDeleteAll = ctx.memoryRepository.getMemories();
    expect(noResultsDeleteAll).toHaveLength(0);

    const throwsError = vi.fn(() => {
      ctx.memoryRepository.getMemory({ id: 99999 });
    });
    expect(throwsError).toThrow();
  });

  it('should never hand out a content-less memory in the memories list', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '3333333',
      saveId: '1',
    });

    // An outcome row: bookkeeping text lives in observation. The raw game repr in the reason
    // must come out markup-safe — a single '<' swallows the rest of the Flash window's list.
    ctx.memoryRepository.createMemory({
      memory: {
        location_id: 1,
        observation:
          "Marisol Vega tried 'take_shower' and it was canceled (<EnqueueResult: Bills: utility is shut off.>).",
        pre_action: 'invites Julio to add one last overheard detail',
        action: 'take_shower',
        event_type: 'outcome',
      },
      participants: [],
    });
    // A pre-action fallback row: nothing was generated, so only the pre_action has text
    ctx.memoryRepository.createMemory({
      memory: {
        location_id: 1,
        pre_action: 'Marisol Vega is asking Julio Brewer about their career.',
        event_type: 'interaction',
      },
      participants: [],
    });
    // Nothing renderable at all
    ctx.memoryRepository.createMemory({
      memory: { location_id: 1, event_type: 'interaction' },
      participants: [],
    });

    const memories = ctx.memoryRepository.getMemories();
    expect(memories).toHaveLength(3);
    memories.forEach((memory) => {
      expect(typeof memory.content).toEqual('string');
      expect(memory.content).not.toMatch(/[<>]/);
    });
    expect(memories[0].content).toEqual(
      "Marisol Vega tried 'take_shower' and it was canceled (‹EnqueueResult: Bills: utility is shut off.›).",
    );
    // observation is neutralized identically so consumers comparing the fields see equal strings
    expect(memories[0].observation).toEqual(memories[0].content);
    expect(memories[1].content).toEqual('Marisol Vega is asking Julio Brewer about their career.');
    expect(memories[2].content).toEqual('');

    // The stored rows keep their own shape
    expect(ctx.memoryRepository.getMemory({ id: Number(memories[1].id) }).content).toBeNull();
  });

  it('should store interaction_name from normal interactions', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '1111111',
      saveId: '1',
    });

    const memory: MemoryEntity = {
      location_id: 12345,
      pre_action: 'test pre action',
      content: 'test content',
      interaction_name: 'mixer_social_GossipAbout',
    };
    const result = ctx.memoryRepository.createMemory({
      memory,
      participants: [{ id: '100' }],
    });

    expect(result.interaction_name).toEqual('mixer_social_GossipAbout');

    const fetched = ctx.memoryRepository.getMemory({ id: Number(result.id) });
    expect(fetched.interaction_name).toEqual('mixer_social_GossipAbout');
  });

  it('should store interaction_name from wicked whims animation_name', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '2222222',
      saveId: '1',
    });

    const memory: MemoryEntity = {
      location_id: 67890,
      pre_action: 'ww pre action',
      content: 'ww content',
      interaction_name: 'some_animation_name',
    };
    const result = ctx.memoryRepository.createMemory({
      memory,
      participants: [{ id: '200' }, { id: '201' }],
    });

    expect(result.interaction_name).toEqual('some_animation_name');

    const fetched = ctx.memoryRepository.getMemory({ id: Number(result.id) });
    expect(fetched.interaction_name).toEqual('some_animation_name');
  });

  it('scopes memories by scene (location + start time) and excludes reflections', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'scene-scope', saveId: '1' });

    const participants: ParticipantDTO[] = [{ id: '501' }, { id: '502' }];
    const sceneStart = '2000-01-01 00:00:00';

    // Scene A memories at location 10
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'a1' },
      participants,
    });
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'a2' },
      participants,
    });
    // Scene B memory at a different location
    const b1 = ctx.memoryRepository.createMemory({
      memory: { location_id: 20, content: 'b1' },
      participants: [{ id: '501' }],
    });
    // A reflection at location 10 — must be excluded from getSceneMemories
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'reflection of A', event_type: 'reflection' },
      participants,
    });
    // An older memory at location 10 from a previous visit — excluded by the since filter
    const old = ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'previous visit' },
      participants: [{ id: '999' }],
    });
    ctx.memoryRepository.updateMemory({ ...old, timestamp: '1999-01-01 00:00:00' });

    const sceneA = ctx.memoryRepository.getSceneMemories(10, sceneStart);
    expect(sceneA.map((m) => m.content)).toEqual(['a1', 'a2']);

    const sceneB = ctx.memoryRepository.getSceneMemories(20, sceneStart);
    expect(sceneB.map((m) => m.content)).toEqual(['b1']);
    expect(b1.location_id).toEqual(20);

    const sceneParticipants = ctx.memoryRepository.getSceneParticipantIds(10, sceneStart);
    expect(sceneParticipants.sort()).toEqual(['501', '502']);
  });

  it('returns recent reflections overall, by location, and by participant', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'reflections', saveId: '1' });

    // Regular memory should never show up in reflection queries
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'not a reflection' },
      participants: [{ id: '700' }],
    });
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'reflect gym', event_type: 'reflection' },
      participants: [{ id: '700' }],
    });
    ctx.memoryRepository.createMemory({
      memory: { location_id: 20, content: 'reflect home', event_type: 'reflection' },
      participants: [{ id: '800' }],
    });

    const overall = ctx.memoryRepository.getRecentReflections(10);
    expect(overall.map((m) => m.content).sort()).toEqual(['reflect gym', 'reflect home']);

    const atGym = ctx.memoryRepository.getRecentReflectionsForLocation(10, 10);
    expect(atGym.map((m) => m.content)).toEqual(['reflect gym']);

    const for700 = ctx.memoryRepository.getRecentReflectionsForParticipants(['700'], 10);
    expect(for700.map((m) => m.content)).toEqual(['reflect gym']);

    const for800 = ctx.memoryRepository.getRecentReflectionsForParticipants(['800'], 10);
    expect(for800.map((m) => m.content)).toEqual(['reflect home']);
  });

  it('drops a leftover scene_id column from the memory table', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'drop-scene-id', saveId: '1' });

    const db = ctx.db.getDb();
    const hasSceneId = () =>
      (db.prepare('PRAGMA table_info(memory)').all() as { name: string }[]).some(
        (column) => column.name === 'scene_id',
      );

    // Simulate a database that ran the short-lived add-scene-id migration
    db.prepare('ALTER TABLE memory ADD COLUMN scene_id INTEGER').run();
    db.prepare("DELETE FROM migrations WHERE name = '011-remove-memory-scene-id'").run();
    expect(hasSceneId()).toBe(true);

    migrate(db);

    expect(hasSceneId()).toBe(false);

    // Memory rows no longer carry the column that broke the mod's parser
    const created = ctx.memoryRepository.createMemory({
      memory: { location_id: 1, content: 'clean row' },
      participants: [{ id: '900' }],
    });
    expect('scene_id' in created).toBe(false);
  });

  it('should update interaction_name', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), {
      recursive: true,
    });
    ctx.db.loadDatabase({
      sessionId: '3333333',
      saveId: '1',
    });

    const memory: MemoryEntity = {
      location_id: 11111,
      pre_action: 'pre action',
      content: 'content',
      interaction_name: 'original_name',
    };
    const result = ctx.memoryRepository.createMemory({
      memory,
      participants: [{ id: '300' }],
    });

    memory.id = result.id;
    memory.interaction_name = 'updated_name';
    ctx.memoryRepository.updateMemory(memory);

    const updated = ctx.memoryRepository.getMemory({ id: Number(result.id) });
    expect(updated.interaction_name).toEqual('updated_name');
  });
});
