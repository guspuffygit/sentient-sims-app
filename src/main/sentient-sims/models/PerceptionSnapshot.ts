// Mirror of the mod's build_scene_snapshot payload (ss_perception.py). Snapshots are
// ephemeral sensory input for cognition prompts — they are never stored as memories.

export type PerceivedSim = {
  sim_id: string;
  tier: 'same_room' | 'audible';
  distance?: number;
  // Present only for same_room: identity is never learned through a wall
  name?: string;
  // Same_room only. Gates romance on the TARGET, not just the actor (see isRomanceAge).
  // Absent on older mod builds, which reads as unknown and blocks romance.
  age?: string;
  // J3: the game's Species name (CAT, DOG, SMALLDOG, FOX, HORSE) for a pet; absent for a human
  species?: string;
  // Whitelist keys the game refuses TOWARD a target of this age (read mod-side from the
  // mixer's own TargetSim age tests). The mod's dispatch-time age gate is the safety;
  // this lets the app skip offering them as a cost optimisation. Absent on older mods.
  target_age_blocked?: string[];
  doing?: string;
  // Same_room only. A sleeping sim cannot be socialised with at all — every mixer dies
  // at execution with INTERACTION_INCOMPATIBILITY (live 2026-08-16: three 'chat' pushes
  // at a napping sim in a row). Absent on older mod builds, which reads as awake.
  asleep?: boolean;
  // Observer -> perceived relationship: the has_met gate plus the lore layer
  social?: {
    has_met?: boolean;
    friendship?: number;
    romance?: number;
    bits?: string[];
  };
};

export type PerceivedObject = {
  object_id: string;
  // Whitelist action keys this object won as nearest provider — valid enqueue targets
  action_keys: string[];
  name?: string;
  tier: 'same_room';
  distance?: number;
};

export type PerceptionSnapshot = {
  type?: string;
  request_id?: string;
  // Set when the mod failed to build the snapshot (sim not instantiated, etc.) —
  // the reply still arrives so a cognition tick awaiting perception never hangs
  error?: string;
  sim_id: string;
  sim_name?: string;
  room_id?: number;
  location?: {
    zone_id?: number;
    outdoors?: boolean;
  };
  sims: PerceivedSim[];
  objects: PerceivedObject[];
  ambient?: {
    sim_mood?: string;
    motives_low?: string[];
  };
};
