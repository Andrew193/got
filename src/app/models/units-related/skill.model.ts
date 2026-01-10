import { Effect } from '../effect.model';
import { EffectsValues } from '../../constants';

export type Skill = {
  debuffs?: Effect[];
  inRangeDebuffs?: Effect[];
  activateDebuffs?: EffectsValues[];
  extendsBuffs?: EffectsValues[];
  extendsBuffsBy?: number;
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
      heal: {
        healM: number;
        healAll: boolean;
      };
    };

export type SkillRangeConfig =
  | {
      attackInRange?: false | undefined;
      attackRange?: number;
      attackInRangeM?: number;
    }
  | {
      attackInRange: {
        attackRange: number;
        attackInRangeM: number;
      };
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
