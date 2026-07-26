// Mirror of the mod's build_scene_snapshot payload (ss_perception.py). Snapshots are
// ephemeral sensory input for cognition prompts — they are never stored as memories.

export type PerceivedSim = {
  sim_id: string;
  tier: 'same_room' | 'audible';
  distance?: number;
  // Present only for same_room: identity is never learned through a wall
  name?: string;
  doing?: string;
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
