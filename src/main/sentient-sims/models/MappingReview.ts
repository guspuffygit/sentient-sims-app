// The review a mapper sees after pressing Test in the interaction or animation dialog: the
// template they wrote, the lines the AI narrated from it, and what the mapping guidelines say.

export type MappingFlag =
  | 'AI_DIRECTIVE'
  | 'UNWARRANTED_CONTEXT'
  | 'HARDCODED_NAME'
  | 'RAW_PRONOUN'
  | 'NON_ENGLISH'
  | 'BROKEN'
  | 'VERBOSE';

export const MAPPING_FLAGS: ReadonlyArray<MappingFlag> = [
  'AI_DIRECTIVE',
  'UNWARRANTED_CONTEXT',
  'HARDCODED_NAME',
  'RAW_PRONOUN',
  'NON_ENGLISH',
  'BROKEN',
  'VERBOSE',
];

export type MappingFindingConfidence = 'high' | 'medium' | 'low';

export type MappingFinding = {
  flag: MappingFlag;
  confidence: MappingFindingConfidence;
  // The words in the mapping the finding is about, when it is about particular words
  quote?: string;
  why: string;
  // A rule the app checked itself, or the reviewer model's reading
  source: 'check' | 'ai';
};

export type MappingVerdict = 'good' | 'needs_work' | 'bad';

export type MappingReviewRequest = {
  kind: 'interaction' | 'animation';
  // The interaction name, or the animation's author, name and id
  name: string;
  // The template in token form, as it would be saved
  action: string;
  // What the AI narrated from the template in the dialog's Test
  samples?: string[];
  sims?: Array<{ name: string; gender: string }>;
};

export type MappingReview = {
  verdict: MappingVerdict;
  // One line for the headline of the panel
  summary: string;
  findings: MappingFinding[];
  // A one-sentence rewrite in token form, only when the reviewer had one and it passes the checks
  suggestion?: string;
  // False when the reviewer model could not be asked: the findings are then the checks alone
  aiReviewed: boolean;
  aiError?: string;
  inSettings?: boolean;
};
