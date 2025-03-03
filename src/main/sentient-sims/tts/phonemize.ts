import { phonemize as espeakng } from 'phonemizer';

/**
 * Helper function to split a string on a regex, but keep the delimiters.
 * This is required, because the JavaScript `.split()` method does not keep the delimiters,
 * and wrapping in a capturing group causes issues with existing capturing groups (due to nesting).
 */
function split(
  text: string,
  regex: RegExp
): { match: boolean; text: string }[] {
  const result = [];
  let prev = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const match of text.matchAll(regex)) {
    const fullMatch = match[0];
    if (prev < match.index) {
      result.push({ match: false, text: text.slice(prev, match.index) });
    }
    if (fullMatch.length > 0) {
      result.push({ match: true, text: fullMatch });
    }
    prev = match.index + fullMatch.length;
  }
  if (prev < text.length) {
    result.push({ match: false, text: text.slice(prev) });
  }
  return result;
}

/**
 * Helper function to split numbers into phonetic equivalents
 */
function splitNum(match: string): string {
  if (match.includes('.')) {
    return match;
  }
  if (match.includes(':')) {
    const [h, m] = match.split(':').map(Number);
    if (m === 0) {
      return `${h} o'clock`;
    }
    if (m < 10) {
      return `${h} oh ${m}`;
    }
    return `${h} ${m}`;
  }
  const year = parseInt(match.slice(0, 4), 10);
  if (year < 1100 || year % 1000 < 10) {
    return match;
  }
  const left = match.slice(0, 2);
  const right = parseInt(match.slice(2, 4), 10);
  const suffix = match.endsWith('s') ? 's' : '';
  if (year % 1000 >= 100 && year % 1000 <= 999) {
    if (right === 0) {
      return `${left} hundred${suffix}`;
    }
    if (right < 10) {
      return `${left} oh ${right}${suffix}`;
    }
  }
  return `${left} ${right}${suffix}`;
}

/**
 * Helper function to format monetary values
 */
function flipMoney(match: string): string {
  const bill = match[0] === '$' ? 'dollar' : 'pound';
  if (Number.isNaN(Number(match.slice(1)))) {
    return `${match.slice(1)} ${bill}s`;
  }
  if (!match.includes('.')) {
    const suffix = match.slice(1) === '1' ? '' : 's';
    return `${match.slice(1)} ${bill}${suffix}`;
  }
  const [b, c] = match.slice(1).split('.');
  const d = parseInt(c.padEnd(2, '0'), 10);
  const coins =
    // eslint-disable-next-line no-nested-ternary
    match[0] === '$'
      ? d === 1
        ? 'cent'
        : 'cents'
      : d === 1
      ? 'penny'
      : 'pence';
  return `${b} ${bill}${b === '1' ? '' : 's'} and ${d} ${coins}`;
}

/**
 * Helper function to process decimal numbers
 */
function pointNum(match: string): string {
  const [a, b] = match.split('.');
  return `${a} point ${b.split('').join(' ')}`;
}

/**
 * Normalize text for phonemization
 * @param {string} text The text to normalize
 * @returns {string} The normalized text
 */
function normalizeText(text: string): string {
  return (
    text
      // 1. Handle quotes and brackets
      .replace(/[‘’]/g, "'")
      .replace(/«/g, '“')
      .replace(/»/g, '”')
      .replace(/[“”]/g, '"')
      .replace(/\(/g, '«')
      .replace(/\)/g, '»')

      // 2. Replace uncommon punctuation marks
      .replace(/、/g, ', ')
      .replace(/。/g, '. ')
      .replace(/！/g, '! ')
      .replace(/，/g, ', ')
      .replace(/：/g, ': ')
      .replace(/；/g, '; ')
      .replace(/？/g, '? ')

      // 3. Whitespace normalization
      .replace(/[^\S \n]/g, ' ')
      .replace(/  +/, ' ')
      .replace(/(?<=\n) +(?=\n)/g, '')

      // 4. Abbreviations
      .replace(/\bD[Rr]\.(?= [A-Z])/g, 'Doctor')
      .replace(/\b(?:Mr\.|MR\.(?= [A-Z]))/g, 'Mister')
      .replace(/\b(?:Ms\.|MS\.(?= [A-Z]))/g, 'Miss')
      .replace(/\b(?:Mrs\.|MRS\.(?= [A-Z]))/g, 'Mrs')
      .replace(/\betc\.(?! [A-Z])/gi, 'etc')

      // 5. Normalize casual words
      .replace(/\b(y)eah?\b/gi, "$1e'a")

      // 5. Handle numbers and currencies
      .replace(
        /\d*\.\d+|\b\d{4}s?\b|(?<!:)\b(?:[1-9]|1[0-2]):[0-5]\d\b(?!:)/g,
        splitNum
      )
      .replace(/(?<=\d),(?=\d)/g, '')
      .replace(
        /[$£]\d+(?:\.\d+)?(?: hundred| thousand| (?:[bm]|tr)illion)*\b|[$£]\d+\.\d\d?\b/gi,
        flipMoney
      )
      .replace(/\d*\.\d+/g, pointNum)
      .replace(/(?<=\d)-(?=\d)/g, ' to ')
      .replace(/(?<=\d)S/g, ' S')

      // 6. Handle possessives
      .replace(/(?<=[BCDFGHJ-NP-TV-Z])'?s\b/g, "'S")
      .replace(/(?<=X')S\b/g, 's')

      // 7. Handle hyphenated words/letters
      .replace(/(?:[A-Za-z]\.){2,} [a-z]/g, (m) => m.replace(/\./g, '-'))
      .replace(/(?<=[A-Z])\.(?=[A-Z])/gi, '-')

      // 8. Strip leading and trailing whitespace
      .trim()
  );
}

/**
 * Escapes regular expression special characters from a string by replacing them with their escaped counterparts.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const PUNCTUATION = ';:,.!?¡¿—…"«»“”(){}[]';
const PUNCTUATION_PATTERN = new RegExp(
  `(\\s*[${escapeRegExp(PUNCTUATION)}]+\\s*)+`,
  'g'
);

/**
 * Phonemize text using the eSpeak-NG phonemizer
 */
export async function phonemize(
  text: string,
  language: 'a' | 'b' = 'a',
  norm: boolean = true
): Promise<string> {
  // 1. Normalize text
  let normalizedText = text;
  if (norm) {
    normalizedText = normalizeText(text);
  }

  // 2. Split into chunks, to ensure we preserve punctuation
  const sections = split(normalizedText, PUNCTUATION_PATTERN);

  // 3. Convert each section to phonemes
  const lang = language === 'a' ? 'en-us' : 'en';
  const ps = (
    await Promise.all(
      sections.map(async (section) =>
        section.match
          ? section.text
          : (await espeakng(section.text, lang)).join(' ')
      )
    )
  ).join('');

  // 4. Post-process phonemes
  let processed = ps
    // https://en.wiktionary.org/wiki/kokoro#English
    .replace(/kəkˈoːɹoʊ/g, 'kˈoʊkəɹoʊ')
    .replace(/kəkˈɔːɹəʊ/g, 'kˈəʊkəɹəʊ')
    .replace(/ʲ/g, 'j')
    .replace(/r/g, 'ɹ')
    .replace(/x/g, 'k')
    .replace(/ɬ/g, 'l')
    .replace(/(?<=[a-zɹː])(?=hˈʌndɹɪd)/g, ' ')
    .replace(/ z(?=[;:,.!?¡¿—…"«»“” ]|$)/g, 'z');

  // 5. Additional post-processing for American English
  if (language === 'a') {
    processed = processed.replace(/(?<=nˈaɪn)ti(?!ː)/g, 'di');
  }
  return processed.trim();
}
