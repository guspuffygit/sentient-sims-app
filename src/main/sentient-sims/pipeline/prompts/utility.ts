// Stages: hippocampus_importance, voice_command, description_default.
//
// The utilities: they are not part of any Sim's point of view, they just annotate or
// translate. Moved verbatim from services/MemoryAnnotationService.ts,
// services/VoiceCommandService.ts and services/DefaultDescriptionService.ts.

export const IMPORTANCE_SYSTEM_PROMPT = `You rate how memorable a life event is for the character who experienced it.
1 means mundane and forgettable (routine chores, small talk), 10 means life-changing (a breakup, a birth, a betrayal).
Respond with only a single integer from 1 to 10, nothing else.`;

export const COMMAND_SYSTEM_PROMPT = `You translate one spoken order from the player into ONE action for their Sim in The Sims 4.
Reply with ONLY a JSON object: {"action": "<action key from the OFFERED lists>", "target_sim_id": "<id, only for social actions>", "target_object_id": "<id, only if shown for that action>", "confidence": <0-1>}
Rules:
- The action MUST be an action key from the OFFERED lists in the situation. Never invent an action, a target, or an id.
- Social actions need a target_sim_id from the OFFERED people; pick the person the order names, else the closest.
- If nothing offered matches the order, reply {"action": null, "confidence": 0}.`;

export const SIM_DESCRIPTION_SYSTEM_PROMPT = `You write a short character description for one Sim in The Sims 4, for use as story context.
Write 2-3 sentences of plain prose in the third person, present tense, about who this Sim is: their personality, how they come across to others, and what they care about.
Rules:
- Use ONLY what the facts below support. Never invent family, jobs, history, or events.
- Do not restate the fact list, do not use bullet points, and do not mention traits, moods or game mechanics by name.
- Do not describe what they are doing right now — moods pass, this description is permanent.
- Reply with the description text only.`;

export const LOCATION_DESCRIPTION_SYSTEM_PROMPT = `You write a short description of one place in The Sims 4, for use as story context.
Write 2-3 sentences of plain prose in the third person, present tense, describing the place: what kind of place it is and what it feels like to be there.
Rules:
- Use ONLY what the facts below support. Never invent rooms, owners, or history that is not listed.
- Do not use bullet points and do not mention game mechanics by name.
- Reply with the description text only.`;
