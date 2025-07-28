import { SentientSimCareer } from './SentientSimCareer';
import { SimAge } from './SimAge';

export type SentientSimProperties = {
  description?: string;
  careers: SentientSimCareer[];
  name: string;
  age: SimAge;
  sim_id: string;
  gender: string;
  traits: string[];
  moods: string[];
  is_ghost: boolean;
  grubby: boolean;
  in_pool: boolean;
  is_at_home: boolean;
  is_dying: boolean;
  is_human: boolean;
  is_inside_building: boolean;
  is_outside: boolean;
  is_pet: boolean;
  on_fire: boolean;
  on_home_lot: boolean;
  sleeping: boolean;
  is_pregnant: boolean;
  is_player_sim: boolean;
  upper_body?: number;
  lower_body?: number;
  body_posture?: string;
  body_posture_target?: string;
  back_posture?: string;
  back_posture_target?: string;
  left_posture?: string;
  left_posture_target?: string;
  right_posture?: string;
  right_posture_target?: string;
  target_name?: string;
  target_part_owner_name?: string;
  target_slot_type_set_name?: string;
};

export type SentientSim = SentientSimProperties & {
  spouse?: SentientSimProperties;
  fiance?: SentientSimProperties;
  posture_linked_sim?: SentientSimProperties;
};
