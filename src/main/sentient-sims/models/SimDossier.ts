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
  household?: { id?: string; name?: string; member_ids?: string[] };
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
  likes?: string[];
  dislikes?: string[];
  aspiration?: { track?: string; aspiration?: string; objective?: string };
  // `career` is the track's tuning class name (career_Adult_Culinary) and `level` the
  // user-facing level. The job TITLE for that level (Line Cook, Mixologist) is a
  // LocalizedString the mod cannot resolve without the game's string table, so the track
  // is as specific as the app can get - rendered as "the Culinary career, level 4" rather
  // than as a job title, since a sim handed a bare "Culinary (level 4)" invented one.
  careers?: { career?: string; level?: number; performance?: number; at_work?: boolean; next_shift?: string }[];
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
