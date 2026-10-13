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

// A lot description is stored once and reused in every scene set there. The first version
// asked for "third person" and "what it feels like to be there" over the lot's live
// situations and wrote "She stands at 13 Acacia Avenue ... as she waits to be acknowledged"
// into the save for good (2026-10-12). This card prompt, on facts that carry no moment (see
// util/lotDescription.ts), passed 36 of 36 blind-judged samples on the production model and
// 24 of 24 on an 8B model; the old one passed 17 of 36 and 0 of 24. The negative example is
// the real row; it is kept because the trial's variants without it were not tested.
export const LOCATION_DESCRIPTION_SYSTEM_PROMPT = `You write the permanent reference card for one place in The Sims 4. It is stored once and reused as background in every story set there, so it describes the place, not a moment.
Write 2-3 sentences of plain prose in the present tense.
Sentence 1: what kind of place this is, using its name and its kind exactly as given.
Sentences 2-3: what the place is like to spend time in, grounded in what it is furnished for. Give two concrete physical details rather than any statement about mood or "atmosphere".
Never:
- put a person in the text: no she/he/you, no visitor, guest, someone or occupant doing anything.
- describe anything happening now: arriving, leaving, greetings, waiting.
- call a venue a residence or a home. A gym is a gym; a park is a park.
- list fixtures as an inventory (no "toilets and a shower").
- invent rooms, owners, history, a town or a view that the facts do not give.
Bad example, do not write like this: "She stands at 13 Acacia Avenue, a residence that appears to be a hub of creative activity... As she waits to be acknowledged by the home's occupant, the atmosphere feels slightly awkward."
Reply with the description text only.`;
