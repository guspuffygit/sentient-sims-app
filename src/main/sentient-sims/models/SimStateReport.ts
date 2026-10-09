// Mirror of the mod's Block 8 state report (ss_state_reporter.py). One shared lot block
// plus a perception snapshot + self status + activity per on-lot household sim, POSTed to
// /cognition/state every ~5s. Silence means the zone is loading (suspend cognition);
// paused_heartbeat means the pipeline is alive but the world is frozen.

import { PerceptionSnapshot } from './PerceptionSnapshot';

export type LotClock = {
  hour?: number;
  minute?: number;
  // Weekday 0-6 — useless for rollover; absolute_day is the monotonic counter
  // daily plans are keyed on (absent on older mod builds = feature inert)
  day?: number;
  absolute_day?: number;
  week?: number;
  speed?: string;
  paused?: boolean;
};

export type LotBills = {
  due?: boolean;
  amount?: number;
  // Utilities ALREADY cut off (power/water) — the recurring silent killer
  shut_off?: string[];
};

export type LotCondition = {
  object_id: string;
  name?: string;
  conditions: string[]; // broken | dirty | clogged | burnt
};

export type LotBlock = {
  zone_id?: number | string;
  // The app keys locations by LOT id (what events and outcomes carry); zone_id is the
  // game's zone handle and does NOT match it
  lot_id?: string;
  // Human-readable place handles (V-6): the lot's own name and its world id
  lot_name?: string;
  world_id?: string;
  clock?: LotClock;
  venue?: string;
  funds?: number;
  // True when the active lot is the reporting household's home zone — gates the
  // send-idle-off-lot-sims-home rule
  is_home?: boolean;
  bills?: LotBills;
  // ownership class -> count; ABSENCE drives plans (no computer, no instrument)
  owned?: Record<string, number>;
  conditions?: LotCondition[];
  situations?: string[];
  // Context-gated lot verbs (pay_bills when due, hire_repair_service when broken, ...);
  // the mod resolves their targets, the app only offers/validates
  action_keys?: string[];
};

export type SimCareer = {
  career?: string;
  level?: number;
  performance?: number;
  at_work?: boolean;
  next_shift?: string;
};

export type SimSkill = {
  skill: string;
  level: number;
  raw?: number;
};

export type NextObjective = {
  track?: string;
  aspiration?: string;
  objective?: string;
  test?: string;
  threshold?: number | string;
};

// One entry in the game-grounded pool the nightly planner picks daily goals from.
// id is a tuning class __name__ (stable across sessions); an aspiration/promotion id
// vanishing from the pool means the game marked it complete — wants reroll, so a
// missing 'want' id proves nothing.
// A future mod build may add sources beyond these; nothing branches on an unknown one
export type GoalSource = 'aspiration' | 'promotion' | 'daily_task' | 'want';

export type GoalPoolEntry = {
  id: string;
  source: GoalSource;
  label: string;
  // G-4: whitelist verbs that can advance this goal (mod-side reverse index of the
  // objective's own affordances + `serves` fragments); reachable=false when none can.
  // Absent on older mods (treated as unknown, never as unreachable).
  action_keys?: string[];
  reachable?: boolean;
};

export type SimSelfStatus = {
  needs?: Record<string, number>;
  buffs?: string[];
  // Live wants — reroll constantly, valid only for the report they arrived in
  wants?: string[];
  traits?: string[];
  skills?: SimSkill[];
  careers?: SimCareer[];
  inventory?: Record<string, number>;
  in_ww_scene?: boolean;
  next_objective?: NextObjective;
  age?: string;
  // J3: the game's Species name for a pet; absent for a human
  species?: string;
  // Whitelist keys this sim's AGE cannot run, read mod-side from the game's own affordance
  // tests (a CHILD cannot read_book, tell_joke, cook_meal, deep_conversation, ...). Absent
  // on older mod builds, which simply means no age filtering.
  age_blocked?: string[];
  mood?: string;
  on_active_lot?: boolean;
  // The game's own sim.sleeping flag, sent only when true. Absent on older mod builds;
  // the tick gate then falls back to the running interaction (CognitionService.isAsleep).
  asleep?: boolean;
  // Household sims only; capped at 12 (durable goals first, wants fill the rest)
  goal_pool?: GoalPoolEntry[];
};

export type SimActivity = {
  queue?: string[];
  running?: string | null;
  in_social?: boolean;
  hands_full?: boolean;
  // G-9: the whitelist verb the sim is already doing (running or staged), mapped
  // mod-side through the reverse index (fallbacks included). A dispatch that names it
  // is an echo of autonomy, not a decision — counted as continue.
  running_action_key?: string;
  // The running head SI a mod-pushed action starved behind (ss_stuck_watchdog): new
  // pushes at this sim are doomed until it clears. Absent on older mods = unknown,
  // never "unreachable".
  blocked_by?: string;
};

// A sim's entry in the report: the perception snapshot plus internal state
export type SimStateEntry = PerceptionSnapshot & {
  self?: SimSelfStatus;
  activity?: SimActivity;
  // False for on-lot NPCs riding the report so scene-armed desires can fire; absent
  // (older mod builds) means household
  is_household?: boolean;
  // V-8: the player's currently selected sim (the one a voice command is for)
  is_active?: boolean;
};

export type KnownSim = {
  sim_id: string;
  name?: string;
  friendship?: number;
};

// One go_out destination from the mod's venue directory (every venue lot in the save,
// same-world first, capped at 40). zone_id is a string — the ids are 64-bit.
export type VenueEntry = {
  zone_id: string;
  name?: string;
  venue?: string;
  world?: string;
  same_world?: boolean;
};

export type SimStateReport = {
  type: 'state_report';
  seq: number;
  reason?: string;
  whitelist_version?: string;
  paused?: boolean;
  lot?: LotBlock;
  sims?: SimStateEntry[];
  known_sims?: KnownSim[];
  // Venue directory for go_out destination choice; absent on older mod builds
  venues?: VenueEntry[];
  // sim_ids that transitioned busy -> idle since the previous report
  went_idle?: string[];
  // The player's currently selected sim. Rides paused heartbeats too — sim switching
  // works while paused, so this is fresher than the per-sim is_active flags, which
  // only update with a full (unpaused) report.
  active_sim_id?: string;
};
