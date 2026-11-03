import * as fs from 'fs';
import { describe, expect, it } from 'vitest';
import {
  intimateOutputProblem,
  isAdultAge,
  isRefusal,
  keepIntimateRowForDiary,
  keepIntimateRowForScene,
  namesOutsideAct,
} from 'main/sentient-sims/util/intimateScene';
import { PromptRequestBuilderService } from 'main/sentient-sims/services/PromptRequestBuilderService';
import { AIService } from 'main/sentient-sims/services/AIService';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { SSEvent } from 'main/sentient-sims/models/InteractionEvents';
import { MemoryEntity } from 'main/sentient-sims/db/entities/MemoryEntity';
import { SimAge } from 'main/sentient-sims/models/SimAge';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { mockApiContext } from './util';

const ADRIAN = { sim_id: '474873505021827065', name: 'Adrian House', age: SimAge.YOUNGADULT };
const MARA = { sim_id: '1070474372246601763', name: 'Mara Bellweather', age: SimAge.YOUNGADULT };
const ELLIOT = { sim_id: '474873505018025949', name: 'Elliot Chatman', age: SimAge.YOUNGADULT };
const ELLIOT_JR = { sim_id: '98822974819883265', name: 'Elliot Jr Chatman', age: SimAge.TODDLER };

// The 09-23 output, stored as Adrian's solo WickedWhims memory
const BEDTIME_AS_ACT = [
  'Elliot Chatman is having an intimate moment with Elliot Jr Chatman.',
  "Elliot Chatman: Shhh, it's okay little man. Daddy's here.",
  'Elliot Jr Chatman: Mm, Daddy. Makes it better.',
].join('\n');

describe('intimate scene rules', () => {
  it('recognises the refusals that were stored as memories, and nothing in character', () => {
    expect(isRefusal("I can't help with that.")).toBe(true);
    expect(isRefusal("I can't create explicit content.")).toBe(true);
    expect(isRefusal("You can't create explicit content. \nWhat's the scene you'd like me to review?")).toBe(true);
    expect(
      isRefusal(
        "Wren Calloway (diary): I can't create explicit content, but I'd be happy to help with other creative story ideas.",
      ),
    ).toBe(true);
    expect(isRefusal("Adrian House: I can't help myself around you")).toBe(false);
    expect(isRefusal("I can't help but smile when she laughs")).toBe(false);
    expect(isRefusal('')).toBe(false);
  });

  it('reads both age shapes the mod sends, and an unknown age as no evidence of a minor', () => {
    expect(isAdultAge(SimAge.YOUNGADULT)).toBe(true);
    expect(isAdultAge(SimAge.TEEN)).toBe(false);
    expect(isAdultAge(SimAge.INFANT)).toBe(false);
    expect(isAdultAge('ELDER')).toBe(true);
    expect(isAdultAge('TODDLER')).toBe(false);
    expect(isAdultAge('2')).toBe(false);
    expect(isAdultAge(undefined)).toBe(true);
  });

  it('throws away the 09-23 output: it names two people outside the act', () => {
    const problem = intimateOutputProblem(BEDTIME_AS_ACT, [ADRIAN], ['Elliot Chatman', 'Elliot Jr Chatman']);
    expect(problem).toContain('not in the act');
  });

  it('keeps an act that names only its performers, first names included', () => {
    const scene = 'Adrian House: Mara, come here.\nMara Bellweather: (laughs) Adrian...';
    expect(intimateOutputProblem(scene, [ADRIAN, MARA], ['Elliot Chatman', 'Elliot Jr Chatman'])).toBeUndefined();
  });

  it('catches a bare first name, unless a performer shares it', () => {
    expect(intimateOutputProblem('Adrian thinks of Oberon.', [ADRIAN], ['Oberon Summerdream'])).toContain('Oberon');
    // Elliot performing: "Elliot" is him, not his son; the son's full name still counts
    expect(intimateOutputProblem('Elliot Chatman: Mara...', [ELLIOT, MARA], ['Elliot Jr Chatman'])).toBeUndefined();
    expect(intimateOutputProblem('Elliot Jr Chatman cries.', [ELLIOT, MARA], ['Elliot Jr Chatman'])).toBeDefined();
  });

  it('refuses any act with a performer under young adult, whatever the text', () => {
    expect(intimateOutputProblem('Anything at all.', [ADRIAN, ELLIOT_JR], [])).toContain('under young adult');
  });

  it('collects every name on the report that is not performing', () => {
    const report = {
      type: 'state_report',
      seq: 1,
      sims: [
        {
          sim_id: ADRIAN.sim_id,
          sim_name: 'Adrian House',
          sims: [
            { sim_id: ELLIOT_JR.sim_id, name: 'Elliot Jr Chatman', tier: 'same_room' },
            { sim_id: ELLIOT.sim_id, name: 'Elliot Chatman', tier: 'on_lot' },
          ],
        },
        { sim_id: ELLIOT.sim_id, sim_name: 'Elliot Chatman', sims: [] },
      ],
    } as unknown as SimStateReport;
    expect(namesOutsideAct(report, [ADRIAN]).sort()).toEqual(['Elliot Chatman', 'Elliot Jr Chatman']);
  });

  it('lets a scene replay an act only its adult performers were in, and a diary only its own', () => {
    const performers = new Set([ADRIAN.sim_id, MARA.sim_id]);
    expect(keepIntimateRowForScene([ADRIAN.sim_id, MARA.sim_id], performers, true)).toBe(true);
    expect(keepIntimateRowForScene([ADRIAN.sim_id], new Set([ELLIOT.sim_id]), true)).toBe(false);
    expect(keepIntimateRowForScene([ADRIAN.sim_id], performers, false)).toBe(false);
    expect(keepIntimateRowForScene([], performers, true)).toBe(false);

    expect(keepIntimateRowForDiary([ADRIAN.sim_id, MARA.sim_id], ADRIAN.sim_id, true)).toBe(true);
    expect(keepIntimateRowForDiary([ADRIAN.sim_id, MARA.sim_id], ELLIOT.sim_id, true)).toBe(false);
    expect(keepIntimateRowForDiary([ADRIAN.sim_id], ADRIAN.sim_id, false)).toBe(false);
    expect(keepIntimateRowForDiary([ADRIAN.sim_id], undefined, true)).toBe(false);
  });
});

describe('scene rows are scoped to the performers', () => {
  // The Rustic Residence scene on 09-23: the toddler's bedtime, Adrian's solo act,
  // and an earlier act between Adrian and Mara
  const rows: MemoryEntity[] = [
    { id: '1', location_id: 10, event_type: 'interaction', content: 'Elliot Jr Chatman: Daddy help me' },
    { id: '2', location_id: 10, event_type: 'wickedwhims', content: 'Adrian House: (moans)' },
    { id: '3', location_id: 10, event_type: 'wickedwhims', content: 'Mara Bellweather: Adrian...' },
    { id: '4', location_id: 10, event_type: 'interaction', content: 'Adrian House: Night, little man' },
  ];
  const participantsByRow: Record<string, string[]> = {
    '1': [ELLIOT_JR.sim_id, ELLIOT.sim_id],
    '2': [ADRIAN.sim_id],
    '3': [ADRIAN.sim_id, MARA.sim_id],
    '4': [ADRIAN.sim_id, ELLIOT_JR.sim_id],
  };

  const builder = (withLookup = true) =>
    new PromptRequestBuilderService({
      sceneService: { getCurrentScene: () => ({ sceneId: 's', locationId: 10, startedAt: '2026-09-23' }) },
      memoryRepository: {
        getSceneMemories: () => rows,
        ...(withLookup
          ? {
              getParticipantIdsForMemories: (ids: string[]) =>
                new Map(ids.map((id) => [id, participantsByRow[id] ?? []] as [string, string[]])),
            }
          : {}),
      },
    } as unknown as ApiContext);

  const event = (eventType: string, sims: { sim_id: string; name: string; age: SimAge }[]) =>
    ({ event_type: eventType, sentient_sims: sims, environment: { location_id: 10 } }) as unknown as SSEvent;

  const ids = (memories: MemoryEntity[]) => memories.map((memory) => memory.id);

  it('tells an act from rows its performers are alone in: never the toddler, never the bedtime', () => {
    expect(ids(builder().getMemories(event('wickedwhims', [ADRIAN])))).toEqual(['2']);
    expect(ids(builder().getMemories(event('wickedwhims', [ADRIAN, MARA])))).toEqual(['2', '3']);
  });

  it('keeps an everyday scene whole except for acts it was not in', () => {
    // The toddler's scene sees no act at all
    expect(ids(builder().getMemories(event('interaction', [ELLIOT_JR, ELLIOT])))).toEqual(['1', '4']);
    // Adrian and Mara talking afterwards keep their act, and his solo one too: everyone
    // it involves is performing this scene
    expect(ids(builder().getMemories(event('interaction', [ADRIAN, MARA])))).toEqual(['1', '2', '3', '4']);
    // Elliot in the next room sees neither
    expect(ids(builder().getMemories(event('interaction', [ELLIOT])))).toEqual(['1', '4']);
  });

  it('fails safe without a participant lookup: no acts anywhere, and an act gets no history', () => {
    expect(ids(builder(false).getMemories(event('interaction', [ELLIOT])))).toEqual(['1', '4']);
    expect(ids(builder(false).getMemories(event('wickedwhims', [ADRIAN])))).toEqual([]);
  });

  it('reads who each memory involves from the database', () => {
    const ctx = mockApiContext();
    fs.mkdirSync(ctx.directory.getSentientSimsFolder(), { recursive: true });
    ctx.db.loadDatabase({ sessionId: 'intimate-scene-participants', saveId: '1' });
    const act = ctx.memoryRepository.createMemory({
      memory: { location_id: 10, content: 'Adrian House: (moans)', event_type: 'wickedwhims' },
      participants: [{ id: ADRIAN.sim_id }, { id: MARA.sim_id }],
    });
    if (!act) {
      throw new Error('memory was not created');
    }
    const lookup = ctx.memoryRepository.getParticipantIdsForMemories([String(act.id), 'not-an-id']);
    expect((lookup.get(String(act.id)) ?? []).sort()).toEqual([ADRIAN.sim_id, MARA.sim_id].sort());
    expect(lookup.size).toBe(1);
    expect(ctx.memoryRepository.getParticipantIdsForMemories([]).size).toBe(0);
  });
});

describe('the generation guard', () => {
  const report = {
    type: 'state_report',
    seq: 1,
    sims: [
      {
        sim_id: ADRIAN.sim_id,
        sim_name: 'Adrian House',
        sims: [{ sim_id: ELLIOT_JR.sim_id, name: 'Elliot Jr Chatman' }],
      },
    ],
  } as unknown as SimStateReport;
  const guard = (eventType: string, text: string) =>
    (AIService.prototype as unknown as Record<string, (...args: unknown[]) => unknown>).generatedOutputProblem.call(
      { ctx: { simStateCache: { getReport: () => report } } },
      { event_type: eventType, sentient_sims: [ADRIAN] },
      text,
    );

  it('drops the 09-23 act before it is stored or voiced', () => {
    expect(guard('wickedwhims', BEDTIME_AS_ACT)).toContain('not in the act');
    expect(guard('wickedwhims', 'Adrian House: (moans softly)')).toBeUndefined();
  });

  it('drops a refusal from any pipeline, and nothing else from an everyday scene', () => {
    expect(guard('interaction', "I can't help with that.")).toBe('model refusal');
    expect(guard('interaction', 'Elliot Jr Chatman: Daddy help me')).toBeUndefined();
  });

  it('keeps the scene as generated when the director review refuses', async () => {
    const reviewed = await AIService.prototype.runDirectorReview.call(
      {
        runOneShot: () =>
          Promise.resolve({
            text: "You can't create explicit content. \nWhat's the scene you'd like me to review?",
            exchange: { request: {} },
          }),
        logExchange: () => undefined,
      } as unknown as AIService,
      'Adrian House: (moans softly)',
    );
    expect(reviewed.text).toBe('Adrian House: (moans softly)');
    expect(reviewed.usedReview).toBe(false);
  });
});
