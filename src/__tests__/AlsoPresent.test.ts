import { describe, expect, it } from 'vitest';
import { ALSO_PRESENT_RULE, buildAlsoPresentBlock, speciesWord } from 'main/sentient-sims/util/alsoPresent';
import { SimStateReport } from 'main/sentient-sims/models/SimStateReport';

// J3 (the 2026-09-04 playtest handoff, cause 3): asked which cats were on the lot, Wren invented Luna
// and Leo because the prompt listed nobody but her. The roster comes from the state
// report; a Sim on another lot never appears; an empty cache renders nothing at all.
describe('<ALSO_PRESENT>', () => {
  const report = {
    type: 'state_report',
    seq: 1,
    lot: { zone_id: 5, lot_id: '2891968416', lot_name: 'Chateau Frise' },
    sims: [
      {
        sim_id: '1',
        sim_name: 'Wren Calloway',
        self: { age: 'YOUNGADULT' },
        sims: [
          { sim_id: '2', tier: 'same_room', name: 'Mayor Whiskers', species: 'CAT', age: 'ADULT' },
          { sim_id: '3', tier: 'same_room', name: 'Margo Calloway', age: 'ADULT' },
          { sim_id: '9', tier: 'audible', name: 'Someone Through A Wall' },
        ],
      },
      { sim_id: '4', sim_name: 'Socks', self: { age: 'ADULT', species: 'CAT' }, sims: [] },
      { sim_id: '5', sim_name: 'Kona', self: { age: 'ADULT', species: 'SMALLDOG' }, sims: [] },
    ],
  } as unknown as SimStateReport;

  it('names the cats on the lot with their species and leaves the performers out', () => {
    const block = buildAlsoPresentBlock(report, 2891968416, ['1']);
    expect(block).toBe(
      [
        '<ALSO_PRESENT>',
        '- Socks (cat)',
        '- Kona (small dog)',
        '- Mayor Whiskers (cat)',
        '- Margo Calloway',
        ALSO_PRESENT_RULE,
        '</ALSO_PRESENT>',
      ].join('\n'),
    );
    // A performer already in the character blocks is not listed twice
    expect(buildAlsoPresentBlock(report, '2891968416', ['1', '3'])).not.toContain('Margo');
  });

  it('renders nothing for another lot, an empty cache, or a lot the report cannot place', () => {
    expect(buildAlsoPresentBlock(report, 12345, ['1'])).toBeUndefined();
    expect(buildAlsoPresentBlock(undefined, 2891968416, ['1'])).toBeUndefined();
    expect(buildAlsoPresentBlock(report, undefined, ['1'])).toBeUndefined();
    const noLotId = { ...report, lot: { zone_id: 5 } } as unknown as SimStateReport;
    expect(buildAlsoPresentBlock(noLotId, 2891968416, ['1'])).toBeUndefined();
  });

  it('caps the roster at twelve', () => {
    const crowd = {
      ...report,
      sims: Array.from({ length: 20 }, (_, index) => ({ sim_id: `s${index}`, sim_name: `Guest ${index}`, sims: [] })),
    } as unknown as SimStateReport;
    const block = buildAlsoPresentBlock(crowd, 2891968416, []) ?? '';
    expect(block.split('\n').filter((line) => line.startsWith('- '))).toHaveLength(12);
  });

  it('turns the game species into a word and says nothing for a human', () => {
    expect(speciesWord('CAT')).toBe('cat');
    expect(speciesWord('SMALLDOG')).toBe('small dog');
    expect(speciesWord('HUMAN')).toBeUndefined();
    expect(speciesWord(undefined)).toBeUndefined();
    expect(speciesWord('LLAMA')).toBe('llama');
  });
});
