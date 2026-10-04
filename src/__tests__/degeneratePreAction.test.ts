import { describe, expect, it } from 'vitest';
import { isDegeneratePreAction } from '../main/sentient-sims/util/degeneratePreAction';

describe('isDegeneratePreAction', () => {
  it('rejects the live "Marisol Vega are " cascade fragment', () => {
    expect(isDegeneratePreAction('Marisol Vega are ')).toBe(true);
  });

  it('rejects empty and whitespace-only renders', () => {
    expect(isDegeneratePreAction(undefined)).toBe(true);
    expect(isDegeneratePreAction('')).toBe(true);
    expect(isDegeneratePreAction('   ')).toBe(true);
  });

  it('rejects unsubstituted template tokens', () => {
    expect(isDegeneratePreAction('Marisol Vega waves at {target} warmly')).toBe(true);
  });

  it('rejects fragments ending in a dangling connective', () => {
    expect(isDegeneratePreAction('Marisol Vega is talking with')).toBe(true);
    expect(isDegeneratePreAction('Nancy Landgraab walks to the')).toBe(true);
  });

  it('rejects too-short fragments', () => {
    expect(isDegeneratePreAction('Marisol waves')).toBe(true);
  });

  it('rejects empty-slot shapes from a blank actor name', () => {
    // A sim whose name rendered as '' leaves the verb leading, a double space, or an
    // orphaned possessive/object — the "scene about nobody" class from the playtest log
    expect(isDegeneratePreAction(' is telling Milo Calder a joke')).toBe(true);
    expect(isDegeneratePreAction('Milo Calder  is telling a joke to Tessa')).toBe(true);
    expect(isDegeneratePreAction("Milo Calder is taking 's hand and leading them away")).toBe(true);
    expect(isDegeneratePreAction('Milo Calder is talking to .')).toBe(true);
    expect(isDegeneratePreAction('and Milo Calder are chatting about the weather')).toBe(true);
  });

  it('accepts normal rendered pre_actions', () => {
    expect(isDegeneratePreAction('Marisol Vega tells a joke to Nancy Landgraab')).toBe(false);
    expect(isDegeneratePreAction('Alexander Goth grabs a snack from the fridge.')).toBe(false);
    expect(isDegeneratePreAction('Olivia Kim-Lewis flirts with Marisol Vega')).toBe(false);
    expect(isDegeneratePreAction("Marisol Vega is taking Nancy Landgraab's hand and leading them to the bedroom.")).toBe(false);
    expect(isDegeneratePreAction('Marisol Vega and Nancy Landgraab are chatting, and it is going well.')).toBe(false);
  });

  it('does not blame the renderer for a double space the template itself authored', () => {
    // Night watch 2026-08-18: an online mapping for GossipAbout carried '],  traits' (two
    // spaces, authored) and rendered perfectly, but was rejected as degenerate — every
    // gossip event was silently dropped. The double-space rule is about a NAME that
    // rendered to '' — so it only counts when the raw template did not already have it.
    const template = '{actor.0} is engaging in friendly gossip with {actor.1}. [Assess X and Y [an occult, a human],  traits, buffs.]';
    const rendered = 'Summer Holiday is engaging in friendly gossip with Travis Scott. [Assess X and Y [an occult, a human],  traits, buffs.]';
    expect(isDegeneratePreAction(rendered, template)).toBe(false);
    // …but a double space that the renderer introduced (a blank name) is still degenerate
    expect(isDegeneratePreAction('Milo Calder  is telling a joke to Tessa', '{actor.0} {actor.1} is telling a joke to Tessa')).toBe(true);
    // and without a template the old strict behaviour stands
    expect(isDegeneratePreAction('Milo Calder  is telling a joke to Tessa')).toBe(true);
  });
});
