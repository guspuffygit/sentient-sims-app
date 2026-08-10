import { onlineMappingsEqual } from 'main/sentient-sims/util/onlineMappingSync';

describe('onlineMappingsEqual', () => {
  const base = () =>
    new Map<string, unknown>(
      Object.entries({
        one: { name: 'one', action: 'first action' },
        two: { name: 'two', action: 'second action', ignored: true },
      }),
    );

  it('maps with the same entries are equal', () => {
    expect(onlineMappingsEqual(base(), base())).toBe(true);
  });

  it('detects a changed value', () => {
    const changed = base();
    changed.set('one', { name: 'one', action: 'edited action' });

    expect(onlineMappingsEqual(base(), changed)).toBe(false);
  });

  it('detects an added entry', () => {
    const added = base();
    added.set('three', { name: 'three', action: 'third action' });

    expect(onlineMappingsEqual(base(), added)).toBe(false);
  });

  it('detects a removed entry', () => {
    const removed = base();
    removed.delete('two');

    expect(onlineMappingsEqual(base(), removed)).toBe(false);
  });
});
