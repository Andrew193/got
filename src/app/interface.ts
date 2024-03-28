export interface Position {
  i: number,
  j: number
}
export interface LogRecord {
  message: string,
  isUser?: boolean,
  info?: boolean,
  imgSrc: string
}

export class GameFieldVars {
  gameField: Tile[][] = [];
  gameConfig: any[][] = [];
  possibleMoves: Position[] = [];
}

export interface Tile {
  x: number,
  y: number,
  active: boolean,
  entity?: Unit,
  highlightedClass?: string
}

export interface Effect {
  imgSrc: string,
  type: string,
  duration: number,
  m: number,
  restore?: boolean
  passive?: boolean,
  defBreak?: number
}

export interface Skill {
  imgSrc: string,
  dmgM: number,
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
  description: string
}

export interface Unit {
  x: number,
  y: number,
  rank: number,
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
