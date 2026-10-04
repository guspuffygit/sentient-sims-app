import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { SceneClosed, ScenePlaybackRegistry } from 'main/sentient-sims/services/ScenePlaybackRegistry';

const SCENE = 'scene-1';
const PARTICIPANTS = ['1', '2'];

function lines(...texts: string[]): DialogueLine[] {
  return texts.map((text, index) => ({ speaker: index % 2 === 0 ? 'Alex' : 'Bella', text }));
}

function build() {
  const notifyStop = vi.fn();
  const notifySceneEnded = vi.fn();
  const trimMemory = vi.fn();
  const onSceneClosed = vi.fn<(closed: SceneClosed) => void>();
  const registry = new ScenePlaybackRegistry({ notifyStop, notifySceneEnded, trimMemory, onSceneClosed });
  return { registry, notifyStop, notifySceneEnded, trimMemory, onSceneClosed };
}

const CAST = [
  { simId: '1', name: 'Alex Test' },
  { simId: '2', name: 'Bella Test' },
];

describe('ScenePlaybackRegistry', () => {
  let harness: ReturnType<typeof build>;

  beforeEach(() => {
    harness = build();
  });

  it('reports a conversation finished once nothing is playing or generating', () => {
    const { registry, notifySceneEnded } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'));
    registry.generationStarted(SCENE);

    // The round finished playing, but the next one is still being written
    registry.playbackEnded(SCENE, true);
    expect(notifySceneEnded).not.toHaveBeenCalled();

    registry.generationFinished(SCENE);
    expect(notifySceneEnded).toHaveBeenCalledWith(SCENE, 'finished');
  });

  it('does not report finished while a queued round is still to play', () => {
    const { registry, notifySceneEnded } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('One.'));
    registry.roundQueued(SCENE, PARTICIPANTS, 2, lines('Two.'));

    registry.playbackEnded(SCENE, true);
    expect(notifySceneEnded).not.toHaveBeenCalled();

    registry.playbackEnded(SCENE, true);
    expect(notifySceneEnded).toHaveBeenCalledWith(SCENE, 'finished');
  });

  it('stops the conversation when the game says a sim walked away', () => {
    const { registry, notifyStop, notifySceneEnded } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'));

    registry.stop(SCENE, 'walked_away', 'soft');

    expect(notifyStop).toHaveBeenCalledWith({ sceneId: SCENE, mode: 'soft' });
    expect(notifySceneEnded).toHaveBeenCalledWith(SCENE, 'stopped');
    expect(registry.isStopped(SCENE)).toBe(true);
  });

  it('stops only once however many times it is told', () => {
    const { registry, notifyStop, notifySceneEnded } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.'));

    // The game's stop and the renderer's own report both arrive
    registry.stop(SCENE, 'walked_away', 'soft');
    registry.stop(SCENE, 'walked_away', 'soft');
    registry.playbackEnded(SCENE, false);

    expect(notifyStop).toHaveBeenCalledTimes(1);
    expect(notifySceneEnded).toHaveBeenCalledTimes(1);
    // ...and a stopped conversation is never also reported finished
    expect(notifySceneEnded).not.toHaveBeenCalledWith(SCENE, 'finished');
  });

  it('stops a conversation the renderer cut short on its own', () => {
    const { registry, notifyStop } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.'));

    // The player's voice hotkey pre-empted playback
    registry.playbackEnded(SCENE, false);

    expect(notifyStop).toHaveBeenCalledWith({ sceneId: SCENE, mode: 'hard' });
    expect(registry.isStopped(SCENE)).toBe(true);
  });

  it('stops every conversation when the lot goes away', () => {
    const { registry, notifyStop } = harness;
    registry.roundQueued('a', PARTICIPANTS, 1, lines('Hello.'));
    registry.roundQueued('b', ['3', '4'], 1, lines('Elsewhere.'));

    registry.stopAll('zone_unload');

    expect(notifyStop).toHaveBeenCalledWith({ sceneId: 'a', mode: 'hard' });
    expect(notifyStop).toHaveBeenCalledWith({ sceneId: 'b', mode: 'hard' });
    expect(registry.isStopped('a')).toBe(true);
    expect(registry.isStopped('b')).toBe(true);
  });

  it('trims a cut scene to the lines that were actually spoken', () => {
    const { registry, trimMemory } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.', 'So anyway.'), 'paced text');
    expect(registry.attachMemory('paced text', '900')).toBe(true);

    registry.lineShown(SCENE);
    registry.lineShown(SCENE);
    // Bella walks off while her line plays; soft means that line still counts as heard
    registry.stop(SCENE, 'walked_away', 'soft');

    expect(trimMemory).toHaveBeenCalledWith('900', 'Alex: Hello.\nBella: Hi.');
  });

  it('does not count the line a hard stop cut off mid-word', () => {
    const { registry, trimMemory } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.', 'So anyway.'), 'paced text');
    registry.attachMemory('paced text', '900');

    registry.lineShown(SCENE);
    registry.lineShown(SCENE);
    registry.stop(SCENE, 'left_lot', 'hard');

    expect(trimMemory).toHaveBeenCalledWith('900', 'Alex: Hello.');
  });

  it('leaves the memory alone when the whole scene was heard', () => {
    const { registry, trimMemory } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'), 'paced text');
    registry.attachMemory('paced text', '900');

    registry.lineShown(SCENE);
    registry.lineShown(SCENE);
    // Cut after the last line: nothing was lost, so the row stands as written
    registry.stop(SCENE, 'walked_away', 'soft');

    expect(trimMemory).not.toHaveBeenCalled();
  });

  it('leaves the memory alone when its row never arrived', () => {
    const { registry, trimMemory } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'), 'paced text');

    registry.stop(SCENE, 'walked_away', 'soft');

    expect(trimMemory).not.toHaveBeenCalled();
  });

  it('only trims the opening round, the only one with a shared row', () => {
    const { registry, trimMemory } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'), 'paced text');
    registry.attachMemory('paced text', '900');
    // A continuation's transcript is never written to a shared memory row
    registry.roundQueued(SCENE, PARTICIPANTS, 2, lines('Still here?'), 'second paced text');
    expect(registry.attachMemory('second paced text', '901')).toBe(false);

    registry.lineShown(SCENE);
    registry.stop(SCENE, 'walked_away', 'soft');

    expect(trimMemory).toHaveBeenCalledWith('900', 'Alex: Hello.');
  });

  it('hands a finished conversation on whole, with every round and the cast', () => {
    const { registry, onSceneClosed } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.'), 'paced', CAST);
    registry.roundQueued(SCENE, PARTICIPANTS, 2, lines('Still here?', 'Yes.'), 'second');
    registry.lineShown(SCENE);
    registry.lineShown(SCENE);
    registry.lineShown(SCENE);
    registry.lineShown(SCENE);

    registry.playbackEnded(SCENE, true);
    expect(onSceneClosed).not.toHaveBeenCalled();
    registry.playbackEnded(SCENE, true);

    expect(onSceneClosed).toHaveBeenCalledTimes(1);
    const closed = onSceneClosed.mock.calls[0][0];
    expect(closed.sceneId).toBe(SCENE);
    expect(closed.reason).toBe('finished');
    expect(closed.cast).toEqual(CAST);
    expect(closed.participantSimIds).toEqual(PARTICIPANTS);
    expect(closed.lines.map((line) => line.text)).toEqual(['Hello.', 'Hi.', 'Still here?', 'Yes.']);
  });

  it('hands a softly stopped conversation on with the lines that were heard', () => {
    const { registry, onSceneClosed } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.', 'So anyway.'), 'paced', CAST);
    registry.lineShown(SCENE);
    registry.lineShown(SCENE);

    registry.stop(SCENE, 'walked_away', 'soft');

    const closed = onSceneClosed.mock.calls[0][0];
    expect(closed.reason).toBe('stopped');
    expect(closed.stopReason).toBe('walked_away');
    expect(closed.mode).toBe('soft');
    expect(closed.lines.map((line) => line.text)).toEqual(['Hello.', 'Hi.']);
  });

  it('leaves out the line a hard stop cut off, and hands the scene on once', () => {
    const { registry, onSceneClosed } = harness;
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.', 'Hi.', 'So anyway.'), 'paced', CAST);
    registry.lineShown(SCENE);
    registry.lineShown(SCENE);

    registry.stop(SCENE, 'left_lot', 'hard');
    registry.stop(SCENE, 'left_lot', 'hard');
    registry.playbackEnded(SCENE, false);

    expect(onSceneClosed).toHaveBeenCalledTimes(1);
    expect(onSceneClosed.mock.calls[0][0].lines.map((line) => line.text)).toEqual(['Hello.']);
  });

  it('does not hand on lines whose subtitle went out some other way', () => {
    const { registry, onSceneClosed } = harness;
    registry.roundQueued(
      SCENE,
      PARTICIPANTS,
      1,
      [{ speaker: 'Chat', text: 'Question?', skipSceneLine: true }, ...lines('An answer.')],
      'paced',
      CAST,
    );
    registry.playbackEnded(SCENE, true);

    expect(onSceneClosed.mock.calls[0][0].lines.map((line) => line.text)).toEqual(['An answer.']);
  });

  it('still reports the scene over when the appraisal throws', () => {
    const { registry, notifySceneEnded, onSceneClosed } = harness;
    onSceneClosed.mockImplementation(() => {
      throw new Error('no model');
    });
    registry.roundQueued(SCENE, PARTICIPANTS, 1, lines('Hello.'), 'paced', CAST);

    expect(() => {
      registry.playbackEnded(SCENE, true);
    }).not.toThrow();
    expect(notifySceneEnded).toHaveBeenCalledWith(SCENE, 'finished');
  });

  it('knows nothing about a conversation it was never told of', () => {
    const { registry, notifyStop } = harness;
    expect(registry.isStopped('never-seen')).toBe(false);
    expect(registry.isStopped(undefined)).toBe(false);
    registry.stop('never-seen', 'walked_away');
    expect(notifyStop).not.toHaveBeenCalled();
  });
});
