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

  it('accepts normal rendered pre_actions', () => {
    expect(isDegeneratePreAction('Marisol Vega tells a joke to Nancy Landgraab')).toBe(false);
    expect(isDegeneratePreAction('Alexander Goth grabs a snack from the fridge.')).toBe(false);
    expect(isDegeneratePreAction('Olivia Kim-Lewis flirts with Marisol Vega')).toBe(false);
  });
});
