// A Sim's own status as prompts render it. Core: the player-facing reply carries it
// (AIService.runDirectedGeneration), and so does the autonomy tick (re-exported from
// formatCognitionPrompt). Moved here for release 4.5 so a build without autonomy keeps it.
import { SimStateEntry } from '../models/SimStateReport';

function pretty(text: string): string {
  return text.replace(/_/g, ' ');
}

// The day's plan as the prompt sees it: goal labels + the persona stage direction.
// The loadout is deliberately NOT rendered — the OFFERED lists are already narrowed to
// it, and naming the mechanism invites meta-reasoning about "allowed actions".
export type TodaysPlanBlock = {
  goals: { label: string; action_keys?: string[]; reachable?: boolean }[];
  persona?: string;
};

// G-5: a goal reads with the verbs that serve it, so "serve a goal" is a concrete pick
// and an unreachable goal is named as such instead of silently ignored
export function describePlanGoal(goal: { label: string; action_keys?: string[]; reachable?: boolean }): string {
  if (goal.action_keys && goal.action_keys.length > 0) {
    return `${goal.label} [serve it with: ${goal.action_keys.map(pretty).join(', ')}]`;
  }
  if (goal.reachable === false) {
    return `${goal.label} [no action in your vocabulary serves this yet]`;
  }
  return goal.label;
}

// The Sim's own status as the tick prompt renders it: <STATUS> (mood, needs worst-first,
// live wants, feelings, next aspiration step, careers), <TODAYS_PLAN>, and what they are
// doing right now. One section per block so the tick prompt joins them exactly as before.
// Shared with the player-facing reply prompt (AIService.runDirectedGeneration): a Sim asked
// "what do you want" answers from the same ground truth the tick deliberates over —
// measured 09-19..09-21, replies without it were "I don't know" nine times out of ten
// direct questions, because the chat prompt carried no wants at all.
export function formatSelfStatusSections(entry: SimStateEntry, plan?: TodaysPlanBlock): string[] {
  const sections: string[] = [];
  const self = entry.self;
  if (self) {
    const selfLines: string[] = ['<STATUS>'];
    if (self.mood) {
      selfLines.push(`Mood: ${pretty(self.mood)}`);
    }
    if (self.needs && Object.keys(self.needs).length > 0) {
      // Worst-first with the negatives flagged: fed in arbitrary order the model kept
      // topping up healthy needs (brush_teeth at hygiene 70) while fun sat at -47 and
      // social at -100 (observed live)
      const needs = Object.entries(self.needs)
        .sort(([, a], [, b]) => a - b)
        .map(([need, value]) => `${pretty(need)} ${value}${value <= -75 ? ' (DESPERATE)' : value < 0 ? ' (low)' : ''}`)
        .join(', ');
      selfLines.push(`Needs, WORST FIRST (-100 to 100): ${needs}`);
    }
    if (self.wants?.length) {
      selfLines.push(`Current wants: ${self.wants.map(pretty).join(', ')}`);
    }
    if (self.buffs?.length) {
      selfLines.push(`Feelings: ${self.buffs.map(pretty).join(', ')}`);
    }
    if (self.next_objective) {
      const objective = self.next_objective;
      selfLines.push(
        `Next life goal step: ${pretty(objective.objective ?? '')}${objective.test ? ` (${objective.test}${objective.threshold !== undefined ? ` ${objective.threshold}` : ''})` : ''}`,
      );
    }
    (self.careers ?? []).forEach((career) => {
      selfLines.push(
        `Career: ${pretty(career.career ?? '')} level ${career.level ?? '?'}${career.at_work ? ' (at work now)' : ''}`,
      );
    });
    selfLines.push('</STATUS>');
    sections.push(selfLines.join('\n'));
  }

  if (plan && (plan.goals.length > 0 || plan.persona)) {
    const planLines: string[] = ['<TODAYS_PLAN>'];
    if (plan.persona) {
      planLines.push(`Who I want to be today: ${plan.persona}`);
    }
    if (plan.goals.length > 0) {
      planLines.push(`Today's goals: ${plan.goals.map(describePlanGoal).join('; ')}.`);
    }
    planLines.push('</TODAYS_PLAN>');
    sections.push(planLines.join('\n'));
  }

  const activity = entry.activity;
  if (activity) {
    const doing = activity.running ? `You are currently: ${pretty(activity.running)}.` : 'You are idle right now.';
    const queued = activity.queue?.length ? ` Queued next: ${activity.queue.map(pretty).join(', ')}.` : '';
    sections.push(`${doing}${queued}`);
  }
  return sections;
}

// The same blocks as one string, for a prompt that embeds them (the player-facing reply)
export function formatSelfStatus(entry: SimStateEntry, plan?: TodaysPlanBlock): string {
  return formatSelfStatusSections(entry, plan).join('\n');
}
