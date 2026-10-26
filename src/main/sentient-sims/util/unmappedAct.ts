// The beat for a WickedWhims animation that has no mapping text: what WickedWhims itself
// says about it (the sex category and the place), so an unmapped animation still plays a
// scene, the way an unmapped interaction plays its synthesized line (synthesizePreAction).
import { getSexLocation } from '../descriptions/wwDescriptions';
import { formatListToString } from '../formatter/PromptFormatter';

// Keyed by WickedWhims' SexCategoryType; NONE (-1) and anything new read as plain sex
const ACT_BY_CATEGORY = new Map<number, string>([
  [0, 'deep in foreplay'],
  [1, 'in the middle of a handjob'],
  [2, 'in the middle of a footjob'],
  [3, 'in the middle of oral sex'],
  [4, 'having sex'],
  [5, 'having anal sex'],
  [6, 'reaching climax together'],
]);
const CLIMAX = 6;

export function describeUnmappedAct(names: string[], sexCategoryType: number, sexLocationType: number): string {
  const where = getSexLocation(sexLocationType);
  const place = where ? ` ${where}` : '';
  if (names.length === 1) {
    const act = sexCategoryType === CLIMAX ? 'reaching climax' : 'pleasuring themselves';
    return `${names[0]} is ${act}${place}.`;
  }
  const act = ACT_BY_CATEGORY.get(sexCategoryType) ?? 'having sex';
  return `${formatListToString(names)} are ${act}${place}.`;
}
