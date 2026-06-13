import { vi } from 'vitest';

import { TileUnit } from '../../../models/field.model';
import { TileUnitSkill } from '../../../models/units-related/skill.model';
import { HeroesNamesCodes, HeroType } from '../../../models/units-related/unit.model';

// ─── Unit factories ───────────────────────────────────────────────────────────

export function makeTileUnit(overrides: Partial<TileUnit> = {}): TileUnit {
  return {
    health: 100,
    maxHealth: 100,
    user: true,
    canMove: true,
    canAttack: true,
    x: 0,
    y: 0,
    attackRange: 1,
    canCross: 1,
    maxCanCross: 1,
    name: HeroesNamesCodes.WhiteWolf,
    imgSrc: '',
    skills: [],
    effects: [],
    attack: 50,
    defence: 10,
    heroType: HeroType.ATTACK,
    dmgReducedBy: 0,
    rage: 0,
    willpower: 0,
    reducedDmgFromDebuffs: [],
    ignoredDebuffs: [],
    healer: false,
    onlyHealer: false,
    level: 1,
    rank: 1,
    eq1Level: 0,
    eq2Level: 0,
    eq3Level: 0,
    eq4Level: 0,
    ...overrides,
  };
}

export function makeDeadUnit(overrides: Partial<TileUnit> = {}): TileUnit {
  return makeTileUnit({ health: 0, ...overrides });
}

// ─── Skill factory ────────────────────────────────────────────────────────────

export function makeSkill(overrides: Partial<TileUnitSkill> = {}): TileUnitSkill {
  return {
    name: 'TestSkill',
    description: '',
    imgSrc: '',
    passive: false,
    cooldown: 0,
    remainingCooldown: 0,
    dmgM: 1,
    ...overrides,
  } as TileUnitSkill;
}

// ─── BasicGameFieldComposition stubs ─────────────────────────────────────────

export function buildBasicCompositionStubs() {
  const fieldService = {
    resetMoveAndAttack: vi.fn((unitArrayOrNested: any, setValue = true) => {
      const resetArray = (arr: TileUnit[]) =>
        arr.forEach((u, i) => {
          arr[i] = { ...u, canMove: setValue, canAttack: setValue };
        });

      if (Array.isArray(unitArrayOrNested[0])) {
        (unitArrayOrNested as TileUnit[][]).forEach(resetArray);
      } else {
        resetArray(unitArrayOrNested as TileUnit[]);
      }
    }),
    getGameField: vi.fn(() => []),
    getDefaultGameField: vi.fn(() => []),
    getGridFromField: vi.fn(() => []),
    getFieldsInRadius: vi.fn(() => []),
    canReachPosition: vi.fn(() => true),
    populateGameFieldWithUnits: vi.fn(() => []),
    getDamage: vi.fn(() => 10),
    chooseAiSkill: vi.fn((skills: any[]) => skills[0]),
    getShortestPathCover: vi.fn(() => []),
    shortestPath: vi.fn(() => []),
  } as any;

  const unitService = {
    findUnitIndex: vi.fn((units: TileUnit[], target: any) =>
      units.findIndex(u => u.x === target?.x && u.y === target?.y),
    ),
    findSkillIndex: vi.fn(() => 0),
    addEffectToUnit: vi.fn((units: TileUnit[], index: number) => units[index]),
    addBuffToUnit: vi.fn((units: TileUnit[], index: number) => units[index]),
    getPositionFromCoordinate: vi.fn((unit: TileUnit) => ({ i: unit.x, j: unit.y })),
    getCoordinateFromPosition: vi.fn((pos: any) => ({ x: pos.i, y: pos.j })),
    orderUnitsByDistance: vi.fn((_unit: TileUnit, targets: TileUnit[]) => targets),
    updateGridUnits: vi.fn((_units: TileUnit[], config: any) => config),
    recountSkillsCooldown: vi.fn((skills: any[]) => skills),
  } as any;

  const effectsService = {
    getBoostedParameterCover: vi.fn(() => 50),
    getHealthAfterDmg: vi.fn((health: number, dmg: number) => Math.max(0, health - dmg)),
    getEffectsWithIgnoreFilter: vi.fn(() => []),
    getMultForEffect: vi.fn(() => 1),
    getDebuffDmg: vi.fn(() => 0),
    recountStatsBasedOnEffect: vi.fn((_effect: any, unit: TileUnit) => ({ unit })),
    restoreStatsAfterEffect: vi.fn((_effect: any, unit: TileUnit) => unit),
    effects: {},
    getNumberForCommonEffects: vi.fn(() => 0),
    getHealthAfterRestore: vi.fn((h: number) => h),
  } as any;

  const gameActionService = {
    isDead: vi.fn((units: TileUnit[]) => units.every(u => u.health <= 0)),
    checkPassiveSkills: vi.fn(),
    recountCooldownForUnit: vi.fn((unit: TileUnit) => unit),
    checkEffects: vi.fn((unit: TileUnit) => ({ unit })),
    getCanGetToPosition: vi.fn((_unit: any, _path: any, targetPos: any) => targetPos),
    getCanCross: vi.fn(() => 1),
    selectSkillsAndRecountCooldown: vi.fn(() => []),
    getFixedDefence: vi.fn((d: number) => d),
    getFixedAttack: vi.fn((a: number) => a),
    extendEffectDurationBy: 0,
  } as any;

  const battleStateS = {
    turnCount$: { subscribe: () => {} },
    turnUser$: { subscribe: () => {} },
    turnCount: 1,
    maxTurnCount: 20,
    turnUser: true,
    userTotalDamage: 0,
    aiTotalDamage: 0,
    battleActive: false,
    resetBattleState: vi.fn(),
    incrementTurnCount: vi.fn(),
    setTurnUser: vi.fn(),
    addUserDamage: vi.fn(),
    addAiDamage: vi.fn(),
    setBattleActive: vi.fn(),
    getState: vi.fn(),
  } as any;

  const autoFightS = {
    startAutoFight: vi.fn(),
    stopAutoFight: vi.fn(),
    isAutoFightActive: vi.fn(() => false),
  } as any;

  const battleResultS = {
    checkBattleEnd: vi.fn(() => ({ battleEnded: false, winner: null, reason: 'none' })),
    showBattleResult: vi.fn(),
  } as any;

  const aiTurnS = {
    executeAiTurn: vi.fn(),
  } as any;

  const passiveAbilityS = {
    processRoundStart: vi.fn((hero: TileUnit, allies: TileUnit[], enemies: TileUnit[]) => ({
      allies,
      enemies,
      blockBuffApplication: false,
    })),
    processBeforeAttack: vi.fn(() => ({ blockBuffApplication: false })),
  } as any;

  const store = {
    select: vi.fn(() => ({ subscribe: () => {} })),
    selectSignal: vi.fn(() => () => null),
    dispatch: vi.fn(),
  } as any;

  return {
    fieldService,
    unitService,
    effectsService,
    gameActionService,
    battleStateS,
    autoFightS,
    battleResultS,
    aiTurnS,
    passiveAbilityS,
    store,
  };
}

// ─── AiTurnService stubs ──────────────────────────────────────────────────────

export function buildAiTurnServiceStubs() {
  const gameService = {
    checkPassiveSkills: vi.fn(),
    getCanGetToPosition: vi.fn((_unit: any, _path: any, targetPos: any) => targetPos),
    getCanCross: vi.fn(() => 1),
    selectSkillsAndRecountCooldown: vi.fn(() => []),
    isDead: vi.fn((units: TileUnit[]) => units.every(u => u.health <= 0)),
  } as any;

  const unitService = {
    orderUnitsByDistance: vi.fn((_unit: TileUnit, targets: TileUnit[]) => targets),
    getPositionFromCoordinate: vi.fn((unit: TileUnit) => ({ i: unit.x, j: unit.y })),
    findUnitIndex: vi.fn((units: TileUnit[], target: any) =>
      units.findIndex(u => u.x === target?.x && u.y === target?.y),
    ),
  } as any;

  const fieldService = {
    chooseAiSkill: vi.fn((skills: any[]) => skills[0]),
    getShortestPathCover: vi.fn(() => []),
    getGridFromField: vi.fn(() => []),
    getFieldsInRadius: vi.fn(() => []),
  } as any;

  return { gameService, unitService, fieldService };
}

// ─── BattleResultService stubs ────────────────────────────────────────────────

export function buildBattleResultServiceStubs() {
  const battleStateService = {
    turnCount: 0,
    maxTurnCount: 20,
    userTotalDamage: 0,
    aiTotalDamage: 0,
    resetBattleState: vi.fn(),
    incrementTurnCount: vi.fn(),
    setTurnUser: vi.fn(),
    addUserDamage: vi.fn(),
    addAiDamage: vi.fn(),
  } as any;

  const gameService = {
    isDead: vi.fn((units: TileUnit[]) => units.every(u => u.health <= 0)),
  } as any;

  return { battleStateService, gameService };
}
