import { filterNullAndUndefined } from 'main/sentient-sims/util/filter';

describe('Util', () => {
  it('filterNullAndUndefined removes null and undefined values from list', () => {
    expect(filterNullAndUndefined([null, '1', undefined, '2'])).toEqual([
      '1',
      '2',
    ]);
  });
});
