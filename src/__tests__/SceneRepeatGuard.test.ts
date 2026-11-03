import { describe, expect, it } from 'vitest';
import { judgeInteraction, repeatKey, SceneRepeatGuard } from 'main/sentient-sims/services/SceneRepeatGuard';
import { InteractionEvent, SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';

const CAT = { sim_id: '7', name: 'Mittens' } as SentientSim;
const JULIAN = { sim_id: '1', name: 'Julian' } as SentientSim;
const ARLENE = { sim_id: '2', name: 'Arlene' } as SentientSim;

function event(interactionName: string, sims: SentientSim[], reaction?: boolean): InteractionEvent {
  const built: InteractionEvent = {
    event_id: 'e',
    event_type: SSEventType.INTERACTION,
    location_id: 5,
    environment: { location_id: 5, world_id: 0, time: { second: 0, minute: 0, hour: 20, day: 1, week: 0 } },
    sentient_sims: sims,
    interaction_name: interactionName,
  };
  if (reaction) {
    built.reaction = true;
  }
  return built;
}

const WATCH = 'petInvestigate_Obsess_Watch_Instrument_Vocal';
const COOLDOWN = 120_000;

function build(cooldownMs = COOLDOWN) {
  return new SceneRepeatGuard({ cooldownMs: () => cooldownMs });
}

describe('SceneRepeatGuard', () => {
  it('drops the same cast on the same beat inside the cooldown, and the window slides', () => {
    const guard = build();
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 0)).toEqual({ kind: 'fresh' });
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 30_000)).toEqual({ kind: 'drop', sinceMs: 30_000 });
    // 130 s after the first event but only 100 s after the last repeat: still inside the window
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 130_000)).toEqual({ kind: 'drop', sinceMs: 100_000 });
    // Quiet for the whole cooldown: fresh again
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 250_000)).toEqual({ kind: 'fresh' });
  });

  it('keys on the sorted cast: actor and target swapped is the same pair', () => {
    const guard = build();
    guard.admit(event(WATCH, [CAT, JULIAN]), 0);
    expect(guard.admit(event(WATCH, [JULIAN, CAT]), 10_000).kind).toBe('drop');
  });

  it('does not hold a different pair or a different beat', () => {
    const guard = build();
    guard.admit(event(WATCH, [CAT, JULIAN]), 0);
    expect(guard.admit(event(WATCH, [CAT, ARLENE]), 10_000)).toEqual({ kind: 'fresh' });
    expect(guard.admit(event('mixer_social_TellJoke', [CAT, JULIAN]), 10_000)).toEqual({ kind: 'fresh' });
  });

  it('keys a reaction on the actor alone, whoever it is aimed at', () => {
    const guard = build();
    expect(guard.admit(event(WATCH, [CAT, JULIAN], true), 0).kind).toBe('fresh');
    expect(guard.admit(event(WATCH, [CAT, ARLENE], true), 10_000).kind).toBe('drop');
    expect(repeatKey(event(WATCH, [CAT, JULIAN], true))).toBe(`7|${WATCH}`);
    expect(repeatKey(event(WATCH, [CAT, JULIAN]))).toBe(`1+7|${WATCH}`);
  });

  it('forgets an admitted event that produced no scene', () => {
    const guard = build();
    guard.admit(event(WATCH, [CAT, JULIAN]), 0);
    guard.forget(event(WATCH, [CAT, JULIAN]));
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 10_000)).toEqual({ kind: 'fresh' });
  });

  it('peek judges without recording: a prefetch never holds the key', () => {
    const guard = build();
    expect(guard.peek(event(WATCH, [CAT, JULIAN]), 0)).toEqual({ kind: 'fresh' });
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 1_000)).toEqual({ kind: 'fresh' });
    expect(guard.peek(event(WATCH, [CAT, JULIAN]), 2_000)).toEqual({ kind: 'drop', sinceMs: 1_000 });
    // The peeked repeat did not slide the window
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 3_000)).toEqual({ kind: 'drop', sinceMs: 2_000 });
    expect(judgeInteraction({ sceneRepeatGuard: build() }, event(WATCH, [CAT, JULIAN]), 0, 'peek').judged).toBe(true);
  });

  it('is off at cooldown 0', () => {
    const guard = build(0);
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 0)).toEqual({ kind: 'fresh' });
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 1)).toEqual({ kind: 'fresh' });
  });

  it('starts over on reset', () => {
    const guard = build();
    guard.admit(event(WATCH, [CAT, JULIAN]), 0);
    guard.reset();
    expect(guard.admit(event(WATCH, [CAT, JULIAN]), 1_000)).toEqual({ kind: 'fresh' });
  });

  it('judgeInteraction passes anything that is not an interaction with a cast', () => {
    const guard = build();
    const ctx = { sceneRepeatGuard: guard };
    expect(judgeInteraction(ctx, { ...event(WATCH, [CAT, JULIAN]), event_type: SSEventType.WANTS }, 0)).toEqual({
      judged: false,
      drop: false,
      reaction: false,
    });
    expect(judgeInteraction(ctx, event(WATCH, [CAT, JULIAN], true), 0)).toEqual({
      judged: true,
      drop: false,
      reaction: true,
    });
    expect(judgeInteraction(ctx, event(WATCH, [CAT, JULIAN], true), 1_000)).toEqual({
      judged: true,
      drop: true,
      reaction: true,
    });
  });
});
