import { Effect } from '../effect.model';

export type Skill = {
  dmgM: number;
  debuffs?: Effect[];
  inRangeDebuffs?: Effect[];
  buffs?: Effect[];
  addBuffsBeforeAttack?: boolean;
  cooldown: number;
  remainingCooldown: number;
  name: string;
  passive?: boolean;
  restoreSkill?: boolean;
  description: string;
} & SkillSrc &
  SkillRangeConfig &
  SkillHealConfig;

export type SkillHealConfig =
  | {
      heal?: false | undefined;
      healM?: number;
      healAll?: boolean;
    }
  | {
      heal: true;
      healM: number;
      healAll: boolean;
    };

export type SkillRangeConfig =
  | {
      attackInRange?: false | undefined;
      attackRange?: number;
      attackInRangeM?: number;
    }
  | {
      attackInRange: true;
      attackRange: number;
      attackInRangeM: number;
    };

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
  | 'cooldown'
  | 'dmgM'
  | 'description'
> &
  SkillRangeConfig &
  SkillHealConfig;
