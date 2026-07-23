import { PerceivedObject, PerceivedSim, PerceptionSnapshot } from '../models/PerceptionSnapshot';

function pretty(text: string): string {
  return text.replace(/_/g, ' ');
}

// Tuning nouns that read badly as object labels ("a sit")
const LABEL_OVERRIDES: Record<string, string> = { sit: 'seat' };

// 'object_fridgeLOW_01' -> 'fridge'; falls back to the cleaned tuning name when the
// leading-lowercase heuristic finds nothing (e.g. 'TV_...')
function objectLabel(object: PerceivedObject): string {
  const cleaned = (object.name ?? '').replace(/^object_/, '').replace(/_?\d+$/, '');
  const word = /^[a-z]+/.exec(cleaned)?.[0];
  if (word && word.length > 2) {
    return LABEL_OVERRIDES[word] ?? word;
  }
  return cleaned ? pretty(cleaned) : 'an object';
}

function describeSim(sim: PerceivedSim): string {
  const name = sim.name ?? 'someone';
  const activity = sim.doing ? pretty(sim.doing) : 'nearby';
  const distance = sim.distance !== undefined ? `, ${Math.round(sim.distance)}m away` : '';
  return `${name} (${activity}${distance})`;
}

function describeObject(object: PerceivedObject): string {
  const actions = object.action_keys.map(pretty).join(' or ');
  const distance = object.distance !== undefined ? `, ${Math.round(object.distance)}m away` : '';
  return `a ${objectLabel(object)} (could ${actions}${distance})`;
}

// Renders a mod perception snapshot as the <PERCEPTION> prose block cognition prompts
// consume. Kept as a pure function; PromptRequestBuilderService wires it into tick
// prompts when the cognition loop lands (Block 9).
export function formatPerception(snapshot: PerceptionSnapshot): string {
  const lines: string[] = ['<PERCEPTION>'];

  lines.push(snapshot.location?.outdoors ? 'You are outdoors.' : 'You are indoors.');

  const feelings: string[] = [];
  if (snapshot.ambient?.sim_mood) {
    feelings.push(`You are feeling ${pretty(snapshot.ambient.sim_mood)}.`);
  }
  const motivesLow = snapshot.ambient?.motives_low ?? [];
  if (motivesLow.length > 0) {
    feelings.push(
      `Your ${motivesLow.map(pretty).join(' and ')} ${motivesLow.length === 1 ? 'is' : 'are'} running low.`,
    );
  }
  if (feelings.length > 0) {
    lines.push(feelings.join(' '));
  }

  const visibleSims = snapshot.sims.filter((sim) => sim.tier === 'same_room');
  const visible = [...visibleSims.map(describeSim), ...snapshot.objects.map(describeObject)];
  if (visible.length > 0) {
    lines.push(`You can see: ${visible.join('; ')}.`);
  } else {
    lines.push('You see nothing and no one of note here.');
  }

  const audibleCount = snapshot.sims.filter((sim) => sim.tier === 'audible').length;
  if (audibleCount === 1) {
    lines.push('You hear someone in another room.');
  } else if (audibleCount > 1) {
    lines.push(`You hear ${audibleCount} people elsewhere in the building.`);
  }

  lines.push('</PERCEPTION>');
  return lines.join('\n');
}
