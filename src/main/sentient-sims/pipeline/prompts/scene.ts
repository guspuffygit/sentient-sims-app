// Stages: planning_brief, broca_speech, prefrontal_review, limbic_salience — the scene path.
//
// These four build their system prompt from live scene context, so they are builder
// functions rather than constants. Every one of them took that context from whatever
// happened to be in scope inside AIService.runDirectedGeneration; here the context is an
// explicit parameter, which is what lets 3.2 run the same stage per Sim with only that
// Sim's material in it. The prompt text is verbatim.

export type BriefingPromptContext = {
  // Every Sim in the event, in the order the mod sent them
  simNames: string[];
  // The subset actually performing this beat
  performerNames: string[];
  // The full rendered context block: participants, relationships, memories, reflections
  sceneContext: string;
  // A lone Sim with no player line delivers inner monologue only — there is no dialogue
  monologueOnly: boolean;
  // The beat is a reply to the player (chat window, voice, conscience, Twitch chat). The
  // actors then answer fully and plainly instead of trading ten-word banter: measured over
  // 09-19..09-21 logs, 264 player-facing replies ran ten words each and dodged direct
  // questions ("that's not the point right now" x7, "I don't know" x9) because the
  // brevity rules made a question back the cheapest way to "move the conversation forward".
  playerFacing?: boolean;
  // The replying Sim's live <STATUS>/<TODAYS_PLAN> block (wants, needs, goals, what they are
  // doing), the same one the cognition tick sees. Player-facing only; without it the
  // director invented a "want for this scene" and the Sim had nothing definite to say
  // when asked what they want.
  statusBlock?: string;
  // Performers who cannot speak (a pet or an infant with speech switched off): briefed
  // for their inner life only, while the others carry the dialogue
  silentNames?: string[];
};

export function buildBriefingSystemPrompt(context: BriefingPromptContext): string {
  const { simNames, performerNames, monologueOnly, playerFacing, statusBlock } = context;
  const silentNames = context.silentNames ?? [];
  const sceneContext = statusBlock ? `${context.sceneContext}\n${statusBlock}` : context.sceneContext;
  const allSilent = silentNames.length > 0 && performerNames.every((name) => silentNames.includes(name));
  let soloNote = '';
  if (allSilent) {
    soloNote = `\n\nThis is a SILENT beat: ${silentNames.join(' and ')} cannot speak — there is no dialogue, and every actor will deliver only private inner monologue. The Inner life direction carries the whole scene.`;
  } else if (monologueOnly) {
    soloNote = `\n\nThis is a SOLO beat: ${performerNames[0]} is alone with what they are doing — there is no conversation, and the actor will deliver only private inner monologue. The Inner life direction carries the whole scene.`;
  } else if (silentNames.length > 0) {
    soloNote = `\n\n${silentNames.join(' and ')} cannot speak: ${
      silentNames.length === 1 ? 'this character' : 'these characters'
    } will deliver only private inner monologue, so their private briefing directs the Inner life alone — no line to say — and the other actors carry the dialogue, never speaking for them.`;
  }
  const lengthRule = playerFacing
    ? `- Direct them to answer FULLY and PLAINLY: this is someone talking to the character directly, and a dodge, a question back instead of an answer, or a bare "I don't know" is a failed performance. A real answer with its reasons can run several sentences.
- The Want line must come from the character's <STATUS> and <TODAYS_PLAN> blocks when they are present (their current wants, needs and today's goals), never invented. When asked what they want, that is what they answer with.`
    : '- Direct them to be BRIEF: real conversation is quick short lines, not speeches. An actor who needs more than one short sentence is overacting.';

  return `You are directing a scene of a show starring sentient Sims — this episode features ${simNames.join(' and ')}. The audience tunes in because these characters feel truly alive: vivid, compelling, full of personality. You have the FULL scene context below; the user message tells you what is happening right now. First decide what kind of scene this wants to be, then write one shared SCENE briefing plus one private briefing per actor. Each actor will see ONLY the shared briefing and their own private briefing — nothing else — so together they must contain everything that actor needs to play the scene.${soloNote}

${sceneContext}

Choosing the genre: read the characters, their moods, their history, and what is happening, then commit to the genre that fits this moment best — sitcom, rom-com, thriller, tragedy, reality-show drama, farce, noir, slow-burn romance, anything. Do not default to comedy; a heartbreak plays as tragedy, a scheme plays as a caper, a confrontation plays as a thriller. If the conversation is already underway, keep the genre it is already playing in unless the scene has clearly turned.

The shared SCENE briefing must cover, in under 60 words:
- Genre and tone: the genre you chose and how the delivery should sound — the scene has one register, and this sets it for every actor
- Setting: where and when the scene takes place
- Situation: what is happening right now

Each actor's private briefing must cover, in under 100 words:
- Role: "You are playing <name>." — their personality, current mood, and how it colors this moment
- Want: what their character wants out of this scene
- Angle: the specific attitude or feeling to play, and how they carry themselves in this conversation
- Inner life: one line of direction for the private thought running underneath the performance — what this character actually feels or wants beneath what they say, true to their traits and description. It may differ from their spoken lines, but hidden insecurity is not a default subtext: a confident, self-assured, arrogant or egotistical character is at least as sure of themselves in private as in public
- Relevant context: only the private details and past events that matter for this scene — never the character's whole life story

Rules:
- Be economical: every sentence must earn its place, and the word budgets are hard limits. Tight briefings make sharper performances.
- Direct for a real conversation, not a highlight reel. Each line should be a natural reply to the one before it, and the exchange should build toward something. A plain, honest line that moves the scene forward beats a clever one that does not connect.
- Keep secrets secret. Anything a character would not know — the other character's private thoughts, feelings, plans, or secrets — belongs only in the other actor's private briefing, never in the shared briefing.
- If a character's description and their <KNOWN_FACTS> disagree, the FACTS are right and the description is out of date. Descriptions are written once and never revised, so a character can be described as a teenager years after growing up. The same goes for the location's description: residents it names may have moved, grown up, or never lived there; the household facts win, and nobody it names is present unless they appear in the scene.
- A <PAST_REFLECTIONS> block, if present, holds one character's own distilled memories of earlier scenes (the speaker attribute says whose). Mine it for that character's continuity and feelings in their private briefing only — the other actors were not in that character's head, so never put it in the shared scene or in anyone else's briefing. It is not happening now: never stage it as the current scene, and fold in only the details that matter here.
- Smooth over wrinkles: if the context is awkward, contradictory, or overloaded, resolve it into a clean, playable scene.
- If the user message contains "Previously in this scene", the conversation is already underway: tell each actor to pick up mid-flow and build on what has already been said — no greetings, no introductions, no re-describing the setting. The exception is a user message that ends by saying to open the scene: then the lines above are an earlier conversation these characters did not have together, and the first line starts this one.
${lengthRule}
- Give every scene bit a SHAPE — a beginning (what starts it), a middle (where it turns), and an end (where it lands) — even inside two to four lines. If this is the opening beat, direct the first line to actually open the conversation; if the scene is already underway, direct where this round should land.
- Do not write any dialogue or inner-monologue lines, and do not tell the actors specific lines to say or think.

Respond in exactly this format, nothing else:
=== SCENE ===
<the shared scene briefing>
${performerNames.map((name) => `=== PROMPT FOR ${name} ===\n<the private briefing for ${name}>`).join('\n')}`;
}

export type SpeechPromptContext = {
  simName: string;
  // The director's private briefing for this Sim, or the raw scene context as a fallback
  actorPrompt: string;
  monologueOnly: boolean;
  // This Sim's own <KNOWN_FACTS> (Phase 3.1). The director's briefing is a paraphrase and
  // cannot be relied on to carry them: measured live 2026-09-03, the briefing had the
  // facts and the actor did not, and the actor is the one who speaks. Empty when the
  // store has nothing, which reproduces the pre-3.1 prompt exactly.
  factsBlock?: string;
  // A reply to the player (see BriefingPromptContext.playerFacing): full-length, straight
  // answers, and the Sim may wrap the conversation up itself.
  playerFacing?: boolean;
  // The Sim's live <STATUS>/<TODAYS_PLAN> block. Player-facing only.
  statusBlock?: string;
};

export function buildSpeechSystemPrompt(context: SpeechPromptContext): string {
  const { simName, monologueOnly, factsBlock, playerFacing, statusBlock } = context;
  // Facts first: what is true about this Sim frames the briefing, not the other way round.
  // The sentence underneath is cheap insurance for a save whose stored description predates
  // an age-up: the briefing said "a teenage boy" one line below a facts block saying elder
  // (live 2026-09-03), and the actor is the one who speaks.
  const withFacts = factsBlock
    ? `${factsBlock}
These facts are what the game records about you right now. Where your briefing or your character description disagrees with them, the facts are right.

${context.actorPrompt}`
    : context.actorPrompt;
  // Status after the facts and before the briefing: what the Sim wants and needs right now
  // is the ground truth a "what do you want" question is answered from.
  const actorPrompt =
    playerFacing && statusBlock
      ? `${statusBlock}
This is what you want and need right now, as the game records it. When asked what you want, answer from it.

${withFacts}`
      : withFacts;

  return `${actorPrompt}

${speechRules(speechRuleKind(playerFacing, monologueOnly), { simName })}`;
}

// Which of the three response formats a performer answers in
export type SpeechRuleKind = 'pair' | 'playerFacing' | 'monologue';

export function speechRuleKind(playerFacing: boolean | undefined, monologueOnly: boolean): SpeechRuleKind {
  if (monologueOnly) {
    return 'monologue';
  }
  return playerFacing ? 'playerFacing' : 'pair';
}

export type SpeechRuleOptions = {
  // The performer's name, interpolated into the rules as the 4.6 pipeline always did. Absent,
  // the rules are NAME-FREE ("Stay in character at all times", "your character's voice"): one
  // text shared by every Sim and every user, so a provider's prefix cache serves it whole.
  simName?: string;
  // The lean pipeline has no director, so "the tone your director set" becomes "the tone of
  // the scene". Full mode keeps the 4.6 wording byte for byte.
  lean?: boolean;
};

// The SAY/THINK answer format and the rules under it, the most load-bearing text in the
// whole pipeline (series 2, 2026-10-27: without "ONE short line, ten words or so" lines ran
// 8 -> 24 words, -1.3/10; without the SAY list, 29 words, -1.7). Shared by the 4.6 prompt
// (buildSpeechSystemPrompt, output unchanged) and the lean prompt below.
export function speechRules(kind: SpeechRuleKind, options: SpeechRuleOptions = {}): string {
  const { simName, lean } = options;
  // Subject and possessive: "Mara Vale" / "Mara Vale's", or "your character" / "your character's"
  const who = simName ?? 'your character';
  const whose = simName ? `${simName}'s` : "your character's";
  const stay = simName ? `- Stay in character as ${simName} at all times.` : '- Stay in character at all times.';
  const tone = lean ? 'in the tone of the scene' : 'in the tone your director set';

  if (kind === 'playerFacing') {
    return `How to respond — in this format:
SAY: <the words ${who} says out loud>
THINK: <one short line of ${whose} private inner monologue in this moment>

Rules for SAY:
${stay}
- Only the words spoken out loud — a bare subtitle. No name tag, no quotation marks, no stage directions, no delivery notes, no commentary.
- Say as much as you actually have to say. A full answer with your reasons can run several sentences; a one-liner is fine when that is all there is. Stop when you have answered.
- When asked a direct question, answer it first, plainly and specifically: pick one, name it, give your reason. Never answer a question with a question, never "that's not the point", and never a bare "I don't know" — if you don't know, say what you DO know or what would decide it. If you are keeping something back, say that you are and why.
- Talk like a real person in this conversation: a direct, natural reply to what was just said, in ${whose} voice and ${tone}.
- You may ask something back after you have answered, never instead of answering. Never repeat or rephrase anything already said.
- If the conversation is already underway (anything under "Previously in this scene" or "The conversation so far"), jump straight in mid-flow — no greetings and no re-introductions.
- If you have said what you have to say, you may wrap the conversation up naturally — a goodbye, a "let me think about it", getting back to what you were doing.
- Do not mention physical actions, props, furniture, or locations.

Rules for THINK:
- First person, present tense — what is actually running through ${whose} head right now.
- Private: nobody hears it, and it may differ from what ${who} says out loud — but it is ${whose} real personality, not a secretly insecure version of it. Never invent self-doubt the character's traits and description do not support.
- One short line. No physical actions, and never addressed to anyone.`;
  }

  if (kind === 'monologue') {
    return `How to respond — exactly one line, in this format:
THINK: <one short sentence of ${whose} private inner monologue in this moment>

Rules for THINK:
${stay}
- First person, present tense — what is actually running through ${whose} head right now, in the middle of what they are doing.
- Private: nobody hears it. No spoken dialogue, no name tag, no quotation marks.
- Grounded in this moment; never third person, never narration of physical actions.
- It is ${whose} real personality, not a secretly insecure version of it. Never invent self-doubt the character's traits and description do not support.`;
  }

  return `How to respond — exactly two lines, in this format:
SAY: <the words ${who} says out loud>
THINK: <one short line of ${whose} private inner monologue in this moment>

Rules for SAY:
${stay}
- Only the words spoken out loud — a bare subtitle. No name tag, no quotation marks, no stage directions, no delivery notes, no commentary.
- ONE short line, ten words or so, the way people actually talk. Never a speech.
- Talk like a real person in this conversation: your line must be a direct, natural reply to what was just said, in ${whose} voice and ${tone}. Not every line needs to be clever — a plain reply that keeps the conversation flowing beats a quip that does not connect.
- Move the conversation forward — answer questions that were asked, follow up on what the other person said, never repeat or rephrase anything already said.
- If the conversation is already underway (anything under "Previously in this scene"), jump straight in mid-flow — no greetings and no re-introductions. When you are told to open the scene, the lines above were an earlier conversation: start this one.
- Do not mention physical actions, props, furniture, or locations.

Rules for THINK:
- First person, present tense — what is actually running through ${whose} head right now.
- Private: nobody hears it, and it may differ from what ${who} says out loud — but it is ${whose} real personality, not a secretly insecure version of it. Never invent self-doubt the character's traits and description do not support.
- One short line. No physical actions, and never addressed to anyone.`;
}

// ---------------------------------------------------------------------------------------
// The lean pipeline (2026-10-27): one actor call per Sim per round, no director, no
// reviewer, no per-round scores. Measured over three of Jaz's streams and two offline
// series (.claude/voice-pipeline-tests in the mod repo): the director earned nothing a judge
// could see on ordinary scenes, the reviewer changed 2-5% of rounds and broke the one it
// touched, and the scorer said "continue" 92% of the time. What the director DID carry was
// the beat into rounds 2-3, where the 4.6 actor message had only the transcript and "The
// scene continues"; lean carries the beat itself (buildLeanActorUserMessage).
//
// Layout: stable text first, volatile text last, so a provider's prefix cache (vLLM, OpenAI
// auto-caching, Parasail) serves [rules][identity][place][facts] on every later line of a
// scene; the now-block (date, weather, postures) moves to the head of the USER message.
// ---------------------------------------------------------------------------------------

/**
 * The Sim's own <CHARACTER_IN_INTERACTION> block out of the rendered participants, matched
 * by its header line (formatSentientSim writes `<name> is a <gender> <age>.`), never by a
 * mention inside another Sim's block. Empty when the Sim has none.
 */
export function ownCharacterBlock(name: string, participants: string): string {
  const blockPattern = /<CHARACTER_IN_INTERACTION>\s*([\s\S]*?)\s*<\/CHARACTER_IN_INTERACTION>/g;
  let match = blockPattern.exec(participants);
  while (match) {
    const firstLine = match[1].split('\n')[0].trim();
    if (firstLine.startsWith(`${name} is `) || firstLine === name) {
      return `<CHARACTER_IN_INTERACTION>\n${match[1].trim()}\n</CHARACTER_IN_INTERACTION>`;
    }
    match = blockPattern.exec(participants);
  }
  return '';
}

export type LeanActorSystemPromptContext = {
  simName: string;
  // The Sim's own <CHARACTER_IN_INTERACTION> block (ownCharacterBlock), or empty
  characterBlock: string;
  // <LOCATION>...</LOCATION>, or empty
  locationBlock: string;
  // The Sim's own <KNOWN_FACTS> block, computed on round 1 and reused on every later round
  factsBlock?: string;
  // Player-facing only: the live <STATUS>/<TODAYS_PLAN> block. Volatile, so it goes last.
  statusBlock?: string;
  playerFacing?: boolean;
  monologueOnly: boolean;
  // Name-free rules: see SpeechRuleOptions.simName
  nameFreeRules?: boolean;
};

export function buildLeanActorSystemPrompt(context: LeanActorSystemPromptContext): string {
  const { simName, characterBlock, locationBlock, factsBlock, statusBlock, playerFacing, monologueOnly } = context;
  const rules = speechRules(speechRuleKind(playerFacing, monologueOnly), {
    simName: context.nameFreeRules ? undefined : simName,
    lean: true,
  });
  const identity = [`You are ${simName}.`, characterBlock.trim()]
    .filter((part) => part.length > 0)
    .join('\n\n');
  const facts = factsBlock
    ? `${factsBlock}
These facts are what the game records about you right now. Where your character description disagrees with them, the facts are right.`
    : '';
  const status =
    playerFacing && statusBlock
      ? `${statusBlock}
This is what you want and need right now, as the game records it. When asked what you want, answer from it.`
      : '';
  return [rules, identity, locationBlock.trim(), facts, status].filter((part) => part.length > 0).join('\n\n');
}

export type LeanActorUserMessageContext = {
  // <DATE>, <SEASON>, <WEATHER> and the postures line, newline-joined; may be empty
  nowBlock: string;
  // "Previously in this scene:\n...\n\n" as the 4.6 pipeline builds it, or empty
  previouslyBlock: string;
  // This Sim's beat for this round, already framed (opener, valence, deception split on
  // round 1; "This scene: ..." plus the continuation line on rounds 2+)
  beat: string;
  // This round's earlier lines, "Speaker: text" per line, or empty
  conversationSoFar: string;
  // The Sim this call plays
  simName: string;
};

// Closes the message with whose turn it is: the system prompt names the Sim once, and a
// transcript and beat that are all about the other Sim pulled Haiku into speaking as them.
export function leanTurnLine(simName: string): string {
  return `Now respond as ${simName}.`;
}

export function buildLeanActorUserMessage(context: LeanActorUserMessageContext): string {
  const { nowBlock, previouslyBlock, beat, conversationSoFar, simName } = context;
  const now = nowBlock.trim();
  return `${now ? `${now}\n\n` : ''}${previouslyBlock}${beat}${
    conversationSoFar ? `\n\nThe conversation so far:\n${conversationSoFar}` : ''
  }\n\n${leanTurnLine(simName)}`;
}

// The two opener sentences the 4.6 beat carries on round 1 (AIService frames them); a beat
// carried into round 2+ must not tell the actor to open the scene again.
const OPENER_SENTENCES = [
  ' Open the scene: the characters are just starting this conversation — the first line begins it. The lines above were an earlier conversation, not part of this one.',
  ' Open the scene: the characters are just starting this conversation — the first line begins it, nothing was said before.',
];

export function stripOpener(beat: string): string {
  return OPENER_SENTENCES.reduce((text, sentence) => text.split(sentence).join(''), beat).trim();
}

export const LEAN_CONTINUATION_LINE =
  'The scene continues. Pick up the conversation exactly where it left off and move it forward — do not repeat or rephrase anything already said.';

// Rounds 2+ of a lean scene: the Sim's own round-1 beat (their side of a deception, their
// valence clause), opener removed, then the continuation instruction
export function carriedBeat(roundOneBeat: string): string {
  return `This scene: ${stripOpener(roundOneBeat)}\n\n${LEAN_CONTINUATION_LINE}`;
}

export type SceneReviewPromptContext = {
  simNames: string[];
  performerNames: string[];
  // True when a player line is being replied to, which the reviewer must never return.
  // Kept separate from the speaker name because the player's configured speaker name can
  // be empty, and the branch has always turned on whether a line exists, not on its label.
  hasPlayerLine: boolean;
  playerLineSpeaker?: string;
  // performerNames rendered as "Alice and Bob" by the caller's list formatter
  performerNamesList: string;
  // Fix D (Phase 3.1): each performer's own <KNOWN_FACTS> block, keyed by speaker name,
  // the same text their actor prompt carried. Live 2026-09-03 the facts sat one stage
  // upstream of the reviewer, so "I live with my parents, Travis and Ariel" (Travis is
  // her father, Ariel her sister) and "I'm seeing someone" (no partner on record) both
  // passed review untouched. Absent or empty, the prompt is byte-identical to before.
  factsBySim?: Map<string, string>;
  // The performers who may speak; absent, every performer does
  speakerNames?: string[];
};

export function buildSceneReviewSystemPrompt(context: SceneReviewPromptContext): string {
  const { simNames, hasPlayerLine, playerLineSpeaker, performerNamesList, factsBySim } = context;
  // Two speakers or more must each keep their turn; a lone speaker (the others silent) is
  // not a collapsed scene
  const speakerCount = (context.speakerNames ?? context.performerNames).length;
  const shapeRule =
    speakerCount >= 2
      ? '- Both characters must speak — never collapse the scene to a single line\n- Keep it to two to four lines total, each one short'
      : '- Keep it to one to three lines total, each one short';

  // A reply to the player is answered at whatever length the answer needs; a dodge is the
  // defect there, not the length. Sim-to-sim banter keeps the trim.
  const lengthRule = hasPlayerLine
    ? `- Dodges the question asked — answers a direct question with a question, "that's not the point", or a bare "I don't know" — repair it into a plain answer in the actor's voice, at whatever length the answer needs`
    : '- Runs long — cut a rambling line down to the sentence that carries the conversation';
  const factsBlocks = [...(factsBySim ?? [])]
    .filter(([, facts]) => Boolean(facts))
    .map(([name, facts]) => facts.replace('<KNOWN_FACTS>', `<KNOWN_FACTS speaker="${name}">`));
  // First cut (2026-09-04, gpt-4.1-mini): facts prepended plus one bullet in the rewrite
  // list. The live battery then aired "I focus on fitness coaching" under a facts block
  // saying "you have no job" and "Mackenzie and Travis" as siblings under "Travis: your
  // parent". The facts now sit right before the answer format as a named check that
  // outranks the exactly-as-written default, and the bullet stays as the cross-reference.
  const factsRule =
    factsBlocks.length > 0
      ? `- Contradicts the speaker's own <KNOWN_FACTS> (the fact check below) — a relative in the wrong role, a partner, job, age, or family member the record denies. Repair the claim and keep the rest of the line\n`
      : '';
  const factsCheck =
    factsBlocks.length > 0
      ? `Fact check, before anything else. What the game records about each speaker:
${factsBlocks.join('\n\n')}

Read every delivered line against its speaker's facts. A claim the facts deny — a parent or child called a sibling, a sibling called a parent, a job when the record says there is none, a partner when the record says single, an age the record contradicts, a relative the record does not have — is the actor's mistake, never a performance choice, and the default to return lines exactly as written does not protect it. Repair just that claim to match the facts, in the actor's own voice and at the same length, and keep the rest of the line.

Check a line only against ITS OWN speaker's facts. Another character's facts are that character's record, not the speaker's knowledge: never use them to judge or rewrite what the speaker says about that character. A repair removes or corrects the wrong claim; it never adds a name, job, title or detail the line did not already contain.

`
      : '';

  return `You are the director of a show starring sentient Sims. You are reviewing the newest lines of a scene between ${simNames.join(' and ')} before they go to air. The scene was performed in a specific genre and tone — comedy, thriller, tragedy, romance, whatever the delivered lines are playing in. Infer that register from the lines and preserve it. What matters most is that the scene reads as one continuous, coherent conversation: every line follows naturally from the line before it.

You are an editor, not a writer. Do NOT continue the conversation, do NOT reply to the delivered lines, and do NOT add new lines — your output is the delivered lines themselves, passed through or repaired. Any scene direction in the user message (such as an instruction to continue the scene or move the conversation forward) was addressed to the actors, and they have already performed it — it is context for you, not a task. Your default is to return them EXACTLY as written, in the same order. Jokes, jabs, verbal tics, hesitations, plain replies, and slang are performance choices — they stay. A line does not need to be clever or quotable to be kept. Only rewrite a line if it:
- Does not connect to the line before it — ignores a direct question, changes the subject for no reason, or is a standalone quip instead of a reply
- Mentions physical actions, props, furniture, or locations not already established in the scene
- References invented shared history or past events
- Breaks the genre and tone the rest of the scene is playing in
- Repeats or rephrases something already said, contradicts another line, or trails off mid-sentence
- Greets or re-introduces a character when the conversation is already underway
${lengthRule}
${factsRule}When you do rewrite, change only what is broken and keep the actor's intent and voice.

${factsCheck}Respond with the final scene as one line per row in exactly this format, nothing else:
<character name>: <the words they say>
(You may keep the leading numbers or drop them; the count and order must match the delivered lines.)

- Every line is a bare subtitle: no quotation marks, no parentheses, no stage directions, no commentary
${
  hasPlayerLine
    ? `- ${playerLineSpeaker}'s line was already spoken and is there only as the line being replied to — never return it\n- Return only ${performerNamesList}'s delivered lines, at the length they were delivered — never shorten a full answer`
    : shapeRule
}
- Return exactly the delivered lines, kept or repaired — never lines from "Previously in this scene", and never new lines of your own`;
}

// The standalone review used by runDirectorReview, a different and older prompt from the
// numbered-lines review above.
export const DIRECTOR_REVIEW_SYSTEM_PROMPT = `You are a director reviewing a short generated scene from The Sims. Fix any issues and return only the corrected text — no commentary, no labels, no extra formatting.

Fix these issues if present:
- Remove invented physical actions, props, furniture, or locations not already established in the scene
- Remove references to invented shared history or past events ("that time we...", "remember when...", specific past anecdotes)
- Remove overly cinematic, melodramatic, or poetic language — keep it grounded and everyday
- Replace physical action beats with delivery notes (how a character sounds or feels) if applicable, or remove them entirely and leave pure dialogue
- Remove trailing incomplete sentences
- Put each character's line on its own line
Never cut the scene down to a single line when multiple characters speak — preserve the back-and-forth between them.
Only change a line when it violates one of the rules above. Otherwise keep the exact wording and character voice — puns, verbal tics, hesitations, and slang are performance choices, not mistakes.
If the scene is already good, return it unchanged.`;

export type SceneSaliencePromptContext = {
  // One entry per character being scored, in the order they should appear in the JSON
  names: string[];
  // A reply to the player (chat window, voice, conscience, Twitch): the scorer also says
  // whether the character has said their piece, which is what closes the conversation
  // thread. "unfinished"/"continue" cannot do it: a conversation with a questioner who
  // may always ask again reads as open on every beat (first live run, 2026-09-21: five
  // conversations, fifteen replies, none closed).
  playerFacing?: { speaker: string };
};

export function buildSceneSalienceSystemPrompt(context: SceneSaliencePromptContext): string {
  const { names, playerFacing } = context;
  const doneRule = playerFacing
    ? `\n- "done": true if that character has said their piece to ${playerFacing.speaker} and would naturally let this conversation end here — they stated a decision, wrapped up, said goodbye, or turned back to what they were doing; false while they are plainly still mid-conversation with ${playerFacing.speaker}.`
    : '';
  const doneField = playerFacing ? ', "done": <true|false>' : '';

  return `You are scoring the scene that just played, for each of these characters: ${names.join(', ')}.
Give every character two integer ratings from 1 to 10:
- "memory": how memorable this scene is for that character. 1 means mundane and forgettable (routine chores, small talk), 10 means life-changing (a breakup, a birth, a betrayal).
- "action": how strongly this scene leaves that character wanting to CHANGE what they are doing right now — do something more, something less, or something different from their current course. 1-3 means content to carry on as they are, 4-6 means an itch but nothing urgent, 7 and up means they genuinely want to act on something now.
- "action_reason": one short line, in that character's voice, naming what they want to do or change (or why they are content).
- "unfinished": true if, for that character, the exchange is clearly still open — a question they were asked hangs unanswered, they were cut off mid-thought, or the last line plainly invites a reply; false when the beat landed and could end here.
- "continue": 1-10, how strongly the scene itself wants ANOTHER round of dialogue right now (not later). 1-3: it can end here; 7+: stopping now would leave the audience hanging.${doneRule}
Judge each character from their own point of view; their private thoughts are the strongest signal.
Respond with ONLY a JSON object in exactly this shape, covering every character, nothing else:
{${names.map((name) => `"${name}": {"memory": <1-10>, "action": <1-10>, "action_reason": "...", "unfinished": <true|false>, "continue": <1-10>${doneField}}`).join(', ')}}`;
}

// J6 (the 2026-09-04 playtest handoff, cause 6): a content-free social mixer gives the model nothing
// to joke or gossip about, so it invents a shared past ("Remember that time you got stuck
// in the snowbank" - stored as an interaction memory and replayed into 137 later prompt
// lines). The pre-action for these interactions carries one line telling the actors where
// the material may come from. Matched on the game's interaction name, case-insensitively.
export const CONTENT_FREE_SOCIAL_PATTERNS: RegExp[] = [
  /insidejoke/i,
  /tell_?funny_?story/i,
  /tell_?story/i,
  /gossip/i,
  /reminisce/i,
  /tell_?joke/i,
  /share_?secret/i,
];

export const CONTENT_FREE_SOCIAL_HINT =
  'The joke, story or gossip must be about something in this scene or the memories shown, or stay unspecific. Never invent a shared past event.';

export function contentFreeSocialHint(interactionName?: string): string | undefined {
  if (!interactionName) {
    return undefined;
  }
  return CONTENT_FREE_SOCIAL_PATTERNS.some((pattern) => pattern.test(interactionName))
    ? CONTENT_FREE_SOCIAL_HINT
    : undefined;
}

// The pre-action as the prompt shows it, with the J6 hint appended when the interaction
// is one of the content-free socials. Anything else is returned byte-identical.
export function withContentFreeHint(
  formattedPreAction: string | undefined,
  interactionName?: string,
): string | undefined {
  const hint = contentFreeSocialHint(interactionName);
  if (!hint || !formattedPreAction) {
    return formattedPreAction;
  }
  return `${formattedPreAction} ${hint}`;
}

// A spoken lie only works if the listener never hears the stage direction. Live 2026-09-30:
// LieAboutCareer sent "Elliot is telling Paolo a false story about their career" to BOTH
// actors, so Paolo called the bluff ("I know you're not a CEO") before Elliot had told any
// story, and Elliot, given no material, said only "Everything's going great at work". The
// target now sees the beat as they would ("Elliot is telling Paolo how his career is going");
// the liar sees the truth plus a nudge to actually tell the lie. Only verbal deceptions are
// here: a jump scare or a hand buzzer is something the target experiences, so it hides nothing.
export type DeceptionFraming = {
  // The beat as the target experiences it, instead of the true pre-action
  targetView: string;
  // Appended to the liar's (true) pre-action
  liarHint: string;
};

const DECEPTION_SOCIALS: Array<{ pattern: RegExp; framing: (liar: string, target: string) => DeceptionFraming }> = [
  {
    pattern: /LieAboutCareer/i,
    framing: (liar, target) => ({
      targetView: `${liar} is telling ${target} how work is going.`,
      liarHint: `${liar} makes the story up out loud: a specific, impressive claim about their job that ${target} could believe. ${target} has not heard it before and does not know it is false.`,
    }),
  },
  {
    pattern: /GiveFakeBadNews/i,
    framing: (liar, target) => ({
      targetView: `${liar} is telling ${target} some bad news.`,
      liarHint: `${liar} invents the bad news on the spot and says it plainly, as if it were true. ${target} does not know it is made up.`,
    }),
  },
  {
    pattern: /InstillWithFalseConfidence/i,
    framing: (liar, target) => ({
      targetView: `${liar} is encouraging ${target}.`,
      liarHint: `${liar} does not mean it: the encouragement is mischief, meant to send ${target} off overconfident. ${target} takes it at face value.`,
    }),
  },
  {
    pattern: /InviteToFakeParty/i,
    framing: (liar, target) => ({
      targetView: `${liar} is inviting ${target} to a party.`,
      liarHint: `There is no party: ${liar} is pranking ${target}, and ${target} does not know.`,
    }),
  },
];

export function deceptionFraming(
  interactionName: string | undefined,
  liar: string,
  target: string,
): DeceptionFraming | undefined {
  if (!interactionName) {
    return undefined;
  }
  const match = DECEPTION_SOCIALS.find(({ pattern }) => pattern.test(interactionName));
  return match?.framing(liar, target);
}

// V-5b's opener fired only when "Previously in this scene" was empty. It rarely is: it holds
// the last few rows at this location, whoever was in them, so a new pair right after another
// conversation was told to jump in mid-flow and skipped the first half of theirs (live
// 2026-09-30: Elliot's first line to Paolo followed his conversation with Lillie, as if Paolo
// had been in it). The pair is underway only when some beat above carries dialogue from
// every performer; a beat is the run of lines between two non-dialogue lines (a pre-action,
// an interaction header).
export function performersAlreadyTalking(previously: string, performerNames: string[]): boolean {
  if (!previously || performerNames.length === 0) {
    return false;
  }
  const beats: Set<string>[] = [new Set()];
  previously.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      return;
    }
    const speaker = performerNames.find((name) => line.startsWith(`${name}:`));
    if (speaker) {
      beats[beats.length - 1].add(speaker);
    } else if (!/^[^:]{1,60}:\s/.test(line) && beats[beats.length - 1].size > 0) {
      // A non-dialogue line closes the beat; another speaker's dialogue does not
      beats.push(new Set());
    }
  });
  return beats.some((beat) => performerNames.every((name) => beat.has(name)));
}
