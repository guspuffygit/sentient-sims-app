import * as fs from 'fs';
import { describe, expect, it } from 'vitest';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { SSEvent } from 'main/sentient-sims/models/InteractionEvents';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { mockApiContext } from './util';

// J1 (2026-09-04): a reflection is one Sim's private diary. The prompt used to gather the
// three most recent world-wide plus two at the location, any author, so Milo's briefing
// carried Tessa's day at another lot and the actors played it as shared history (the
// 2026-09-04 playtest handoff, cause 1). Now each performer gets only rows they own.
describe('owner-scoped reflections', () => {
  it('returns only the rows a sim owns, and an unowned row for nobody', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'reflections-by-owner', saveId: '1' });

    const diary = (content: string, owner?: string, participants = ['700', '800']) =>
      ctx.memoryRepository.createMemory({
        memory: { location_id: 10, content, event_type: 'reflection' },
        participants: participants.map((id) => ({ id })),
        index: owner ? { owner } : undefined,
      });

    // A's diary at the shared location, naming B as a participant
    diary('A (diary): I fixed the sink today', '700');
    // B's diary at the same location, naming A — the row that used to leak into A's block
    diary('B (diary): rain kept me in all day', '800');
    // The 07-31 Sixam shape: a reflection stored before owners existed
    diary('nobody (diary): unowned', undefined, ['700']);
    // A regular memory never counts as a reflection, owner or not
    ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'A: hello', event_type: 'interaction' },
      participants: [{ id: '700' }],
      index: { owner: '700' },
    });

    const forA = ctx.memoryRepository.getRecentReflectionsByOwner('700', 10);
    expect(forA.map((memory) => memory.content)).toEqual(['A (diary): I fixed the sink today']);

    const forB = ctx.memoryRepository.getRecentReflectionsByOwner('800', 10);
    expect(forB.map((memory) => memory.content)).toEqual(['B (diary): rain kept me in all day']);

    // Nobody owns the unowned row, and a non-numeric id is a miss, not a throw
    expect(ctx.memoryRepository.getRecentReflectionsByOwner('900', 10)).toEqual([]);
    expect(ctx.memoryRepository.getRecentReflectionsByOwner('not-an-id', 10)).toEqual([]);
  });

  const fakeCtx = (rowsByOwner: Record<string, MemoryEntity[]>) =>
    ({
      memoryRepository: {
        getRecentReflectionsByOwner: (ownerId: string, limit: number) => (rowsByOwner[ownerId] ?? []).slice(0, limit),
      },
      locationRepository: {
        getLocation: () => ({ id: 10, name: 'Garden Essence', lot_type: 'Residential' }),
      },
    }) as unknown as ApiContext;

  const event = (sims: { sim_id: string; name: string }[]) =>
    ({ sentient_sims: sims, environment: { location_id: 10 } }) as unknown as SSEvent;

  it('labels each sim’s own diaries by speaker in a multi-sim scene', () => {
    const builder = new PromptRequestBuilderService(
      fakeCtx({
        '700': [{ id: '1', location_id: 10, content: 'Ann (diary): I fixed the sink', event_type: 'reflection' }],
        '800': [{ id: '2', location_id: 10, content: 'Ben (diary): I hate the sink', event_type: 'reflection' }],
      }),
    );
    const bySim = builder.getReflections(
      event([
        { sim_id: '700', name: 'Ann' },
        { sim_id: '800', name: 'Ben' },
        { sim_id: '900', name: 'Cat' },
      ]),
    );
    expect(bySim.map((entry) => entry.reflections.length)).toEqual([1, 1, 0]);

    const block = builder['buildReflectionsBlock'](bySim) as string;
    const annBlock = block.slice(block.indexOf('speaker="Ann"'), block.indexOf('speaker="Ben"'));
    expect(annBlock).toContain('[At Garden Essence] Ann (diary): I fixed the sink');
    // Ben's diary never appears inside Ann's block
    expect(annBlock).not.toContain('Ben (diary)');
    expect(block).toContain('<PAST_REFLECTIONS speaker="Ben">');
    // A sim with no diaries gets no block at all
    expect(block).not.toContain('speaker="Cat"');
    expect(block).toContain('only into its owner’s briefing');
  });

  it('keeps the unlabelled tag for a solo scene, and renders nothing with no rows', () => {
    const builder = new PromptRequestBuilderService(
      fakeCtx({
        '700': [{ id: '1', location_id: 10, content: 'Ann (diary): I fixed the sink', event_type: 'reflection' }],
      }),
    );
    const solo = builder['buildReflectionsBlock'](builder.getReflections(event([{ sim_id: '700', name: 'Ann' }])));
    expect(solo).toContain(
      '<PAST_REFLECTIONS>\n[At Garden Essence] Ann (diary): I fixed the sink\n</PAST_REFLECTIONS>',
    );
    expect(solo).not.toContain('speaker=');

    const none = builder['buildReflectionsBlock'](builder.getReflections(event([{ sim_id: '800', name: 'Ben' }])));
    expect(none).toBeUndefined();
  });
});
