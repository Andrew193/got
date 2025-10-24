import { Skill } from './skill.model';
import { Effect } from '../effect.model';
import { DisplayReward } from '../../services/reward/reward.service';
import { Coordinate } from '../field.model';
import { RewardValues } from '../reward-based.model';

export interface Unit extends Coordinate {
  rank: number;
  rarity: number;
  healer?: boolean;
  onlyHealer?: boolean;
  heroType: number;
  eq1Level: number;
  eq2Level: number;
  eq3Level: number;
  eq4Level: number;
  level: number;
  rankBoost: number;
  healthIncrement: number;
  attackIncrement: number;
  defenceIncrement: number;
  dmgReducedBy: number;
  ignoredDebuffs: string[];
  reducedDmgFromDebuffs: string[];
  user: boolean;
  imgSrc: string;
  canMove: boolean;
  canCross: number;
  maxCanCross: number;
  canAttack: boolean;
  attackRange: number;
  description: string;
  health: number;
  maxHealth: number;
  name: HeroesNamesCodes | RewardValues;
  attack: number;
  defence: number;
  rage: number;
  willpower: number;
  fullImgSrc?: string;
  skills: Skill[];
  effects: Effect[];
}

export interface UnitWithReward extends Unit {
  reward: DisplayReward;
}

export type SelectableUnit = Pick<Unit, 'name' | 'imgSrc'>;

export type PreviewUnit = SelectableUnit & {
  description: Unit['description'];
  skills: Pick<Skill, 'imgSrc' | 'name' | 'description' | 'passive'>[];
};

export interface UnitConfig {
  level: number;
  rank: number;
  eq1Level: number;
  eq2Level: number;
  eq3Level: number;
  eq4Level: number;
}

export enum HeroType {
  ATTACK,
  DEFENCE,
}

export enum Rarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
}

export type GetTileConfig = {
  user: boolean;
} & Coordinate;

export enum HeroesNamesCodes {
  LadyOfDragonStone = 'Daenerys Targaryen (Lady of Dragonstone)',
  TargaryenKnight = 'Targaryen Knight',
  WhiteWolf = 'White Wolf',
  Priest = 'Priest',
  BrownWolf = 'Brown Wolf',
  IceRiverHunter = 'Ice River Hunter',
  RelinaShow = 'Relina Snow',
  FreeTrapper = 'Archer of the Free Folk',
  Giant = 'Giant',
  NightKing = 'Night King',
  WhiteWalkerGeneral = 'General Walker',
  WhiteWalkerCapitan = 'Captain Walker',
  JonKing = 'Jon Snow (King in the North)',
  DailyBossVersion1 = 'Gromirt Flame',
  Ranger = 'Ranger',
}
