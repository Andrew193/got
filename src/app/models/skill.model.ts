import {Effect} from "./effect.model";

export interface Skill {
  imgSrc: string,
  dmgM: number,
  healM?: number,
  debuffs?: Effect[],
  inRangeDebuffs?: Effect[],
  buffs?: Effect[],
  cooldown: number,
  remainingCooldown: number,
  name: string,
  passive?: boolean,
  restoreSkill?: boolean,
  attackInRange?: boolean,
  attackRange?: number,
  attackInRangeM?: number,
  description: string,
  healAll?: boolean,
  heal?: boolean,
}
