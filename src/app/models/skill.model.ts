import { Effect } from './effect.model';

export interface Skill extends SkillSrc {
  dmgM: number;
  healM?: number;
  debuffs?: Effect[];
  inRangeDebuffs?: Effect[];
  buffs?: Effect[];
  addBuffsBeforeAttack?: boolean;
  cooldown: number;
  remainingCooldown: number;
  name: string;
  passive?: boolean;
  restoreSkill?: boolean;
  attackInRange?: boolean;
  attackRange?: number;
  attackInRangeM?: number;
  description: string;
  healAll?: boolean;
  heal?: boolean;
}

export interface SkillSrc {
  imgSrc: string;
}
