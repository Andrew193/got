import {Coordinate} from "../interface";
import {Skill} from "./skill.model";
import {Effect} from "./effect.model";
import {rarity} from "../services/heroes/heroes.service";

export interface Unit extends Coordinate {
  rank: number,
  rarity: number,
  inBattle?: boolean,
  healer?: boolean,
  onlyHealer?: boolean,
  heroType: number,
  eq1Level: number,
  eq2Level: number,
  eq3Level: number,
  eq4Level: number,
  level: number,
  rankBoost: number,
  healthIncrement: number,
  attackIncrement: number,
  defenceIncrement: number,
  dmgReducedBy: number,
  ignoredDebuffs: string[],
  reducedDmgFromDebuffs: string[]
  user: boolean,
  imgSrc: string,
  canMove: boolean
  canCross: number,
  maxCanCross: number,
  canAttack: boolean,
  attackRange: number,
  description: string,
  health: number,
  maxHealth: number,
  name: string,
  attack: number,
  defence: number,
  rage: number,
  willpower: number,
  fullImgSrc?: string,
  skills: Skill[],
  effects: Effect[]
}
