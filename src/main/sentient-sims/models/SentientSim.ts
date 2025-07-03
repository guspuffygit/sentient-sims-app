import { SentientSimCareer } from './SentientSimCareer';
import { SimAge } from './SimAge';

export type SentientSim = {
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
};
