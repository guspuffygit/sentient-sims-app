import { describe, expect, it } from 'vitest';
import { mayStartEntry, shouldYieldTo } from 'renderer/voice/sceneQueue';

// A reply to the player makes the autonomous scene on air yield after its current line
// (Lever C, 2026-11-01). The renderer's provider has no tests of its own; the decisions
// live in these two helpers.

const paced = (over: Partial<{ priority: boolean; paced: boolean; sceneId?: string }> = {}) => ({
  priority: false,
  paced: true,
  sceneId: 'auto-1',
  ...over,
});

describe('shouldYieldTo', () => {
  it('a player reply makes a paced autonomous scene yield', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'reply-1' }, paced())).toBe(true);
  });

  it('a reply never yields to a reply', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'reply-2' }, paced({ priority: true }))).toBe(false);
  });

  it('a scene with no id cannot be marked', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'reply-1' }, paced({ sceneId: undefined }))).toBe(
      false,
    );
  });

  it('an unpaced scene is left alone', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'reply-1' }, paced({ paced: false }))).toBe(false);
  });

  it('a later round of the same conversation is a continuation, not an interruption', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'auto-1' }, paced())).toBe(false);
  });

  it('an autonomous scene makes nothing yield', () => {
    expect(shouldYieldTo({ priority: false, paced: true, sceneId: 'auto-2' }, paced())).toBe(false);
  });

  it('nothing playing: nothing to yield', () => {
    expect(shouldYieldTo({ priority: true, paced: true, sceneId: 'reply-1' }, undefined)).toBe(false);
  });
});

describe('mayStartEntry', () => {
  const entries = [{ continues: true }, { continues: false }, {}];

  it('an unmarked scene plays every entry', () => {
    expect(mayStartEntry(undefined, entries, 0)).toBe(true);
    expect(mayStartEntry(undefined, entries, 2)).toBe(true);
  });

  it('a scene the game ended starts nothing more', () => {
    expect(mayStartEntry('soft', entries, 1)).toBe(false);
    expect(mayStartEntry('hard', entries, 1)).toBe(false);
  });

  it('a yielding scene finishes the chunks of the line on air and no fresh line', () => {
    // entry 0 continues into entry 1: the chunk may play
    expect(mayStartEntry('yield', entries, 1)).toBe(true);
    // entry 1 does not continue: entry 2 is a fresh line
    expect(mayStartEntry('yield', entries, 2)).toBe(false);
    // no `continues` at all on the previous entry
    expect(mayStartEntry('yield', [{}, {}], 1)).toBe(false);
  });

  it('a yielding scene never starts its first entry', () => {
    expect(mayStartEntry('yield', entries, 0)).toBe(false);
  });
});
