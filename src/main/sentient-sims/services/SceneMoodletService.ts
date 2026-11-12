import log from 'electron-log';
import { DialogueLine } from '../formatter/PromptFormatter';
import { AIActionType } from '../models/AIActionType';
import { ModAddBuff, ModWebsocketMessageType } from '../models/ModWebsocketMessage';
import { StageId } from '../pipeline/stages';
import { sendModNotification } from '../websocketServer';
import { ApiContext } from './ApiContext';
import { SceneCastMember, SceneClosed } from './ScenePlaybackRegistry';

/**
 * Sentient Moodlets for spoken conversations.
 *
 * When a scene closes, one call judges what it left on each sim in it: which of the
 * game's emotions, how strongly (+1 / +2 / +3, the mod's three buff tiers) and for
 * how long, with a sentence the moodlet tooltip shows. Small talk leaves nothing;
 * a divorce leaves +3 sad for most of a day. Each verdict goes to the mod as an
 * `add_buff` message. Best-effort throughout: a failed or unparseable appraisal
 * leaves no moodlet and never troubles the scene that produced it.
 */

// The game's moods the mod ships a Sentient buff for (ss_buffs.py), one per tier
export const MOODLET_EMOTIONS = [
  'angry',
  'bored',
  'confident',
  'dazed',
  'embarrassed',
  'energized',
  'flirty',
  'focused',
  'happy',
  'inspired',
  'playful',
  'sad',
  'scared',
  'stressed',
  'uncomfortable',
] as const;

export type MoodletEmotion = (typeof MOODLET_EMOTIONS)[number];
export type MoodletTier = 1 | 2 | 3;

// Models reach for the feeling's own word ("frustrated", live 2026-09-22, dropped as
// unknown and the moodlet with it). The nearest of the game's moods stands in.
export const EMOTION_SYNONYMS: Record<string, MoodletEmotion> = {
  frustrated: 'angry',
  annoyed: 'angry',
  irritated: 'angry',
  furious: 'angry',
  mad: 'angry',
  resentful: 'angry',
  bitter: 'angry',
  anxious: 'stressed',
  worried: 'stressed',
  nervous: 'stressed',
  tense: 'stressed',
  overwhelmed: 'stressed',
  pressured: 'stressed',
  concerned: 'stressed',
  troubled: 'stressed',
  uncertain: 'stressed',
  upset: 'sad',
  hurt: 'sad',
  lonely: 'sad',
  disappointed: 'sad',
  grieving: 'sad',
  heartbroken: 'sad',
  melancholy: 'sad',
  gloomy: 'sad',
  dejected: 'sad',
  discouraged: 'sad',
  afraid: 'scared',
  fearful: 'scared',
  terrified: 'scared',
  frightened: 'scared',
  ashamed: 'embarrassed',
  humiliated: 'embarrassed',
  mortified: 'embarrassed',
  awkward: 'uncomfortable',
  uneasy: 'uncomfortable',
  guilty: 'uncomfortable',
  disgusted: 'uncomfortable',
  content: 'happy',
  grateful: 'happy',
  relieved: 'happy',
  hopeful: 'happy',
  joyful: 'happy',
  cheerful: 'happy',
  pleased: 'happy',
  loved: 'happy',
  touched: 'happy',
  moved: 'happy',
  comforted: 'happy',
  supported: 'happy',
  proud: 'confident',
  reassured: 'confident',
  determined: 'focused',
  motivated: 'focused',
  resolved: 'focused',
  excited: 'energized',
  thrilled: 'energized',
  amused: 'playful',
  giddy: 'playful',
  romantic: 'flirty',
  smitten: 'flirty',
  curious: 'inspired',
  creative: 'inspired',
  confused: 'dazed',
  numb: 'dazed',
  shocked: 'dazed',
  stunned: 'dazed',
  indifferent: 'bored',
  restless: 'bored',
};

export function resolveEmotion(raw: string): MoodletEmotion | undefined {
  const word = raw.trim().toLowerCase();
  if ((MOODLET_EMOTIONS as readonly string[]).includes(word)) {
    return word as MoodletEmotion;
  }
  return EMOTION_SYNONYMS[word];
}

// Fewer heard lines than this is a greeting, not a conversation
export const MIN_HEARD_LINES = 4;
// What the model may answer per tier, in hours; the prompt asks for the middle of each
export const TIER_HOUR_BANDS: Record<MoodletTier, [number, number]> = { 1: [0.5, 4], 2: [3, 12], 3: [8, 24] };
export const TIER_DEFAULT_HOURS: Record<MoodletTier, number> = { 1: 2, 2: 6, 3: 18 };
// A long conversation is judged by its most recent stretch
const MAX_LINES_IN_PROMPT = 60;

// The prompt asks for 450; a longer reason is cut at its last full sentence
export const MAX_REASON_CHARS = 500;

export type MoodletVerdict = {
  simId: string;
  name: string;
  emotion: MoodletEmotion;
  intensity: MoodletTier;
  durationMinutes: number;
  reason: string;
};

export function buildMoodletSystemPrompt(): string {
  return [
    'You judge the emotional residue a conversation leaves on each of the Sims who were in it, once it is over.',
    '',
    `Emotions, exactly one of: ${MOODLET_EMOTIONS.join(', ')} - or none.`,
    'Use only those words. If the feeling has another name, pick the closest one on the list: frustrated or annoyed is angry, anxious or worried is stressed, hurt or disappointed is sad, ashamed is embarrassed, proud is confident, relieved or grateful is happy.',
    '',
    'How much a conversation weighs:',
    '- none: small talk, pleasantries, logistics, jokes with no sting, anything forgotten by dinner. This is the common case - most conversations leave nothing.',
    '- 1 (minor, 1-3 hours): a compliment, a mild annoyance, a missed bus, a fun exchange, a small worry aired.',
    '- 2 (notable, 4-8 hours): a real argument, a heartfelt confession, embarrassment in front of others, good news about a job, a promise made.',
    '- 3 (life-altering, 12-24 hours): divorce, a death, a breakup, a proposal, a betrayal, learning of a pregnancy, a friendship ending.',
    '',
    'Rules:',
    '- Judge each listed Sim separately: the same talk can leave one of them sad and the other angry, or one moved and the other untouched.',
    '- Only the Sims listed get a verdict. Lines by anyone else are people they were talking to; a listener can be moved by what they heard.',
    '- The reason is the tooltip under the emotion: one to three short sentences, 450 characters at most, first names only. First what was said or what happened, in the past tense, then how it sits with this Sim now, in the present tense. Plain everyday words, the way a friend would tell it: no dashes, no metaphors, no "not X, it\'s Y". Say "Mortimer brought up the bills again and would not drop it. Bella keeps thinking about how small he made her feel.", not "She is talking with Mortimer Goth about finances". No quotes, no game terms, no mention of moodlets, tiers or hours.',
    '',
    'Answer with only a JSON object whose keys are the exact names given, one entry per Sim:',
    '{"Name": {"emotion": "sad", "intensity": 3, "duration_hours": 18, "reason": "..."}, "Other Name": {"emotion": "none"}}',
  ].join('\n');
}

export function buildMoodletUserText(
  cast: SceneCastMember[],
  lines: DialogueLine[],
  ending: 'finished' | 'cut_short',
): string {
  const who = cast
    .map((member) => {
      const bits = [member.name];
      if (member.traits && member.traits.length > 0) {
        bits.push(`traits: ${member.traits.join(', ')}`);
      }
      if (member.moods && member.moods.length > 0) {
        bits.push(`before the talk: ${member.moods.join(', ')}`);
      }
      return `- ${bits.join('; ')}`;
    })
    .join('\n');
  const transcript = lines
    .slice(-MAX_LINES_IN_PROMPT)
    .map((line) => `${line.speaker}: ${line.text}`)
    .join('\n');
  const how = ending === 'finished' ? 'it ran its course' : 'it was cut short when someone walked away';
  return `The Sims:\n${who}\n\nThe conversation (${how}):\n${transcript}`;
}

function clampNumber(value: unknown): number | undefined {
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || Number.isNaN(num)) {
    return undefined;
  }
  return num;
}

// Exactly one exact match wins; failing that, exactly one first-name-prefix match.
// Still ambiguous means no verdict rather than the wrong sim's (the rule the scene
// scores use, for the same reason: two sims in a household can share a first name).
function matchCast(key: string, cast: SceneCastMember[]): SceneCastMember | undefined {
  const wanted = key.trim().toLowerCase();
  let matches = cast.filter((member) => member.name.toLowerCase() === wanted);
  if (matches.length === 0) {
    matches = cast.filter((member) => member.name.toLowerCase().startsWith(`${wanted} `));
  }
  if (matches.length === 0) {
    matches = cast.filter((member) => wanted.startsWith(`${member.name.toLowerCase()} `));
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}

function fallbackReason(member: SceneCastMember, emotion: MoodletEmotion, cast: SceneCastMember[]): string {
  const others = cast.filter((other) => other.simId !== member.simId).map((other) => firstName(other.name));
  const withWhom = others.length > 0 ? ` after talking with ${others.join(' and ')}` : ' after the conversation';
  return `${firstName(member.name)} is feeling ${emotion}${withWhom}.`;
}

export function trimReason(text: string): string {
  if (text.length <= MAX_REASON_CHARS) {
    return text;
  }
  const head = text.slice(0, MAX_REASON_CHARS);
  const end = Math.max(head.lastIndexOf('.'), head.lastIndexOf('!'), head.lastIndexOf('?'));
  return end > 0 ? head.slice(0, end + 1) : head;
}

export function parseMoodletVerdicts(rawText: string, cast: SceneCastMember[]): MoodletVerdict[] {
  const verdicts: MoodletVerdict[] = [];
  const jsonMatch = /\{[\s\S]*\}/.exec(rawText);
  if (!jsonMatch) {
    return verdicts;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return verdicts;
  }
  if (!parsed || typeof parsed !== 'object') {
    return verdicts;
  }
  const seen = new Set<string>();
  Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
    const member = matchCast(key, cast);
    if (!member || seen.has(member.simId) || !value || typeof value !== 'object') {
      return;
    }
    const verdict = value as { emotion?: unknown; intensity?: unknown; duration_hours?: unknown; reason?: unknown };
    const emotion = resolveEmotion(typeof verdict.emotion === 'string' ? verdict.emotion : 'none');
    if (!emotion) {
      return;
    }
    seen.add(member.simId);
    const rawTier = clampNumber(verdict.intensity);
    const intensity = (rawTier === undefined ? 1 : Math.min(3, Math.max(1, Math.round(rawTier)))) as MoodletTier;
    const [low, high] = TIER_HOUR_BANDS[intensity];
    const rawHours = clampNumber(verdict.duration_hours);
    const hours = rawHours === undefined ? TIER_DEFAULT_HOURS[intensity] : Math.min(high, Math.max(low, rawHours));
    const reasonText = typeof verdict.reason === 'string' ? verdict.reason.trim() : '';
    const reason = reasonText ? trimReason(reasonText) : fallbackReason(member, emotion, cast);
    verdicts.push({
      simId: member.simId,
      name: member.name,
      emotion,
      intensity,
      durationMinutes: Math.round(hours * 60),
      reason,
    });
  });
  return verdicts;
}

export type MoodletSource = 'scene' | 'conversation' | 'chat';

export function toAddBuff(verdict: MoodletVerdict, sceneId: string | undefined, source: MoodletSource): ModAddBuff {
  return {
    type: ModWebsocketMessageType.ADD_BUFF,
    sim_id: verdict.simId,
    mood: verdict.emotion,
    buff_description: verdict.reason,
    intensity: verdict.intensity,
    duration_minutes: verdict.durationMinutes,
    scene_id: sceneId,
    source,
  };
}

export class SceneMoodletService {
  constructor(private readonly ctx: ApiContext) {}

  /**
   * A conversation closed: judge it and send the mod a moodlet per moved sim. A thread with
   * the player ('conversation') is judged the same way; the player's lines are the ones
   * "by anyone else" in the prompt, and only the sims are cast.
   */
  async appraise(closed: SceneClosed, source: MoodletSource = 'scene'): Promise<MoodletVerdict[]> {
    if (!this.ctx.settings.conversationMoodletsEnabled) {
      return [];
    }
    const cast = closed.cast.filter((member) => member.simId && member.name);
    if (cast.length === 0) {
      return [];
    }
    if (closed.lines.length < MIN_HEARD_LINES) {
      log.info(`[Scene Moodlets] ${closed.sceneId}: ${closed.lines.length} lines heard, too short to weigh`);
      return [];
    }
    const ending = closed.reason === 'finished' ? 'finished' : 'cut_short';
    let text: string;
    try {
      const oneShot = await this.ctx.ai.runOneShot(
        'Scene Moodlets',
        buildMoodletSystemPrompt(),
        buildMoodletUserText(cast, closed.lines, ending),
        // Room for up to three sentences per Sim, so the JSON is never cut short
        Math.min(1200, 120 + 200 * cast.length),
        undefined,
        AIActionType.BUFF,
        undefined,
        { stageId: StageId.BUFF },
      );
      text = oneShot.text;
    } catch (error) {
      log.warn(`[Scene Moodlets] ${closed.sceneId}: appraisal failed; no moodlets`, error);
      return [];
    }
    const verdicts = parseMoodletVerdicts(text, cast);
    if (verdicts.length === 0) {
      log.info(`[Scene Moodlets] ${closed.sceneId}: nothing left behind (${text.slice(0, 160).replace(/\s+/g, ' ')})`);
      return [];
    }
    verdicts.forEach((verdict) => {
      log.info(
        `[Scene Moodlets] ${verdict.name}: ${verdict.emotion} +${verdict.intensity} for ${verdict.durationMinutes} min - ${verdict.reason}`,
      );
      try {
        sendModNotification(toAddBuff(verdict, closed.sceneId, source));
      } catch (error) {
        log.warn(`[Scene Moodlets] could not send ${verdict.name}'s moodlet to the mod`, error);
      }
    });
    return verdicts;
  }
}
