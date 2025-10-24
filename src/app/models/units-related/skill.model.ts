import { Effect } from '../effect.model';

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

export type TileUnitSkill = Pick<
  Skill,
  | 'remainingCooldown'
  | 'name'
  | 'passive'
  | 'restoreSkill'
  | 'buffs'
  | 'imgSrc'
  | 'inRangeDebuffs'
  | 'debuffs'
  | 'addBuffsBeforeAttack'
  | 'healAll'
  | 'cooldown'
  | 'healM'
  | 'dmgM'
  | 'attackInRange'
  | 'attackRange'
  | 'attackInRangeM'
  | 'description'
>;
