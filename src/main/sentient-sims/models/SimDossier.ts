// What the mod's ss_sim_dossier builds and POSTs to /cognition/dossier (Phase 3.1 H1).
// Ground truth about who a sim IS, as opposed to the state report's what-they-feel-now.
//
// The mod deliberately emits STRUCTURE and the game's own identifiers (family bit names,
// trait tuning names, id lists) and the app renders the words. Every field is optional:
// the mod drops a field it cannot read rather than failing the whole dossier, and an
// older mod build simply omits the ones it does not know about yet.

export type DossierPronouns = {
  raw: string;
  subjective: string;
  objective: string;
  possessive: string;
  possessive_independent: string;
  reflexive: string;
};

export type DossierRelationship = {
  sim_id: string;
  name?: string;
  has_met?: boolean;
  friendship?: number;
  romance?: number;
  bits?: string[];
};

export type SimDossier = {
  version?: number;
  sim_id: string;
  name?: string;
  age?: string;
  gender?: string;
  pronouns?: DossierPronouns;
  occult?: { types?: string[]; current?: string[] };
  is_ghost?: boolean;
  death_type?: string;
  // The game's Species name for a pet (DOG, CAT, SMALLDOG, FOX, HORSE). Not sent by any
  // mod build yet: the app learns species from the state report and accepts it here so a
  // future dossier can carry it without an app change.
  species?: string;
  // `home` is the household's home lot: lot id (the id locations are keyed by), the lot's
  // name and the world. Absent for a household with no home, and before mod builds of 2026-10-19.
  household?: {
    id?: string;
    name?: string;
    member_ids?: string[];
    home?: { lot_id?: string; name?: string; world?: string };
  };
  family?: {
    parents?: string[];
    siblings?: string[];
    children?: string[];
    grandparents?: string[];
    spouse_id?: string | null;
    fiance_id?: string | null;
    steady_ids?: string[];
  };
  // other sim id -> the game's family relationship bit name, e.g.
  // 'family_Target_IsSonOrDaughterOf_Actor'. The only place step/in-law/cousin
  // distinctions exist at all.
  family_bits?: Record<string, string>;
  traits?: string[];
  fears?: string[];
  reward_traits?: string[];
  // Childhood phases and a child's confidence level (trait_type PHASE); mod builds from
  // 2026-10-13 send them, older ones omit the field
  phases?: string[];
  likes?: string[];
  dislikes?: string[];
  aspiration?: { track?: string; aspiration?: string; objective?: string };
  // `career` is the career's tuning name (career_Adult_Culinary), `track` the branch track
  // the sim is on (Athletic_Track3_BodyBuilder; Athletic_Track1 before the branch choice;
  // mod builds from 2026-10-13) and `level` the user-facing level. `title` is the job title
  // the game shows for that level (Line Cook, Supreme Villain), read off EA's string
  // tables by the mod (builds from 2026-10-31; absent for NPC and quest careers, and for
  // the first minutes of a session before the table has loaded). Older builds send no
  // title, and the facts line falls back to "the Culinary career, level 4": a sim handed a
  // bare "Culinary (level 4)" once invented a bartending job.
  careers?: {
    career?: string;
    title?: string;
    track?: string;
    level?: number;
    performance?: number;
    at_work?: boolean;
    next_shift?: string;
  }[];
  // Businesses the sim owns (mod builds from 2026-10-13): a small business is owned by a
  // sim and carries its own name; a retail store, restaurant or vet clinic is owned by the
  // household and is named after its lot. `type` is the game's BusinessType name.
  businesses?: { name?: string; type?: string; zone_id?: string; owner?: 'sim' | 'household' }[];
  top_skills?: { skill?: string; level?: number; raw?: number }[];
  relationships?: DossierRelationship[];
};

export type DossierReport = {
  type?: string;
  seq?: number;
  reason?: string;
  clock?: { absolute_day?: number; hour?: number; minute?: number };
  dossiers: SimDossier[];
};
