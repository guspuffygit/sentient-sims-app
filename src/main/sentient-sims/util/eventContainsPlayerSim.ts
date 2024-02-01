import { SSEvent } from '../models/InteractionEvents';

export function containsPlayerSim(event: SSEvent) {
  let hasPlayerSim = false;
  event.sentient_sims.forEach((sentientSim) => {
    if (sentientSim.is_player_sim) {
      hasPlayerSim = true;
    }
  });

  return hasPlayerSim;
}
