import { describe, expect, it } from 'vitest';
import { SSEventType, WWEventType, WWInteractionEvent } from 'main/sentient-sims/models/InteractionEvents';
import { ClockState } from 'main/sentient-sims/models/ModLogWebsocketMessage';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import {
  PatterRound,
  WickedWhimsPatter,
  WW_PATTER_MAX_MS,
  WW_PATTER_MAX_POKES_PER_ANIMATION,
  wwActKey,
} from 'main/sentient-sims/services/WickedWhimsPatter';

// The Wicked Whims patter: one more round, one Sim at a time, every 20 s of quiet while an
// animation runs. Timers, the clock and the registry are injected, so time is moved by hand.

const VAL = { sim_id: '14', name: 'Valentina Cruz' } as SentientSim;
const LUCAS = { sim_id: '23', name: 'Lucas Hart' } as SentientSim;
const JADE = { sim_id: '31', name: 'Jade Park' } as SentientSim;

function wwEvent(type: WWEventType, actId = 'act-1', sims: SentientSim[] = [VAL, LUCAS]): WWInteractionEvent {
  return {
    event_id: 'ww',
    event_type: SSEventType.WICKED_WHIMS,
    location_id: 5,
    environment: { location_id: 5, world_id: 0, time: { second: 0, minute: 0, hour: 0, day: 0, week: 0 } },
    sentient_sims: sims,
    sex_category: 0,
    sex_location: 0,
    animation_author: 'A',
    animation_name: 'Cowgirl Stage 2',
    animation_identifier: 'anim',
    ww_event_type: type,
    act_id: actId,
  };
}

function build(options: { enabled?: boolean } = {}) {
  let now = 1_000_000;
  let gameWaiting = false;
  const timers = new Map<number, { fn: () => void; at: number }>();
  let nextTimer = 1;
  const holds = new Set<string>();
  const released: string[] = [];
  const pokes: { speakerId: string; signal: AbortSignal; round: number }[] = [];
  const patter = new WickedWhimsPatter({
    enabled: () => options.enabled ?? true,
    intervalMs: () => 20_000,
    isGameWaiting: () => gameWaiting,
    hold: (sceneId) => {
      holds.add(sceneId);
      return true;
    },
    release: (sceneId) => {
      holds.delete(sceneId);
      released.push(sceneId);
    },
    now: () => now,
    setTimeout: (fn, ms) => {
      const id = nextTimer;
      nextTimer += 1;
      timers.set(id, { fn, at: now + ms });
      return id;
    },
    clearTimeout: (handle) => {
      timers.delete(handle as number);
    },
  });
  // Moves the clock, firing every timer that falls due on the way
  const advance = (ms: number) => {
    const until = now + ms;
    for (;;) {
      const due = [...timers.entries()]
        .filter(([, timer]) => timer.at <= until)
        .sort((a, b) => a[1].at - b[1].at)
        .at(0);
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = until;
  };
  const round = (
    sceneId: string,
    n: number,
    lines: { simId: string; text: string }[],
    event = wwEvent(WWEventType.ACTIVE),
  ): PatterRound => ({
    event,
    sceneId,
    round: n,
    lines: lines.map((line) => ({ speaker: line.simId, text: line.text, simId: line.simId })),
    speakerIds: event.sentient_sims.map((sim) => sim.sim_id),
    poke: (speakerId, signal) => {
      pokes.push({ speakerId, signal, round: n + 1 });
      return Promise.resolve();
    },
  });
  return {
    patter,
    holds,
    released,
    pokes,
    timers,
    advance,
    round,
    setClock: (state?: ClockState) => {
      patter.clockChanged(state);
    },
    setGameWaiting: (waiting: boolean) => {
      gameWaiting = waiting;
    },
    pendingDelays: () => [...timers.values()].map((timer) => timer.at - now),
  };
}

const ROUND_ONE = [
  { simId: '14', text: 'Oh.' },
  { simId: '23', text: 'Yes.' },
];

describe('WickedWhimsPatter', () => {
  it('holds the scene and arms 20 s after it goes idle', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    expect(h.holds.has('s1')).toBe(true);
    expect(h.timers.size).toBe(0);

    h.patter.sceneIdle('s1');
    expect(h.pendingDelays()).toEqual([20_000]);
    h.advance(19_999);
    expect(h.pokes).toHaveLength(0);
    h.advance(1);
    // Lucas spoke last, so Valentina takes the first poke
    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['14']);
  });

  it('takes turns, and arms again only when the poke has played', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.advance(20_000);
    // Nothing armed while the poke is being written and played
    expect(h.timers.size).toBe(0);
    h.patter.roundAired(h.round('s1', 2, [...ROUND_ONE, { simId: '14', text: 'More.' }]));
    h.patter.sceneIdle('s1');
    h.advance(20_000);
    h.patter.sceneIdle('s1');
    h.advance(20_000);
    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['14', '23', '14']);
  });

  it('pokes a solo act too: the one Sim takes every turn, across animations', () => {
    const h = build();
    const solo = wwEvent(WWEventType.ACTIVE, 'act-solo', [VAL]);
    h.patter.roundAired(h.round('s1', 1, [{ simId: '14', text: 'Oh.' }], solo));
    h.patter.sceneIdle('s1');
    h.advance(20_000);
    h.patter.sceneIdle('s1');
    h.advance(20_000);

    h.patter.wwEvent(solo);
    h.patter.roundAired(h.round('s2', 1, [{ simId: '14', text: 'Yes.' }], solo));
    h.patter.sceneIdle('s2');
    h.advance(20_000);

    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['14', '14', '14']);
    expect(h.released).toEqual(['s1']);
  });

  it('starts over on a new animation: the old scene is released, the turn order re-read', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.advance(20_000);
    const inFlight = h.pokes[0].signal;

    h.patter.wwEvent(wwEvent(WWEventType.ACTIVE));
    expect(inFlight.aborted).toBe(true);
    expect(h.released).toEqual(['s1']);
    expect(h.timers.size).toBe(0);

    // The new animation's round: Valentina spoke last this time
    h.patter.roundAired(h.round('s2', 1, [ROUND_ONE[1], ROUND_ONE[0]]));
    expect(h.holds.has('s2')).toBe(true);
    h.patter.sceneIdle('s2');
    h.advance(20_000);
    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['14', '23']);
  });

  it('ignores a late poke round on a scene the act has moved past', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.wwEvent(wwEvent(WWEventType.ACTIVE));
    h.patter.roundAired(h.round('s2', 1, ROUND_ONE));
    h.patter.roundAired(h.round('s1', 2, ROUND_ONE));
    expect(h.holds.has('s1')).toBe(false);
    expect(h.patter.actFor('act-1')?.sceneId).toBe('s2');
  });

  it('stops on the act end: the scene is released once and no poke follows', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');

    h.patter.wwEvent(wwEvent(WWEventType.ENDED));
    h.patter.wwEvent(wwEvent(WWEventType.ENDED));
    h.advance(60_000);

    expect(h.released).toEqual(['s1']);
    expect(h.pokes).toHaveLength(0);
    expect(h.patter.size).toBe(0);
    // A round of the act still being written when it ended is not held
    h.patter.roundAired(h.round('s9', 1, ROUND_ONE));
    expect(h.holds.has('s9')).toBe(false);
  });

  it('holds while the player pauses and resumes with what was left', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.advance(8_000);

    h.setClock({ speed: 'PAUSED', paused: true, paused_by: 'user' });
    expect(h.timers.size).toBe(0);
    h.advance(120_000);
    expect(h.pokes).toHaveLength(0);

    h.setClock({ speed: 'NORMAL', paused: false, paused_by: null });
    expect(h.pendingDelays()).toEqual([12_000]);
    h.advance(12_000);
    expect(h.pokes).toHaveLength(1);
  });

  it('is not held by a pause the mod made', () => {
    const h = build();
    h.setClock({ speed: 'PAUSED', paused: true, paused_by: 'mod' });
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    expect(h.pendingDelays()).toEqual([20_000]);
  });

  it('runs at the game speed: 20 s / 1.5 at speed 3, re-scaled when the speed changes', () => {
    const h = build();
    h.setClock({ speed: 'SPEED3', paused: false, paused_by: null });
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    expect(h.pendingDelays()).toEqual([13_333]);

    h.advance(6_667);
    // About 6.67 s at speed 3 is left, which is 10 s of normal-speed time (to the millisecond)
    h.setClock({ speed: 'NORMAL', paused: false, paused_by: null });
    expect(Math.abs(h.pendingDelays()[0] - 10_000)).toBeLessThanOrEqual(1);
  });

  it('holds at ultra speed', () => {
    const h = build();
    h.setClock({ speed: 'SUPER_SPEED3', paused: false, paused_by: null });
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    expect(h.timers.size).toBe(0);
    h.setClock({ speed: 'SPEED2', paused: false, paused_by: null });
    expect(h.pendingDelays()).toEqual([16_000]);
  });

  it('steps aside while the game waits on an interaction', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.setGameWaiting(true);
    h.advance(20_000);
    expect(h.pokes).toHaveLength(0);
    expect(h.pendingDelays()).toEqual([5_000]);
    h.setGameWaiting(false);
    h.advance(5_000);
    expect(h.pokes).toHaveLength(1);
  });

  it('ends the act after two reports with the cast out of it, once it has seen them in it', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    const report = (inAct: boolean) =>
      ({
        type: 'state_report',
        seq: 1,
        sims: [
          { sim_id: '14', self: { in_ww_scene: inAct } },
          { sim_id: '23', self: { in_ww_scene: inAct } },
        ],
      }) as unknown as SimStateReport;

    // An older mod never reports anyone in the act: no fallback end
    h.advance(70_000);
    h.patter.stateReport(report(false));
    h.patter.stateReport(report(false));
    expect(h.patter.size).toBe(1);

    h.patter.stateReport(report(true));
    h.patter.stateReport(report(false));
    expect(h.patter.size).toBe(1);
    h.patter.stateReport(report(false));
    expect(h.patter.size).toBe(0);
    expect(h.released).toEqual(['s1']);
  });

  it('does not end on the fallback within a minute of the last animation change', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.wwEvent(wwEvent(WWEventType.ACTIVE));
    const report = (inAct: boolean) =>
      ({
        type: 'state_report',
        seq: 1,
        sims: [{ sim_id: '14', self: { in_ww_scene: inAct } }],
      }) as unknown as SimStateReport;
    h.patter.stateReport(report(true));
    h.advance(10_000);
    h.patter.stateReport(report(false));
    h.patter.stateReport(report(false));
    expect(h.patter.size).toBe(1);
  });

  it('caps an act at 15 minutes without an animation change', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.advance(WW_PATTER_MAX_MS - 10_000);
    h.patter.sceneIdle('s1');
    h.advance(30_000);
    expect(h.patter.size).toBe(0);
    expect(h.released).toEqual(['s1']);
  });

  it('ends every act when the mod disconnects', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.patter.reset();
    expect(h.patter.size).toBe(0);
    expect(h.timers.size).toBe(0);
    expect(h.released).toEqual(['s1']);
  });

  it('a new ask or walk-up ends the act its cast is in', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.wwEvent(wwEvent(WWEventType.STARTING, 'pre-1'));
    expect(h.patter.size).toBe(0);
  });

  it('somebody joining replaces the act with the new cast', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    const joined = wwEvent(WWEventType.ACTIVE, 'act-2', [VAL, LUCAS, JADE]);
    h.patter.wwEvent(joined);
    expect(h.patter.actFor('act-1')).toBeUndefined();
    expect(h.released).toEqual(['s1']);
    h.patter.roundAired(h.round('s2', 1, ROUND_ONE, joined));
    h.patter.sceneIdle('s2');
    h.advance(20_000);
    h.patter.sceneIdle('s2');
    h.advance(20_000);
    h.patter.sceneIdle('s2');
    h.advance(20_000);
    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['31', '14', '23']);
  });

  it('a stopped scene stops the patter but the act lives on for its next animation', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    h.patter.sceneIdle('s1');
    h.patter.sceneClosed({
      sceneId: 's1',
      participantSimIds: ['14', '23'],
      cast: [],
      lines: [],
      reason: 'stopped',
      stopReason: 'preempted',
    });
    expect(h.timers.size).toBe(0);
    expect(h.patter.size).toBe(1);
    h.patter.roundAired(h.round('s2', 1, ROUND_ONE));
    expect(h.holds.has('s2')).toBe(true);
  });

  it('does nothing when switched off', () => {
    const h = build({ enabled: false });
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    expect(h.holds.size).toBe(0);
    expect(h.patter.size).toBe(0);
  });

  it('keys an act by its id, or by its cast for an older mod', () => {
    expect(wwActKey(wwEvent(WWEventType.ACTIVE, 'act-7'))).toBe('act-7');
    const old = { ...wwEvent(WWEventType.ACTIVE), act_id: undefined };
    expect(wwActKey(old)).toBe('14+23');
  });
});

describe('WickedWhimsPatter cap', () => {
  it('rests after 8 pokes on one animation, and starts again on the next', () => {
    const h = build();
    h.patter.roundAired(h.round('s1', 1, ROUND_ONE));
    for (let poke = 0; poke < 10; poke += 1) {
      h.patter.sceneIdle('s1');
      h.advance(20_000);
    }
    expect(h.pokes).toHaveLength(WW_PATTER_MAX_POKES_PER_ANIMATION);
    expect(h.timers.size).toBe(0);

    h.patter.wwEvent(wwEvent(WWEventType.ACTIVE));
    h.patter.roundAired(h.round('s2', 1, ROUND_ONE));
    h.patter.sceneIdle('s2');
    h.advance(20_000);
    expect(h.pokes).toHaveLength(WW_PATTER_MAX_POKES_PER_ANIMATION + 1);
  });
});

describe('WickedWhimsPatter turns across animations', () => {
  it('carries the turn from one animation to the next, never to the Sim who just spoke', () => {
    const h = build();
    const trio = wwEvent(WWEventType.ACTIVE, 'act-3', [VAL, LUCAS, JADE]);
    const opening = [
      { simId: '14', text: 'Oh.' },
      { simId: '23', text: 'Yes.' },
      { simId: '31', text: 'Now.' },
    ];
    // Three animations, one poke each; every opening round ends with Jade
    ['a1', 'a2', 'a3'].forEach((sceneId) => {
      h.patter.wwEvent(trio);
      h.patter.roundAired(h.round(sceneId, 1, opening, trio));
      h.patter.sceneIdle(sceneId);
      h.advance(20_000);
    });
    // Before the fix: Valentina every time
    expect(h.pokes.map((poke) => poke.speakerId)).toEqual(['14', '23', '14']);
  });
});
