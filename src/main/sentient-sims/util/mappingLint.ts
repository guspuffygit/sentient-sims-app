import { ACTOR_WORD_PAIRS, MAPPING_SCENE_TOKENS } from '../formatter/PromptFormatter';
import { MappingFinding, MappingVerdict } from '../models/MappingReview';
import { SavedNameHit } from './savedNames';

// The rules the app can check without a model: tokens that will not render, directives aimed
// at the AI, pronouns written bare, names from the save, and length. The reviewer model reads
// for the rest (context the interaction never asked for, another language).

export type MappingLintOptions = {
  kind: 'interaction' | 'animation';
  // How many sims the interaction has, when known: {actor.N} past the last one never fills
  simCount?: number;
  // Names from the loaded save found in the text (InteractionService.nameHitsFromSaveIn)
  savedNames?: SavedNameHit[];
};

const TOKEN = /\{([^{}]*)\}/g;
const ACTOR_TOKEN = /^actor\.(\d+)(?:\.(.+))?$/;
const PRONOUN = /\b(he|she|him|his|himself|herself|her)\b/gi;
const POSSESSIVE_ON_TOKEN = /\{actor\.\d+\.his\/her\}'s/i;
const TUNING_IDENTIFIER = /\b[A-Za-z]+(?:_[A-Za-z0-9]+){2,}\b/;
const DANGLING_END = /\b(are|and|to|with|of|the|a|an|is|at|in|on|for|their|his|her)$/i;
// The dialog's own prefill: names, "and", and "are", with nothing said
const ONLY_NAMES_AND_ARE = /^(?:\{actor\.\d+\}|,|\s|and|are|is)+$/i;

const DIRECTIVE_RULES: Array<[RegExp, string]> = [
  [
    /\bAI\b[^.]*\b(ignore|skip|do not|don't|please|should|must)\b/i,
    'This line talks to the AI instead of describing the scene.',
  ],
  [
    /\[[^\]]*\b(AI|do not|don't|please|output|response|describe|mention|focus)\b[^\]]*\]/i,
    'A bracketed note to the AI is a directive, not part of the scene.',
  ],
  [
    /\b(the|your|its|this) (output|response|reply|generation)\b/i,
    'Talking about "the output" is an instruction to the model.',
  ],
  [
    /\bplease\b[^.]*\b(vary|keep|describe|do not|don't|make|focus|avoid|include|mention|write)\b/i,
    'A request to the model is a directive, not a scene.',
  ],
  [
    /\b(do not|don't|never) (include|mention|describe|reference|add|write)\b/i,
    'Telling the model what to leave out is a directive.',
  ],
  [/\bfocus (only )?on\b/i, 'Telling the model where to focus is a directive.'],
  [/\(mention [^)]*\)/i, 'A parenthetical ask is a directive, not part of the scene.'],
  [/\bthank you\b/i, 'The model is not a person to thank; it reads as a directive.'],
];

function validToken(body: string, options: MappingLintOptions): string | undefined {
  const actor = ACTOR_TOKEN.exec(body);
  if (actor) {
    const index = Number(actor[1]);
    if (actor[2] && !ACTOR_WORD_PAIRS.some((pair) => pair.token === actor[2])) {
      const known = ACTOR_WORD_PAIRS.map((pair) => pair.token).join(', ');
      return `{${body}} is not a word the app can fill. The actor words are ${known}.`;
    }
    if (options.simCount !== undefined && index >= options.simCount) {
      const count = options.simCount === 1 ? 'one sim' : `${options.simCount} sims`;
      return `This ${options.kind} has ${count}, so {${body}} will never be filled in.`;
    }
    return undefined;
  }
  if (MAPPING_SCENE_TOKENS.includes(body)) {
    return undefined;
  }
  return `{${body}} is not a token the app knows, so it would reach the AI as written.`;
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+(?:\s|$)/).filter((part) => part.trim().length > 0).length;
}

export function lintMapping(action: string, options: MappingLintOptions): MappingFinding[] {
  const findings: MappingFinding[] = [];
  const text = action.trim();

  if (text.length === 0) {
    return [{ flag: 'BROKEN', confidence: 'high', why: 'The mapping is empty.', source: 'check' }];
  }

  if (ONLY_NAMES_AND_ARE.test(text)) {
    return [
      {
        flag: 'BROKEN',
        confidence: 'high',
        quote: text,
        why: 'Only the names and "are": nothing says what the sims are doing. This is the text the dialog starts with.',
        source: 'check',
      },
    ];
  }

  const badTokens = new Set<string>();
  for (const match of text.matchAll(TOKEN)) {
    const problem = validToken(match[1], options);
    if (problem && !badTokens.has(match[0])) {
      badTokens.add(match[0]);
      findings.push({ flag: 'BROKEN', confidence: 'high', quote: match[0], why: problem, source: 'check' });
    }
  }
  const unclosed = /\{[^}]*$/.exec(text);
  if (unclosed) {
    findings.push({
      flag: 'BROKEN',
      confidence: 'high',
      quote: unclosed[0],
      why: 'A token is opened and never closed.',
      source: 'check',
    });
  }

  const possessive = POSSESSIVE_ON_TOKEN.exec(text);
  if (possessive) {
    findings.push({
      flag: 'BROKEN',
      confidence: 'high',
      quote: possessive[0],
      why: `This renders as "his's" or "her's". {actor.N.his/her} is already possessive.`,
      source: 'check',
    });
  }

  const dangling = DANGLING_END.exec(text.replace(/[\s"']+$/, ''));
  if (dangling && !/[.!?]$/.test(text)) {
    findings.push({
      flag: 'BROKEN',
      confidence: 'medium',
      quote: `...${dangling[0]}`,
      why: `The text ends on "${dangling[0]}", so it looks cut off.`,
      source: 'check',
    });
  }

  const prose = text.replace(TOKEN, ' ');
  const pronouns = new Set<string>();
  for (const match of prose.matchAll(PRONOUN)) {
    pronouns.add(match[0].toLowerCase());
  }
  if (pronouns.size > 0) {
    const words = Array.from(pronouns);
    findings.push({
      flag: 'RAW_PRONOUN',
      confidence: 'high',
      quote: words.join(', '),
      why: 'A bare pronoun is wrong for half the sims it fires on. Use the {actor.N.he/she} form.',
      source: 'check',
    });
  }

  const tuning = TUNING_IDENTIFIER.exec(prose);
  if (tuning) {
    findings.push({
      flag: 'BROKEN',
      confidence: 'medium',
      quote: tuning[0],
      why: 'This looks like a game identifier pasted into the text rather than a word a reader knows.',
      source: 'check',
    });
  }

  DIRECTIVE_RULES.forEach(([rule, why]) => {
    const match = rule.exec(text);
    if (match && !findings.some((finding) => finding.flag === 'AI_DIRECTIVE' && finding.quote === match[0])) {
      findings.push({ flag: 'AI_DIRECTIVE', confidence: 'high', quote: match[0], why, source: 'check' });
    }
  });

  // A full name is a sim; a lone first or last name may be a word that a townie is also
  // called, so it is a question rather than a verdict
  (options.savedNames ?? []).forEach((hit) => {
    findings.push({
      flag: 'HARDCODED_NAME',
      confidence: hit.whole ? 'high' : 'medium',
      quote: hit.name,
      why: hit.whole
        ? `${hit.name} is a sim in your save. Everyone who uses this mapping would read that name; use {actor.N}.`
        : `A sim in your save is called ${hit.name}. If this means that sim, use {actor.N}; as a word it is fine.`,
      source: 'check',
    });
  });

  const sentences = sentenceCount(text);
  const paragraphs = text.split(/\n\s*\n/).length;
  if (paragraphs > 1 || sentences > 3 || text.length > 400) {
    findings.push({
      flag: 'VERBOSE',
      confidence: 'high',
      why: `A mapping is one short sentence. This one runs ${sentences} sentences and ${text.length} characters.`,
      source: 'check',
    });
  } else if (sentences > 1 || text.length > 200) {
    findings.push({
      flag: 'VERBOSE',
      confidence: 'medium',
      why: 'A mapping reads best as one short sentence; this could be shorter.',
      source: 'check',
    });
  }

  return findings;
}

// A mapping that would mislead or break for other players is bad; one that only needs a trim
// needs work; the rest is good
export function mappingVerdict(findings: MappingFinding[]): MappingVerdict {
  const blocking = findings.some(
    (finding) =>
      finding.confidence === 'high' &&
      (finding.flag === 'BROKEN' ||
        finding.flag === 'AI_DIRECTIVE' ||
        finding.flag === 'HARDCODED_NAME' ||
        finding.flag === 'RAW_PRONOUN' ||
        finding.flag === 'NON_ENGLISH'),
  );
  if (blocking) {
    return 'bad';
  }
  return findings.length > 0 ? 'needs_work' : 'good';
}
