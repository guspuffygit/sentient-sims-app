// Stage: consolidation_reflect — the diary that closes a stretch of the day.
//
// With the autonomy tier, the sleep boundary's call also plans tomorrow
// (consolidation_plan, pipeline/prompts/plan.ts) around the same diary rules; without it
// the reflection is the diary alone. Moved verbatim from AIService.runSceneReflection.

export type ReflectionPromptContext = {
  // "You are Alice. " — empty when the reflection has no point-of-view Sim
  identity: string;
  // What kind of boundary closed this stretch of the day
  boundary?: 'sleep' | 'travel';
  locationName: string;
  // The other Sims present, rendered as "Bob and Carol"; empty when the Sim was alone
  namesList: string;
  hasOthers: boolean;
};

// The diary half of the prompt, shared by the diary-only and the diary-plus-plan shapes.
export function buildDiaryRules(context: ReflectionPromptContext): string {
  const othersLine = context.hasOthers
    ? `Mention each of the people you spent this time with — ${context.namesList} — what passed between you and how they left you feeling.\n`
    : '';
  return `Write a short diary entry — two or three sentences in your own voice: first person, past tense, plain prose. No headers, no labels, no lists, and no greeting like "Dear Diary" — just the entry itself. Never refer to yourself in the third person.
Sum up what happened and how you feel about it now.
${othersLine}Keep it concise and grounded. Do not invent events that are not in the notes below.`;
}

export function buildReflectionFraming(context: ReflectionPromptContext): string {
  const { boundary, locationName } = context;
  if (boundary === 'sleep') {
    return `The day is winding down at ${locationName} and you're writing in your diary before sleep.`;
  }
  if (boundary === 'travel') {
    return `You've just left ${locationName} and are writing in your diary about your time there.`;
  }
  return `A stretch of your day at ${locationName} has ended and you're writing it down in your diary.`;
}

export function buildDiaryOnlySystemPrompt(context: ReflectionPromptContext): string {
  return `${context.identity}${buildReflectionFraming(context)}
${buildDiaryRules(context)}`;
}
