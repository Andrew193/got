import { Effect } from '../effect.model';

export type Skill = {
  debuffs?: Effect[];
  inRangeDebuffs?: Effect[];
  buffs?: Effect[];
  addBuffsBeforeAttack?: boolean;
  name: string;
  passive?: boolean;
  restoreSkill?: boolean;
  description: string;
} & SkillSrc &
  SkillRangeConfig &
  SkillHealConfig &
  SkillCooldown;

export type SkillCooldown =
  | {
      passive?: undefined;
      dmgM: number;
      cooldown: number;
      remainingCooldown: number;
    }
  | {
      passive: true;
      dmgM?: number;
      cooldown?: number;
      remainingCooldown?: number;
    };

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
  | 'name'
  | 'restoreSkill'
  | 'buffs'
  | 'imgSrc'
  | 'inRangeDebuffs'
  | 'debuffs'
  | 'addBuffsBeforeAttack'
  | 'description'
> &
  SkillRangeConfig &
  SkillHealConfig &
  SkillCooldown;
