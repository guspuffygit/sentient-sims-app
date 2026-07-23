// An action the app wants a sim to take, expressed in the mod's whitelisted action
// vocabulary (ss_affordance_whitelist.py). Dispatched over the mod websocket as an
// ENQUEUE_INTERACTION message; the mod reports the result to POST /cognition/outcome.
export type ActionIntent = {
  sim_id: string;
  action: string;
  target_sim_id?: string;
  target_object_id?: string;
  priority?: 'high' | 'low';
  insert_strategy?: 'next' | 'last';
  clear_queue?: boolean;
  source?: string;
  // The thought that motivated the action; carried into the outcome memory's pre_action so
  // future cognition ticks can see why the action was attempted
  motivation?: string;
};

// What the mod reports back after a dispatched interaction finishes
export type InteractionOutcomeEvent = {
  request_id?: string;
  sim_id: string;
  sim_name?: string;
  target_sim_id?: string;
  target_sim_name?: string;
  action?: string;
  interaction_name?: string;
  outcome: 'success' | 'failure' | 'canceled';
  location_id?: number;
};
