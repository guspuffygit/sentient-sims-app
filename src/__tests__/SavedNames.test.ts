import { findSavedNames } from 'main/sentient-sims/util/savedNames';

const save = ['Audrey Bennett', 'Elliot Jr', 'Yuki Behr', 'Bo Chen', 'Art Miller'];

describe('findSavedNames', () => {
  it('finds a sim named in text that is about to be published', () => {
    expect(findSavedNames('{actor.0}: Play with Elliot Jr', save)).toEqual(['Elliot Jr']);
    expect(findSavedNames('{actor.0} kisses audrey bennett', save)).toEqual(['Audrey Bennett']);
  });

  it('reports a full name once, not again as its first name', () => {
    expect(findSavedNames('{actor.0} waves at Audrey Bennett', save)).toEqual(['Audrey Bennett']);
    // A separate bare first name is its own hit, and worth naming in the refusal
    expect(findSavedNames('Audrey Bennett hugs Audrey', save)).toEqual(['Audrey Bennett', 'Audrey']);
  });

  it('finds a first name on its own', () => {
    expect(findSavedNames('{actor.0}: Chat with Yuki', save)).toEqual(['Yuki']);
  });

  it('leaves text that names nobody alone', () => {
    expect(findSavedNames('{actor.0}: Play with {actor.1}', save)).toEqual([]);
    expect(findSavedNames('{actor.0} is busy with "baby talk" with {actor.1}.', save)).toEqual([]);
    expect(findSavedNames(undefined, save)).toEqual([]);
    expect(findSavedNames('Play with {actor.1}', [])).toEqual([]);
  });

  it('matches whole words only, and ignores names too short to be worth it', () => {
    // "Art" is a sim here, but a mapping about painting is not about him
    expect(findSavedNames('{actor.0} makes art at the easel', save)).toEqual(['Art']);
    expect(findSavedNames('{actor.0} joins the party', save)).toEqual([]);
    expect(findSavedNames('{actor.0} bothers {actor.1}', save)).toEqual([]);
  });

  it('is not fooled by punctuation around the name', () => {
    expect(findSavedNames("{actor.0} borrows Yuki's book", save)).toEqual(['Yuki']);
    expect(findSavedNames('{actor.0} yells at Yuki!', save)).toEqual(['Yuki']);
  });

  it('survives a name with regex characters in it', () => {
    expect(findSavedNames('{actor.0} waves at C.J. (Doe)', ['C.J. (Doe)'])).toEqual(['C.J. (Doe)']);
    expect(findSavedNames('{actor.0} waves at CXJX Doe', ['C.J. (Doe)'])).toEqual([]);
  });
});
