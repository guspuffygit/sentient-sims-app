import { describe, expect, it } from 'vitest';
import {
  buildTranscriptionPrompt,
  correctNames,
  correctPlaces,
  levenshtein,
} from '../main/sentient-sims/util/nameCorrection';

describe('STT dictionary (V-7)', () => {
  it('snaps the near-misses observed live to the real names', () => {
    const known = ['Lillie Cason', 'Mika Oshino', 'Tessa Chatman', 'Milo Calder'];
    expect(correctNames('Tell Lily I said hi', known)).toBe('Tell Lillie I said hi');
    expect(correctNames('Meika, come here', known)).toBe('Mika, come here');
    expect(correctNames("Where is Chapman's dog?", known)).toBe("Where is Chatman's dog?");
  });

  it('leaves prose and exact names alone', () => {
    const known = ['Lillie Cason', 'Milo Calder'];
    expect(correctNames('Milo, the milk is on the table', known)).toBe('Milo, the milk is on the table');
    expect(correctNames('I like this a lot', known)).toBe('I like this a lot');
    expect(correctNames('hello', [])).toBe('hello');
  });

  it('never renames the everyday words a sentence starts with', () => {
    // Live 08-27: the player's fillers were snapped to sims and the sims were addressed
    // by the wrong name — "Well" -> Wells, "Kay" -> Kai (a phonetic tie), "Hey" -> Huy
    const known = ['Marcus Wells', 'Kai Nguyen', 'Huy Tran'];
    expect(correctNames('Well, how are you today?', known)).toBe('Well, how are you today?');
    expect(correctNames("Welp, too bad, it's coming.", ['Viviana Wells'])).toBe("Welp, too bad, it's coming.");
    expect(correctNames("Kay let's go to the park", known)).toBe("Kay let's go to the park");
    expect(correctNames('Hey there, what are you up to?', known)).toBe('Hey there, what are you up to?');
    // The real names still resolve when they are actually spoken
    expect(correctNames('Kai, come here', known)).toBe('Kai, come here');
  });

  it('keeps sims whose names are also everyday words', () => {
    const known = ['Will Wright', 'Grace Kim'];
    expect(correctNames('Will, come here', known)).toBe('Will, come here');
    expect(correctNames('Tell Grace I said hi', known)).toBe('Tell Grace I said hi');
  });

  it('ignores placeholder names from namelessly-reported sims', () => {
    expect(correctNames('Simon says hello', ['Sim 132600080439250755'])).toBe('Simon says hello');
  });

  it('hears Wren behind the silent w', () => {
    // Whisper wrote "Ren" and "Rin" for Wren (live 08-27); wr -> r in the phonetic layer
    // brings both within tolerance
    expect(correctNames('Hi, Ren, how are you?', ['Wren Calloway'])).toBe('Hi, Wren, how are you?');
    expect(correctNames("Hi, Rin, what's up?", ['Wren Calloway'])).toBe("Hi, Wren, what's up?");
    expect(correctNames('Hey Margot, how are you?', ['Margo Calloway'])).toBe('Hey Margo, how are you?');
  });

  it('hears Adrian behind a silent final e', () => {
    // Whisper spelled Adrian "Adrienne" (live 09-23): "adrien" is one vowel from "adrian"
    expect(correctNames('Adrienne, come here', ['Adrian Vane'])).toBe('Adrian, come here');
    expect(correctNames("Is that Adrienne's car?", ['Adrian Vane'])).toBe("Is that Adrian's car?");
  });

  it('spells the game worlds the way the game does', () => {
    // Live 09-27: Whisper wrote "Dale Sol Valley" and Augustus remembered living there
    expect(correctPlaces('You are now a homeowner in Dale Sol Valley, where you can shine.')).toBe(
      'You are now a homeowner in Del Sol Valley, where you can shine.',
    );
    expect(correctPlaces('We moved to Stranger Ville last week')).toBe('We moved to StrangerVille last week');
    expect(correctPlaces('The dogs love Brendleton Bay')).toBe('The dogs love Brindleton Bay');
    expect(correctPlaces('Welcome to Del Sol Valley')).toBe('Welcome to Del Sol Valley');
    // Everyday words and a comma-broken run stay put
    expect(correctPlaces('Dale, so valid.')).toBe('Dale, so valid.');
    expect(correctPlaces('Sure, I will. Maybe later.')).toBe('Sure, I will. Maybe later.');
    expect(correctPlaces('Tell Dale to come home')).toBe('Tell Dale to come home');
  });

  it('never snaps the words of a world to a sim', () => {
    expect(correctNames('Del Sol Valley is lovely', ['Sal Moreno', 'Dell Ortiz'])).toBe('Del Sol Valley is lovely');
  });

  it('builds a name-dense prompt, tightest scope first, capped', () => {
    const prompt = buildTranscriptionPrompt([['Lillie Cason'], ['Mika Oshino', 'Lillie Cason'], []]);
    expect(prompt).toBe('Names in this scene: Lillie Cason, Mika Oshino.');
    expect(buildTranscriptionPrompt([[]])).toBeUndefined();
    const many = Array.from({ length: 200 }, (_, index) => `Person Number${index}`);
    expect(buildTranscriptionPrompt([many])!.length).toBeLessThanOrEqual(720);
  });

  it('levenshtein basics', () => {
    expect(levenshtein('lily', 'lillie')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });

  // J7 (the 2026-09-04 playtest handoff, cause 7): with Rainn Whiting in the pool, "Rin" was phonetic
  // distance 1 from both Wren and Rainn and the clearly-closest rule let it through; the
  // sims then copied "Rin", "Ren" and "Hallie" into their thoughts and memories.
  it('settles the Wren/Rainn tie by raw spelling with the real pool', () => {
    const pool = [
      'Wren Calloway',
      'Margo Calloway',
      'Rainn Whiting',
      'Halley Chatman',
      'Milo Calder',
      'Tessa Chatman',
      'Emma Calder',
      'Lillie Cason',
      'Asher Woolie Wolfie',
    ];
    expect(correctNames('Which cats though, Rin?', pool)).toBe('Which cats though, Wren?');
    expect(correctNames('...on this lot right now, Ren?', pool)).toBe('...on this lot right now, Wren?');
    expect(correctNames('Hey Hallie, call the fire department.', pool)).toBe('Hey Halley, call the fire department.');
    // Rainn is still reachable when that is what was said
    expect(correctNames('Rain, come here', pool)).toBe('Rainn, come here');
  });

  it('never turns a sentence starter into a sim', () => {
    const pool = ['Asher Woolie Wolfie', 'Wren Calloway', 'Alton Ross'];
    expect(correctNames("Answer Woolie Wolfie's question.", pool)).toBe("Answer Woolie Wolfie's question.");
    expect(correctNames('Always the same with you', pool)).toBe('Always the same with you');
    expect(correctNames('Another one, please', pool)).toBe('Another one, please');
    expect(correctNames('Asher, come here', pool)).toBe('Asher, come here');
  });

  it('lets the lot settle a tie the spelling cannot', () => {
    // Two names one edit from the token and equally far in raw spelling: only the
    // roster can decide, and only when exactly one of them is here
    const pool = ['Mara Stone', 'Mira Stone'];
    expect(correctNames('Mora, over here', pool)).toBe('Mora, over here');
    expect(correctNames('Mora, over here', pool, ['Mira Stone'])).toBe('Mira, over here');
    expect(correctNames('Mora, over here', pool, ['Mira Stone', 'Mara Stone'])).toBe('Mora, over here');
  });

  // Live 09-17..09-22: whisper heard every one of these right and the post-pass broke
  // them; "Aliens took her" -> "Alena took her" sent Lillie hunting Alena's motives
  it('leaves the everyday words it snapped live alone', () => {
    const pool = [
      'Naoki Ito',
      'Kiyoshi Ito',
      'Shirley Temple',
      'Socks Lee',
      'Mayumi Tan',
      'Brent Cole',
      'Alena Ross',
      'Ian Park',
      'Chad Cole',
      'Paris Vane',
      'Lillie Cason',
    ];
    const heard = [
      "Oh, you can tell me. It's fine.",
      "He's like a really nice single father.",
      "Aren't you jealous?",
      'People in the real world are watching you.',
      "Looks like you're desperate for fun.",
      'Mainly just the fact that my father is moving.',
      'Aliens took her.',
      "You know she's still living with Jake in San Sequoia, right?",
      'I guess Chat might be one of them.',
      'You just went to Party House.',
    ];
    heard.forEach((line) => expect(correctNames(line, pool)).toBe(line));
    // while the real mishearings still land
    expect(correctNames('Hey Lily, how are you?', pool)).toBe('Hey Lillie, how are you?');
    expect(correctNames('What do you think of Nauki?', pool)).toBe('What do you think of Naoki?');
    expect(correctNames("Mazie's here", ['Macy Rowe'])).toBe("Macy's here");
    expect(correctNames('Tell Ito hi', pool)).toBe('Tell Ito hi');
  });
});
