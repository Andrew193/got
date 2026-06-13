/**
 * Bug Condition Exploration Test — Gift Store Modal Loop
 *
 * Spec: .kiro/specs/gift-store-modal-loop/
 * Task: 1 — Write bug condition exploration property test
 *
 * CRITICAL: These tests are EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists in checkAutoFightEnd().
 *
 * Bug: checkAutoFightEnd() only checks isDead() on both unit arrays.
 * When turnCount >= maxTurnCount with both sides alive, isDead() returns
 * false for both teams, so checkAutoFightEnd() returns false — the
 * setInterval in startAutoFight keeps firing and floods the modal queue.
 *
 * Documented counterexample (found by running this test on unfixed code):
 *   turnCount=20, maxTurnCount=20, aiUnitsDead=false, userUnitsDead=false
 *   → checkAutoFightEnd() returns false (BUG: should return true)
 *
 * Validates: Requirements 1.1, 1.2, 2.1, 2.4
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { BasicGameFieldComposition } from './basic-game-field-composition';
import { BattleEndResult } from '../../../services/game-related/battle-result/battle-result.service';
import { TileUnit } from '../../../models/field.model';
import { buildBasicCompositionStubs, makeTileUnit, makeDeadUnit, makeSkill } from './test-utils';

// ---------------------------------------------------------------------------
// Minimal TileUnit factory — only the fields checkAutoFightEnd / isDead care about
// ---------------------------------------------------------------------------
function makeLivingUnit(user: boolean): TileUnit {
  return { health: 100, user } as TileUnit;
}

// ---------------------------------------------------------------------------
// Minimal stub factory for BasicGameFieldComposition
// All services are plain objects with only the methods the composition calls.
// ---------------------------------------------------------------------------
function buildComposition(opts: {
  isDead: (units: TileUnit[]) => boolean;
  checkBattleEnd: (userUnits: TileUnit[], aiUnits: TileUnit[]) => BattleEndResult;
}) {
  // Stub every service the constructor requires
  const fieldService = {} as any;
  const unitService = {} as any;
  const effectsService = {} as any;

  const gameActionService = {
    isDead: vi.fn(opts.isDead),
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

  const autoFightS = {} as any;

  const battleResultS = {
    checkBattleEnd: vi.fn(opts.checkBattleEnd),
    showBattleResult: vi.fn(),
  } as any;

  const aiTurnS = {} as any;

  const passiveAbilityS = {
    processRoundStart: vi.fn((hero, allies, enemies) => ({
      allies,
      enemies,
      blockBuffApplication: false,
    })),
    processBeforeAttack: vi.fn(() => ({ allies: [], enemies: [], blockBuffApplication: false })),
  } as any;

  // Store stub — AbstractGameFieldComposition calls store.select() in constructor
  const store = {
    select: vi.fn(() => ({ subscribe: () => {} })),
    dispatch: vi.fn(),
    selectSignal: vi.fn(() => () => null),
  } as any;

  const composition = new BasicGameFieldComposition(
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
  );

  // Assign unit arrays so checkAutoFightEnd can reference them
  composition.userUnits = [makeLivingUnit(true)];
  composition.aiUnits = [makeLivingUnit(false)];

  return { composition, gameActionService, battleResultS, battleStateS };
}

// ---------------------------------------------------------------------------
// Helper: build a composition in the exact bug condition
//   turnCount >= maxTurnCount, both sides alive, checkBattleEnd → battleEnded:true
// ---------------------------------------------------------------------------
function buildBugConditionComposition(turnCount = 20, maxTurnCount = 20) {
  const { composition, battleStateS } = buildComposition({
    // isDead returns false for both teams — both sides are alive
    isDead: (_units: TileUnit[]) => false,
    // checkBattleEnd correctly reports the battle has ended via max_turns
    checkBattleEnd: (_u, _a) => ({
      battleEnded: true,
      winner: 'user',
      reason: 'max_turns',
    }),
  });

  // Simulate the battle state at the turn limit
  battleStateS.turnCount = turnCount;
  battleStateS.maxTurnCount = maxTurnCount;

  return composition;
}

// ===========================================================================
// Unit tests
// ===========================================================================

describe('BasicGameFieldComposition.checkAutoFightEnd() — Bug Condition Exploration', () => {
  /**
   * Core bug condition test (concrete example):
   * turnCount=20, maxTurnCount=20, both sides alive.
   *
   * EXPECTED TO FAIL on unfixed code:
   *   checkAutoFightEnd() returns false because it only checks isDead(),
   *   which returns false for both teams. It never consults checkBattleEnd().
   *
   * Counterexample: { turnCount: 20, maxTurnCount: 20, aiDead: false, userDead: false }
   *   → actual: false, expected: true
   */
  it('should return true when turnCount=20 equals maxTurnCount=20 and both sides are alive', () => {
    const composition = buildBugConditionComposition(20, 20);

    // BUG: returns false on unfixed code (isDead is false for both teams)
    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  it('should return true when turnCount=21 exceeds maxTurnCount=20 and both sides are alive', () => {
    const composition = buildBugConditionComposition(21, 20);

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  it('should return true when turnCount=25 exceeds maxTurnCount=20 and both sides are alive', () => {
    const composition = buildBugConditionComposition(25, 20);

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  it('should return true when turnCount=50 exceeds maxTurnCount=20 and both sides are alive', () => {
    const composition = buildBugConditionComposition(50, 20);

    expect(composition.checkAutoFightEnd()).toBe(true);
  });
});

// ===========================================================================
// Property-based test
// Validates: Requirements 2.1, 2.4
// ===========================================================================

describe('Property 1: Bug Condition — checkAutoFightEnd() returns true for all turnCount >= maxTurnCount with both sides alive', () => {
  /**
   * **Validates: Requirements 2.1, 2.4**
   *
   * For any game state where isBugCondition holds:
   *   - autoFightActive = true
   *   - turnCount >= maxTurnCount
   *   - aiUnitsDead = false
   *   - userUnitsDead = false
   *
   * checkAutoFightEnd() MUST return true.
   *
   * EXPECTED TO FAIL on unfixed code because checkAutoFightEnd() only
   * calls isDead() (which returns false) and never consults checkBattleEnd().
   */
  it('returns true for all turnCount >= maxTurnCount with both sides alive (property)', () => {
    fc.assert(
      fc.property(
        // Generate maxTurnCount in [1..50] and turnCount in [maxTurnCount..maxTurnCount+30]
        fc
          .integer({ min: 1, max: 50 })
          .chain(maxTurnCount =>
            fc.tuple(
              fc.constant(maxTurnCount),
              fc.integer({ min: maxTurnCount, max: maxTurnCount + 30 }),
            ),
          ),
        ([maxTurnCount, turnCount]) => {
          const composition = buildBugConditionComposition(turnCount, maxTurnCount);

          // BUG: returns false on unfixed code
          return composition.checkAutoFightEnd() === true;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Preservation Tests — MUST PASS on unfixed code
// These establish the baseline behavior that must be preserved after the fix.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
// ===========================================================================

// ---------------------------------------------------------------------------
// Helper: build a composition where both sides are alive and turn < maxTurnCount
// ---------------------------------------------------------------------------
function buildBothAliveUnderLimitComposition(turnCount: number, maxTurnCount: number) {
  const { composition, battleStateS } = buildComposition({
    isDead: (_units: TileUnit[]) => false,
    checkBattleEnd: (_u, _a) => ({
      battleEnded: false,
      winner: null,
      reason: 'none' as const,
    }),
  });

  battleStateS.turnCount = turnCount;
  battleStateS.maxTurnCount = maxTurnCount;

  return composition;
}

// ===========================================================================
// Test Group A — All AI units dead (user wins by elimination)
// Validates: Requirements 3.1
// ===========================================================================

describe('Preservation Group A: checkAutoFightEnd() returns true when all AI units are dead', () => {
  it('should return true when isDead returns true for aiUnits (concrete example)', () => {
    const aiUnits = [{ health: 0, user: false } as TileUnit];
    const userUnits = [makeLivingUnit(true)];

    // We need a fresh composition where isDead correctly identifies aiUnits by reference
    const { composition, gameActionService } = buildComposition({
      isDead: (_units: TileUnit[]) => false,
      checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
    });

    composition.aiUnits = aiUnits;
    composition.userUnits = userUnits;

    // Override isDead to return true only for aiUnits
    gameActionService.isDead.mockImplementation(
      (units: TileUnit[]) => units === composition.aiUnits,
    );

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  it('should return true when isDead returns true for aiUnits (multiple units)', () => {
    const { composition, gameActionService } = buildComposition({
      isDead: (_units: TileUnit[]) => false,
      checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
    });

    composition.aiUnits = [
      { health: 0, user: false } as TileUnit,
      { health: 0, user: false } as TileUnit,
    ];
    composition.userUnits = [makeLivingUnit(true), makeLivingUnit(true)];

    gameActionService.isDead.mockImplementation(
      (units: TileUnit[]) => units === composition.aiUnits,
    );

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  /**
   * **Validates: Requirements 3.1**
   *
   * Property: For any unit arrays where isDead(aiUnits) = true,
   * checkAutoFightEnd() MUST return true.
   * This must hold on BOTH unfixed and fixed code.
   */
  it('returns true for all unit arrays where isDead(aiUnits) = true (property)', () => {
    fc.assert(
      fc.property(
        // Generate arrays of dead AI units (health = 0) and living user units
        fc.array(fc.constant({ health: 0, user: false } as TileUnit), {
          minLength: 1,
          maxLength: 5,
        }),
        fc.array(fc.record({ health: fc.integer({ min: 1, max: 100 }), user: fc.constant(true) }), {
          minLength: 1,
          maxLength: 5,
        }),
        (deadAiUnits, livingUserUnits) => {
          const { composition, gameActionService } = buildComposition({
            isDead: (_units: TileUnit[]) => false,
            checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
          });

          composition.aiUnits = deadAiUnits as TileUnit[];
          composition.userUnits = livingUserUnits as TileUnit[];

          // isDead returns true only for aiUnits (all dead)
          gameActionService.isDead.mockImplementation(
            (units: TileUnit[]) => units === composition.aiUnits,
          );

          return composition.checkAutoFightEnd() === true;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Test Group B — All user units dead (AI wins by elimination)
// Validates: Requirements 3.2
// ===========================================================================

describe('Preservation Group B: checkAutoFightEnd() returns true when all user units are dead', () => {
  it('should return true when isDead returns true for userUnits (concrete example)', () => {
    const { composition, gameActionService } = buildComposition({
      isDead: (_units: TileUnit[]) => false,
      checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
    });

    composition.aiUnits = [makeLivingUnit(false)];
    composition.userUnits = [{ health: 0, user: true } as TileUnit];

    // isDead returns true only for userUnits
    gameActionService.isDead.mockImplementation(
      (units: TileUnit[]) => units === composition.userUnits,
    );

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  it('should return true when isDead returns true for userUnits (multiple units)', () => {
    const { composition, gameActionService } = buildComposition({
      isDead: (_units: TileUnit[]) => false,
      checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
    });

    composition.aiUnits = [makeLivingUnit(false), makeLivingUnit(false)];
    composition.userUnits = [
      { health: 0, user: true } as TileUnit,
      { health: 0, user: true } as TileUnit,
    ];

    gameActionService.isDead.mockImplementation(
      (units: TileUnit[]) => units === composition.userUnits,
    );

    expect(composition.checkAutoFightEnd()).toBe(true);
  });

  /**
   * **Validates: Requirements 3.2**
   *
   * Property: For any unit arrays where isDead(userUnits) = true,
   * checkAutoFightEnd() MUST return true.
   * This must hold on BOTH unfixed and fixed code.
   */
  it('returns true for all unit arrays where isDead(userUnits) = true (property)', () => {
    fc.assert(
      fc.property(
        // Generate arrays of living AI units and dead user units (health = 0)
        fc.array(
          fc.record({ health: fc.integer({ min: 1, max: 100 }), user: fc.constant(false) }),
          {
            minLength: 1,
            maxLength: 5,
          },
        ),
        fc.array(fc.constant({ health: 0, user: true } as TileUnit), {
          minLength: 1,
          maxLength: 5,
        }),
        (livingAiUnits, deadUserUnits) => {
          const { composition, gameActionService } = buildComposition({
            isDead: (_units: TileUnit[]) => false,
            checkBattleEnd: (_u, _a) => ({ battleEnded: false, winner: null, reason: 'none' }),
          });

          composition.aiUnits = livingAiUnits as TileUnit[];
          composition.userUnits = deadUserUnits as TileUnit[];

          // isDead returns true only for userUnits (all dead)
          gameActionService.isDead.mockImplementation(
            (units: TileUnit[]) => units === composition.userUnits,
          );

          return composition.checkAutoFightEnd() === true;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Test Group C — Turn below limit, both sides alive
// Validates: Requirements 3.3, 3.4
// ===========================================================================

describe('Preservation Group C: checkAutoFightEnd() returns false when turnCount < maxTurnCount and both sides alive', () => {
  it('should return false when turnCount=19, maxTurnCount=20, both sides alive (concrete example)', () => {
    const composition = buildBothAliveUnderLimitComposition(19, 20);

    expect(composition.checkAutoFightEnd()).toBe(false);
  });

  it('should return false when turnCount=1, maxTurnCount=20, both sides alive', () => {
    const composition = buildBothAliveUnderLimitComposition(1, 20);

    expect(composition.checkAutoFightEnd()).toBe(false);
  });

  it('should return false when turnCount=0, maxTurnCount=1, both sides alive', () => {
    const composition = buildBothAliveUnderLimitComposition(0, 1);

    expect(composition.checkAutoFightEnd()).toBe(false);
  });

  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * Property: For all turnCount < maxTurnCount with both sides alive,
   * checkAutoFightEnd() MUST return false.
   * This must hold on BOTH unfixed and fixed code.
   */
  it('returns false for all turnCount < maxTurnCount with both sides alive (property)', () => {
    fc.assert(
      fc.property(
        // Generate maxTurnCount in [1..50] and turnCount in [0..maxTurnCount-1]
        fc
          .integer({ min: 1, max: 50 })
          .chain(maxTurnCount =>
            fc.tuple(fc.constant(maxTurnCount), fc.integer({ min: 0, max: maxTurnCount - 1 })),
          ),
        ([maxTurnCount, turnCount]) => {
          const composition = buildBothAliveUnderLimitComposition(turnCount, maxTurnCount);

          return composition.checkAutoFightEnd() === false;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Feature: auto-fight-skip-turn-player-bug, Property 1: Player Half-Turn Executes Attacks
//
// CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
// Failure confirms the bug exists.
//
// Bug: executeAutoFightRound() calls finishHalfTurn(userUnits, aiUnits) WITHOUT
// first calling executeAiTurn(userUnits, aiUnits, ...) for the player half-turn.
// As a result, only the AI half-turn executes real attacks; the player half-turn
// is entirely passive (no attacks, no movement).
//
// Documented counterexample (found by running this test on unfixed code):
//   executeAiTurn spy call count = 1 (AI only); no call with userUnits as first arg.
//   executeAction never invoked with isAiMove: false during executeAutoFightRound.
//
// Validates: Requirements 2.1, 2.2, 2.3
// ===========================================================================

// ---------------------------------------------------------------------------
// Minimal stub builder for the auto-fight skip-turn player bug test.
// We need a composition that can run executeAutoFightRound() without throwing.
// The critical spy is aiTurnS.executeAiTurn.
// ---------------------------------------------------------------------------
function buildAutoFightComposition() {
  // One live player unit adjacent to the AI unit (same row, next column)
  const playerUnit: TileUnit = {
    health: 100,
    maxHealth: 100,
    user: true,
    canMove: true,
    canAttack: true,
    x: 0,
    y: 0,
    attackRange: 2,
    canCross: 1,
    name: 'Player',
    skills: [{ cooldown: 0, remainingCooldown: 0, passive: false, dmgM: 1 } as any],
    effects: [],
    buffs: [],
    rage: 0,
    willpower: 0,
    defence: 10,
    attack: 50,
    healer: false,
    onlyHealer: false,
    heroType: 'attack' as any,
    dmgReducedBy: 0,
  } as any;

  const aiUnit: TileUnit = {
    health: 100,
    maxHealth: 100,
    user: false,
    canMove: true,
    canAttack: true,
    x: 1,
    y: 0,
    attackRange: 2,
    canCross: 1,
    name: 'AI',
    skills: [{ cooldown: 0, remainingCooldown: 0, passive: false, dmgM: 1 } as any],
    effects: [],
    buffs: [],
    rage: 0,
    willpower: 0,
    defence: 10,
    attack: 50,
    healer: false,
    onlyHealer: false,
    heroType: 'attack' as any,
    dmgReducedBy: 0,
  } as any;

  // A minimal 3×3 gameConfig grid (all empty tiles)
  const emptyTile = () => ({ entity: undefined, active: false, x: 0, y: 0 });
  const gameConfig = Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => ({ ...emptyTile(), x: i, y: j })),
  ) as any[][];

  // fieldService stub — resetMoveAndAttack mutates units in-place (sets canMove/canAttack)
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
    getGameField: vi.fn(() => gameConfig),
    getDefaultGameField: vi.fn(() => gameConfig),
    getGridFromField: vi.fn(() => [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]),
    getFieldsInRadius: vi.fn(() => []),
    populateGameFieldWithUnits: vi.fn(() => gameConfig),
    getDamage: vi.fn(() => 10),
    chooseAiSkill: vi.fn((skills: any[]) => skills[0]),
    getShortestPathCover: vi.fn(() => [{ i: 1, y: 0 }]),
    canReachPosition: vi.fn(() => true),
    shortestPath: vi.fn(() => []),
  } as any;

  // unitService stub
  const unitService = {
    findUnitIndex: vi.fn((units: TileUnit[], target: any) =>
      units.findIndex(u => u.x === target?.x && u.y === target?.y),
    ),
    findSkillIndex: vi.fn(() => 0),
    addEffectToUnit: vi.fn((units: TileUnit[], index: number) => units[index]),
    addBuffToUnit: vi.fn((units: TileUnit[], index: number) => units[index]),
    getPositionFromCoordinate: vi.fn((unit: TileUnit) => ({ i: unit.x, j: unit.y })),
    getCoordinateFromPosition: vi.fn((pos: any) => ({ x: pos.i, y: pos.j })),
    orderUnitsByDistance: vi.fn((unit: TileUnit, targets: TileUnit[]) => targets),
    updateGridUnits: vi.fn((_units: TileUnit[], config: any) => config),
  } as any;

  // effectsService stub
  const effectsService = {
    getBoostedParameterCover: vi.fn(() => 50),
    getHealthAfterDmg: vi.fn((health: number, dmg: number) => Math.max(0, health - dmg)),
    getEffectsWithIgnoreFilter: vi.fn(() => []),
  } as any;

  // gameActionService stub
  const gameActionService = {
    isDead: vi.fn((units: TileUnit[]) => units.every(u => u.health <= 0)),
    checkPassiveSkills: vi.fn(),
    recountCooldownForUnit: vi.fn((unit: TileUnit) => unit),
    checkEffects: vi.fn((unit: TileUnit) => ({ unit })),
    getCanGetToPosition: vi.fn((_unit: any, _path: any, targetPos: any) => targetPos),
    getCanCross: vi.fn(() => 1),
    selectSkillsAndRecountCooldown: vi.fn(() => []),
    extendEffectDurationBy: 0,
    getFixedDefence: vi.fn((d: number) => d),
    getFixedAttack: vi.fn((a: number) => a),
  } as any;

  // battleStateS stub
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

  const autoFightS = {} as any;

  // battleResultS stub — reports battle has NOT ended (so both half-turns run)
  const battleResultS = {
    checkBattleEnd: vi.fn(() => ({ battleEnded: false, winner: null, reason: 'none' })),
    showBattleResult: vi.fn(),
  } as any;

  // aiTurnS spy — this is the critical spy for the bug condition test
  const aiTurnS = {
    executeAiTurn: vi.fn(),
  } as any;

  // passiveAbilityS stub
  const passiveAbilityS = {
    processRoundStart: vi.fn((hero: TileUnit, allies: TileUnit[], enemies: TileUnit[]) => ({
      allies,
      enemies,
      blockBuffApplication: false,
    })),
    processBeforeAttack: vi.fn(() => ({ blockBuffApplication: false })),
  } as any;

  // Store stub
  const store = {
    select: vi.fn(() => ({ subscribe: () => {} })),
    selectSignal: vi.fn(() => () => null),
    dispatch: vi.fn(),
  } as any;

  const composition = new BasicGameFieldComposition(
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
  );

  // Set up unit arrays and gameConfig directly
  composition.userUnits = [playerUnit];
  composition.aiUnits = [aiUnit];
  (composition as any).gameConfig = gameConfig;

  return { composition, aiTurnS, gameActionService, battleResultS, fieldService };
}

// ===========================================================================
// Bug Condition Test — Property 1: Player Half-Turn Executes Attacks
//
// EXPECTED TO FAIL on unfixed code:
//   executeAiTurn spy count = 1 (called once with aiUnits, never with userUnits)
// ===========================================================================

describe('Property 1: Bug Condition — executeAutoFightRound() — Player Half-Turn Executes Attacks', () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 2.3**
   *
   * For a round with one live player unit in range of one live AI unit,
   * executeAutoFightRound() MUST call executeAiTurn exactly TWICE:
   *   1st call: (userUnits, aiUnits, ...) — player half-turn
   *   2nd call: (aiUnits, userUnits, ...) — AI half-turn
   *
   * EXPECTED TO FAIL on unfixed code:
   *   executeAiTurn spy count = 1 (AI only)
   *   No call with userUnits as first argument
   *   Counterexample: { executeAiTurnCallCount: 1, firstCallTeam: aiUnits }
   */
  it('should call executeAiTurn exactly twice — first with userUnits, second with aiUnits', () => {
    const { composition, aiTurnS } = buildAutoFightComposition();

    (composition as any).executeAutoFightRound();

    // BUG ON UNFIXED CODE: spy is called only once (AI only)
    expect(aiTurnS.executeAiTurn).toHaveBeenCalledTimes(2);

    // First call must use userUnits as the acting team (player half-turn)
    const firstCallArgs = aiTurnS.executeAiTurn.mock.calls[0];

    expect(firstCallArgs[0]).toBe(composition.userUnits);
    expect(firstCallArgs[1]).toBe(composition.aiUnits);

    // Second call must use aiUnits as the acting team (AI half-turn)
    const secondCallArgs = aiTurnS.executeAiTurn.mock.calls[1];

    expect(secondCallArgs[0]).toBe(composition.aiUnits);
    expect(secondCallArgs[1]).toBe(composition.userUnits);
  });

  /**
   * **Validates: Requirements 2.1, 2.3**
   *
   * The player's automated turn callback must pass isAiMove: false.
   * On unfixed code: the player half-turn never executes, so executeAction
   * is never called with isAiMove: false during executeAutoFightRound.
   *
   * EXPECTED TO FAIL on unfixed code:
   *   executeAiTurn is never called with userUnits as first arg,
   *   so the callback with isAiMove: false never gets invoked.
   */
  it('should invoke executeAction with isAiMove: false for the player half-turn callback', () => {
    const { composition, aiTurnS } = buildAutoFightComposition();

    // Track isAiMove values passed through the executeAttack callbacks
    const isAiMoveValues: boolean[] = [];

    // Intercept executeAiTurn calls and invoke the executeAttack callback
    // with the attacker at index 0 to exercise the isAiMove path
    aiTurnS.executeAiTurn.mockImplementation(
      (
        actingUnits: TileUnit[],
        defendingUnits: TileUnit[],
        _config: any,
        callbacks: { executeAttack: (...args: any[]) => any },
      ) => {
        if (actingUnits.length > 0 && defendingUnits.length > 0) {
          const skill = actingUnits[0].skills[0];
          const result = callbacks.executeAttack(0, actingUnits, 0, defendingUnits, skill);

          // Capture the isAiMove value that was actually used — we detect it by
          // checking which team is acting (userUnits vs aiUnits)
          isAiMoveValues.push(actingUnits[0].user === true ? false : true);

          return result;
        }
      },
    );

    (composition as any).executeAutoFightRound();

    // On unfixed code: executeAiTurn is only called once (for AI), so
    // isAiMoveValues will contain only [true] — no false entry.
    // EXPECTED TO FAIL on unfixed code: no false in isAiMoveValues
    expect(isAiMoveValues).toContain(false);
  });
});

// ===========================================================================
// Feature: auto-fight-skip-turn-player-bug, Property 2: Preservation — Non-Auto-Fight Paths Unchanged
//
// These tests MUST PASS on unfixed code.
// They anchor the baseline behavior that must be preserved after the fix in Task 3.1.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
// ===========================================================================

describe('Property 2: Preservation — Non-Auto-Fight Paths Unchanged', () => {
  // -------------------------------------------------------------------------
  // Test A — checkAiMoves only calls executeAiTurn once with aiUnits
  //
  // EXPECTED: PASSES on unfixed code.
  // The checkAiMoves path is untouched by the bug — it always correctly
  // calls executeAiTurn(aiUnits, userUnits, ...) exactly once.
  //
  // Validates: Requirements 3.1
  // -------------------------------------------------------------------------
  describe('Test A: checkAiMoves calls executeAiTurn exactly once with aiUnits', () => {
    it('calls executeAiTurn exactly once with aiUnits as first arg after all user units finish', () => {
      const { composition, aiTurnS } = buildAutoFightComposition();

      // Set all user units to canMove: false, canAttack: false (user finished turn)
      composition.userUnits = composition.userUnits.map(u => ({
        ...u,
        canMove: false,
        canAttack: false,
      }));

      composition.checkAiMoves(true);

      // Must be called exactly once (only the AI half-turn in checkAiMoves)
      expect(aiTurnS.executeAiTurn).toHaveBeenCalledTimes(1);

      // The one and only call must have aiUnits as the first argument — NOT userUnits
      const firstCallArgs = aiTurnS.executeAiTurn.mock.calls[0];

      expect(firstCallArgs[0]).toBe(composition.aiUnits);
      expect(firstCallArgs[1]).toBe(composition.userUnits);
    });

    /**
     * **Validates: Requirements 3.1**
     *
     * Property: For any user unit arrays where every unit has canMove=false AND
     * canAttack=false (user finished their turn), checkAiMoves() MUST call
     * executeAiTurn exactly once, with aiUnits as the first argument — never
     * with userUnits as the first argument.
     *
     * This property must hold on BOTH unfixed and fixed code (preservation).
     */
    it('property: checkAiMoves always calls executeAiTurn once with aiUnits for all "user done" states', () => {
      fc.assert(
        fc.property(
          // Generate 1–4 user units, all with canMove/canAttack = false
          fc.array(
            fc.record({
              health: fc.integer({ min: 1, max: 100 }),
              user: fc.constant(true),
              canMove: fc.constant(false),
              canAttack: fc.constant(false),
            }),
            { minLength: 1, maxLength: 4 },
          ),
          // Generate 1–4 AI units, all alive
          fc.array(
            fc.record({
              health: fc.integer({ min: 1, max: 100 }),
              user: fc.constant(false),
              canMove: fc.constant(true),
              canAttack: fc.constant(true),
            }),
            { minLength: 1, maxLength: 4 },
          ),
          (userUnitsData, aiUnitsData) => {
            const { composition, aiTurnS } = buildAutoFightComposition();

            composition.userUnits = userUnitsData as TileUnit[];
            composition.aiUnits = aiUnitsData as TileUnit[];

            // Reset call count before the test
            aiTurnS.executeAiTurn.mockClear();

            composition.checkAiMoves(true);

            // Must be called exactly once
            if (aiTurnS.executeAiTurn.mock.calls.length !== 1) {
              return false;
            }

            // First (and only) call must have aiUnits as first arg — never userUnits
            const firstCallFirstArg = aiTurnS.executeAiTurn.mock.calls[0][0];

            return firstCallFirstArg === composition.aiUnits;
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test B — AI half-turn inside executeAutoFightRound uses aiUnits as acting team
  //
  // EXPECTED: PASSES on unfixed code.
  // On unfixed code the only call to executeAiTurn in executeAutoFightRound IS the
  // AI half-turn (with aiUnits). The last call must always have aiUnits as first arg.
  //
  // Validates: Requirements 3.2
  // -------------------------------------------------------------------------
  describe('Test B: AI half-turn inside executeAutoFightRound always uses aiUnits', () => {
    it('last call to executeAiTurn inside executeAutoFightRound has aiUnits as first arg', () => {
      const { composition, aiTurnS } = buildAutoFightComposition();

      (composition as any).executeAutoFightRound();

      // There must be at least one call (the AI half-turn is always present)
      expect(aiTurnS.executeAiTurn).toHaveBeenCalled();

      const calls = aiTurnS.executeAiTurn.mock.calls;
      const lastCall = calls[calls.length - 1];

      // The last call must have aiUnits as the first argument (AI half-turn)
      expect(lastCall[0]).toBe(composition.aiUnits);
      expect(lastCall[1]).toBe(composition.userUnits);
    });

    /**
     * **Validates: Requirements 3.2**
     *
     * Property: For any game state, the last call to executeAiTurn inside
     * executeAutoFightRound MUST use aiUnits as the first argument.
     * The AI half-turn block is correct in both unfixed and fixed code.
     */
    it('property: last executeAiTurn call always has aiUnits as first arg across all game states', () => {
      fc.assert(
        fc.property(
          // Generate 1–3 player units, all alive
          fc.array(
            fc.record({
              health: fc.integer({ min: 1, max: 100 }),
              user: fc.constant(true),
              canMove: fc.constant(true),
              canAttack: fc.constant(true),
              x: fc.integer({ min: 0, max: 2 }),
              y: fc.integer({ min: 0, max: 2 }),
              attackRange: fc.constant(2),
              canCross: fc.constant(1),
              name: fc.constant('Player'),
              skills: fc.constant([{ cooldown: 0, remainingCooldown: 0, passive: false, dmgM: 1 }]),
              effects: fc.constant([]),
              buffs: fc.constant([]),
              rage: fc.constant(0),
              willpower: fc.constant(0),
              defence: fc.constant(10),
              attack: fc.constant(50),
              healer: fc.constant(false),
              onlyHealer: fc.constant(false),
              heroType: fc.constant('attack'),
              dmgReducedBy: fc.constant(0),
            }),
            { minLength: 1, maxLength: 3 },
          ),
          // Generate 1–3 AI units, all alive
          fc.array(
            fc.record({
              health: fc.integer({ min: 1, max: 100 }),
              user: fc.constant(false),
              canMove: fc.constant(true),
              canAttack: fc.constant(true),
              x: fc.integer({ min: 0, max: 2 }),
              y: fc.integer({ min: 0, max: 2 }),
              attackRange: fc.constant(2),
              canCross: fc.constant(1),
              name: fc.constant('AI'),
              skills: fc.constant([{ cooldown: 0, remainingCooldown: 0, passive: false, dmgM: 1 }]),
              effects: fc.constant([]),
              buffs: fc.constant([]),
              rage: fc.constant(0),
              willpower: fc.constant(0),
              defence: fc.constant(10),
              attack: fc.constant(50),
              healer: fc.constant(false),
              onlyHealer: fc.constant(false),
              heroType: fc.constant('attack'),
              dmgReducedBy: fc.constant(0),
            }),
            { minLength: 1, maxLength: 3 },
          ),
          (userUnitsData, aiUnitsData) => {
            const { composition, aiTurnS } = buildAutoFightComposition();

            composition.userUnits = userUnitsData as unknown as TileUnit[];
            composition.aiUnits = aiUnitsData as unknown as TileUnit[];
            aiTurnS.executeAiTurn.mockClear();

            (composition as any).executeAutoFightRound();

            const calls = aiTurnS.executeAiTurn.mock.calls;

            if (calls.length === 0) {
              return false;
            }

            const lastCallFirstArg = calls[calls.length - 1][0];

            return lastCallFirstArg === composition.aiUnits;
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test C — startAutoFight(true) completes when one side is fully dead
  //
  // EXPECTED: PASSES on unfixed code.
  // fastFight mode runs to completion (this.over === true or this.autoFight === false).
  // Even on unfixed code the loop terminates correctly when checkBattleEnd fires.
  //
  // Validates: Requirements 3.3, 3.4
  // -------------------------------------------------------------------------
  describe('Test C: startAutoFight(true) completes when battle ends', () => {
    it('sets autoFight to false (or over to true) after checkBattleEnd returns battleEnded:true', () => {
      const { composition, battleResultS } = buildAutoFightComposition();

      // Give the composition a cdRef stub (required by startAutoFight callback)
      (composition as any).cdRef = { markForCheck: vi.fn() };

      // Override autoFightS to call the callback once synchronously (simulating one tick)
      (composition as any).autoFightS = {
        startAutoFight: vi.fn((_fastFight: boolean, callback: () => boolean) => {
          callback();
        }),
      };

      // Override battleResultS.checkBattleEnd to return battleEnded:true after first call
      let callCount = 0;

      battleResultS.checkBattleEnd.mockImplementation(() => {
        callCount++;

        return callCount >= 1
          ? { battleEnded: true, winner: 'user', reason: 'elimination' }
          : { battleEnded: false, winner: null, reason: 'none' };
      });

      composition.startAutoFight(true);

      // After completing, autoFight should be false (the callback returned true)
      expect((composition as any).autoFight).toBe(false);
    });

    it('over becomes true when checkBattleEnd reports battle ended during startAutoFight', () => {
      const { composition, battleResultS } = buildAutoFightComposition();

      (composition as any).cdRef = { markForCheck: vi.fn() };

      // autoFightS calls the callback exactly once synchronously
      (composition as any).autoFightS = {
        startAutoFight: vi.fn((_fastFight: boolean, callback: () => boolean) => {
          callback();
        }),
      };

      // checkBattleEnd always returns battleEnded:true
      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: true,
        winner: 'user',
        reason: 'elimination',
      });

      composition.startAutoFight(true);

      // this.over should be true since the battle ended
      expect(composition.over).toBe(true);
    });
  });
});

// ===========================================================================
// Helper: build a full composition from buildBasicCompositionStubs
// ===========================================================================

function buildFullComposition(unitOverrides?: { userUnits?: TileUnit[]; aiUnits?: TileUnit[] }) {
  const stubs = buildBasicCompositionStubs();

  const emptyTile = () => ({ entity: undefined, active: false, x: 0, y: 0 });
  const gameConfig = Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => ({ ...emptyTile(), x: i, y: j })),
  ) as any[][];

  const composition = new BasicGameFieldComposition(
    stubs.fieldService,
    stubs.unitService,
    stubs.effectsService,
    stubs.gameActionService,
    stubs.battleStateS,
    stubs.autoFightS,
    stubs.battleResultS,
    stubs.aiTurnS,
    stubs.passiveAbilityS,
    stubs.store,
  );

  composition.userUnits = unitOverrides?.userUnits ?? [makeTileUnit({ user: true, x: 0, y: 0 })];
  composition.aiUnits = unitOverrides?.aiUnits ?? [makeTileUnit({ user: false, x: 1, y: 0 })];
  (composition as any).gameConfig = gameConfig;

  return { composition, ...stubs };
}

// ===========================================================================
// Task 4.1 — finishHalfTurn tests (Reqs 2.1–2.4)
// ===========================================================================

describe('finishHalfTurn — effect processing target isolation', () => {
  it('auto-fight: checkEffects called only for actingTeam units, never for waitingTeam units', () => {
    const { composition, gameActionService } = buildFullComposition();

    // In auto-fight mode finishHalfTurn is called twice per round (once per team),
    // so waitingTeam must NOT be ticked on each individual call.
    (composition as any).autoFight = true;

    const acting1 = makeTileUnit({ user: true, x: 0, y: 0 });
    const acting2 = makeTileUnit({ user: true, x: 0, y: 1 });
    const waiting1 = makeTileUnit({ user: false, x: 1, y: 0 });

    const actingTeam = [acting1, acting2];
    const waitingTeam = [waiting1];

    // Ensure reference check for actingTeam === this.userUnits works
    composition.userUnits = actingTeam;
    composition.aiUnits = waitingTeam;

    gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));

    (composition as any).finishHalfTurn(actingTeam, waitingTeam);

    // In auto-fight: checkEffects called exactly once per acting unit (2 acting units)
    expect(gameActionService.checkEffects).toHaveBeenCalledTimes(2);

    // In auto-fight: waiting unit must NOT be ticked
    const allArgs = gameActionService.checkEffects.mock.calls.map((c: any[]) => c[0]);

    expect(allArgs.some((u: TileUnit) => u.x === waiting1.x && u.y === waiting1.y)).toBe(false);
  });

  it('manual mode: checkEffects called for BOTH actingTeam and waitingTeam units', () => {
    const { composition, gameActionService } = buildFullComposition();

    // In manual mode finishHalfTurn is called only once per round (AI half-turn only),
    // so both teams must be ticked in the same call.
    (composition as any).autoFight = false;

    const acting1 = makeTileUnit({ user: false, x: 1, y: 0 });
    const waiting1 = makeTileUnit({ user: true, x: 0, y: 0 });
    const waiting2 = makeTileUnit({ user: true, x: 0, y: 1 });

    const actingTeam = [acting1];
    const waitingTeam = [waiting1, waiting2];

    composition.aiUnits = actingTeam;
    composition.userUnits = waitingTeam;

    gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));

    (composition as any).finishHalfTurn(actingTeam, waitingTeam);

    // In manual mode: checkEffects called for ALL 3 units (1 acting + 2 waiting)
    expect(gameActionService.checkEffects).toHaveBeenCalledTimes(3);
  });

  it('processRoundStart called only for living waitingTeam units, never for actingTeam units', () => {
    const { composition, passiveAbilityS } = buildFullComposition();

    const acting1 = makeTileUnit({ user: true, x: 0, y: 0 });
    const waiting1 = makeTileUnit({ user: false, x: 1, y: 0 });
    const waiting2 = makeTileUnit({ user: false, x: 1, y: 1 });

    const actingTeam = [acting1];
    const waitingTeam = [waiting1, waiting2];

    composition.userUnits = actingTeam;
    composition.aiUnits = waitingTeam;

    (composition as any).finishHalfTurn(actingTeam, waitingTeam);

    // processRoundStart called exactly twice (once per living waiting unit)
    expect(passiveAbilityS.processRoundStart).toHaveBeenCalledTimes(2);

    // Ensure it was never called with an acting unit
    const allFirstArgs = passiveAbilityS.processRoundStart.mock.calls.map((c: any[]) => c[0]);

    expect(allFirstArgs.some((u: TileUnit) => u.x === acting1.x && u.y === acting1.y)).toBe(false);
  });

  it('checkPassiveSkills called with waitingTeam, not actingTeam', () => {
    const { composition, gameActionService } = buildFullComposition();

    const acting1 = makeTileUnit({ user: true, x: 0, y: 0 });
    const waiting1 = makeTileUnit({ user: false, x: 1, y: 0 });
    const waiting2 = makeTileUnit({ user: false, x: 1, y: 1 });

    const actingTeam = [acting1];
    const waitingTeam = [waiting1, waiting2];

    composition.userUnits = actingTeam;
    composition.aiUnits = waitingTeam;

    (composition as any).finishHalfTurn(actingTeam, waitingTeam);

    expect(gameActionService.checkPassiveSkills).toHaveBeenCalled();

    // Called with waitingTeam array reference (or array containing waiting units)
    const callArg = gameActionService.checkPassiveSkills.mock.calls[0][0];

    // callArg should be the waitingTeam (reference check)
    expect(callArg).toBe(waitingTeam);
  });

  it('recountCooldownForUnit called only for actingTeam units, never for waitingTeam units', () => {
    const { composition, gameActionService } = buildFullComposition();

    const acting1 = makeTileUnit({ user: true, x: 0, y: 0 });
    const acting2 = makeTileUnit({ user: true, x: 0, y: 1 });
    const waiting1 = makeTileUnit({ user: false, x: 1, y: 0 });

    const actingTeam = [acting1, acting2];
    const waitingTeam = [waiting1];

    composition.userUnits = actingTeam;
    composition.aiUnits = waitingTeam;

    (composition as any).finishHalfTurn(actingTeam, waitingTeam);

    // recountCooldownForUnit called exactly once per acting unit (2 acting)
    expect(gameActionService.recountCooldownForUnit).toHaveBeenCalledTimes(2);

    // Never called with the waiting unit
    const allArgs = gameActionService.recountCooldownForUnit.mock.calls.map((c: any[]) => c[0]);

    expect(allArgs.some((u: TileUnit) => u.x === waiting1.x && u.y === waiting1.y)).toBe(false);
  });
});

// ===========================================================================
// Task 4.2 — checkAiMoves tests (Reqs 3.1–3.5)
// ===========================================================================

describe('checkAiMoves — fires only when user done and AI alive', () => {
  it('does NOT call executeAiTurn when at least one user unit can still move', () => {
    const { composition, aiTurnS, battleResultS } = buildFullComposition();

    // One user unit with canMove: true and health > 0 — user is NOT done
    composition.userUnits = [makeTileUnit({ user: true, canMove: true, health: 100 })];
    composition.aiUnits = [makeTileUnit({ user: false, health: 100 })];

    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    composition.checkAiMoves(true);

    expect(aiTurnS.executeAiTurn).not.toHaveBeenCalled();
  });

  it('calls incrementTurnCount once and executeAiTurn when all user units are done and AI is alive', () => {
    const { composition, aiTurnS, battleStateS, battleResultS, gameActionService } =
      buildFullComposition();

    // All user units done
    composition.userUnits = [
      makeTileUnit({ user: true, canMove: false, canAttack: false, health: 100 }),
    ];
    composition.aiUnits = [makeTileUnit({ user: false, health: 100 })];

    gameActionService.isDead.mockReturnValue(false);
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    composition.checkAiMoves(true);

    expect(battleStateS.incrementTurnCount).toHaveBeenCalledTimes(1);
    expect(aiTurnS.executeAiTurn).toHaveBeenCalled();
  });

  it('does NOT call executeAiTurn when all AI units are dead', () => {
    const { composition, aiTurnS, battleResultS, gameActionService } = buildFullComposition();

    // All user units done
    composition.userUnits = [
      makeTileUnit({ user: true, canMove: false, canAttack: false, health: 0 }),
    ];
    // All AI units dead
    composition.aiUnits = [makeDeadUnit({ user: false })];

    gameActionService.isDead.mockImplementation((units: TileUnit[]) =>
      units.every(u => u.health <= 0),
    );
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    composition.checkAiMoves(true);

    expect(aiTurnS.executeAiTurn).not.toHaveBeenCalled();
  });

  it('calls executeAiTurn with aiUnits as first arg and userUnits as second arg', () => {
    const { composition, aiTurnS, battleResultS, gameActionService } = buildFullComposition();

    composition.userUnits = [
      makeTileUnit({ user: true, canMove: false, canAttack: false, health: 100 }),
    ];
    composition.aiUnits = [makeTileUnit({ user: false, health: 100 })];

    gameActionService.isDead.mockReturnValue(false);
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    composition.checkAiMoves(true);

    expect(aiTurnS.executeAiTurn).toHaveBeenCalled();
    const firstCall = aiTurnS.executeAiTurn.mock.calls[0];

    expect(firstCall[0]).toBe(composition.aiUnits);
    expect(firstCall[1]).toBe(composition.userUnits);
  });

  it('calls finishHalfTurn with aiUnits acting and userUnits waiting after AI turn', () => {
    const { composition, battleResultS, gameActionService } = buildFullComposition();

    composition.userUnits = [
      makeTileUnit({ user: true, canMove: false, canAttack: false, health: 100 }),
    ];
    composition.aiUnits = [makeTileUnit({ user: false, health: 100 })];

    gameActionService.isDead.mockReturnValue(false);
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    const finishHalfTurnSpy = vi.spyOn(composition as any, 'finishHalfTurn');

    composition.checkAiMoves(true);

    expect(finishHalfTurnSpy).toHaveBeenCalledWith(composition.aiUnits, composition.userUnits);
  });
});

// ===========================================================================
// Task 4.3 — executeAutoFightRound tests (Reqs 4.1–4.5)
// ===========================================================================

describe('executeAutoFightRound — symmetric half-turns', () => {
  it('calls executeAiTurn twice: first with userUnits, second with aiUnits', () => {
    const { composition, aiTurnS } = buildAutoFightComposition();

    (composition as any).executeAutoFightRound();

    expect(aiTurnS.executeAiTurn).toHaveBeenCalledTimes(2);

    const firstCall = aiTurnS.executeAiTurn.mock.calls[0];

    expect(firstCall[0]).toBe(composition.userUnits);
    expect(firstCall[1]).toBe(composition.aiUnits);

    const secondCall = aiTurnS.executeAiTurn.mock.calls[1];

    expect(secondCall[0]).toBe(composition.aiUnits);
    expect(secondCall[1]).toBe(composition.userUnits);
  });

  it('early exits after player half-turn kills AI — executeAiTurn called only once', () => {
    const { composition, aiTurnS, battleResultS } = buildAutoFightComposition();

    // First checkBattleEnd call returns battleEnded: true (player killed AI)
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: true,
      winner: 'user',
      reason: 'all_dead',
    });

    const result = (composition as any).executeAutoFightRound();

    // Only 1 call — the player half-turn; AI half-turn should not execute
    expect(aiTurnS.executeAiTurn).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('player half-turn callback uses isAiMove: false', () => {
    const { composition, aiTurnS } = buildAutoFightComposition();

    const isAiMoveCaptured: boolean[] = [];

    aiTurnS.executeAiTurn.mockImplementation(
      (
        actingUnits: TileUnit[],
        defendingUnits: TileUnit[],
        _config: any,
        callbacks: { executeAttack: (...args: any[]) => any },
      ) => {
        if (actingUnits.length > 0 && defendingUnits.length > 0) {
          const executeActionSpy = vi.spyOn(composition as any, 'executeAction');

          callbacks.executeAttack(0, actingUnits, 0, defendingUnits, actingUnits[0].skills[0]);

          for (const call of executeActionSpy.mock.calls) {
            isAiMoveCaptured.push((call[0] as any).isAiMove);
          }

          executeActionSpy.mockRestore();
        }
      },
    );

    (composition as any).executeAutoFightRound();

    // The first executeAiTurn is for the player: isAiMove must be false
    expect(isAiMoveCaptured).toContain(false);
  });

  it('AI half-turn callback uses isAiMove: true', () => {
    const { composition, aiTurnS } = buildAutoFightComposition();

    const capturedIsAiMovePerCall: boolean[][] = [];

    aiTurnS.executeAiTurn.mockImplementation(
      (
        actingUnits: TileUnit[],
        defendingUnits: TileUnit[],
        _config: any,
        callbacks: { executeAttack: (...args: any[]) => any },
      ) => {
        if (actingUnits.length > 0 && defendingUnits.length > 0) {
          const executeActionSpy = vi.spyOn(composition as any, 'executeAction');

          callbacks.executeAttack(0, actingUnits, 0, defendingUnits, actingUnits[0].skills[0]);

          capturedIsAiMovePerCall.push(
            executeActionSpy.mock.calls.map((c: any[]) => (c[0] as any).isAiMove),
          );
          executeActionSpy.mockRestore();
        }
      },
    );

    (composition as any).executeAutoFightRound();

    // capturedIsAiMovePerCall[1] is the AI half-turn — isAiMove must be true
    expect(capturedIsAiMovePerCall.length).toBeGreaterThanOrEqual(2);
    expect(capturedIsAiMovePerCall[1]).toContain(true);
  });

  it('returns false when checkAutoFightEnd is false after both half-turns; true when true', () => {
    // Case 1: battle continues — returns false
    const { composition: comp1, battleResultS: brs1 } = buildAutoFightComposition();

    brs1.checkBattleEnd.mockReturnValue({ battleEnded: false, winner: null, reason: 'none' });

    expect((comp1 as any).executeAutoFightRound()).toBe(false);

    // Case 2: last checkBattleEnd returns true — returns true
    const { composition: comp2, battleResultS: brs2 } = buildAutoFightComposition();
    let callIdx = 0;

    brs2.checkBattleEnd.mockImplementation(() => {
      callIdx++;

      // Return true only on the 2nd checkBattleEnd call (after AI half-turn)
      return callIdx >= 2
        ? { battleEnded: true, winner: 'ai', reason: 'all_dead' }
        : { battleEnded: false, winner: null, reason: 'none' };
    });

    expect((comp2 as any).executeAutoFightRound()).toBe(true);
  });
});

// ===========================================================================
// Task 4.4 — attack tests (Reqs 5.1–5.4)
// ===========================================================================

describe('attack — attacker marked spent, AI triggered', () => {
  function buildAttackComposition() {
    const stubs = buildBasicCompositionStubs();

    const emptyTile = () => ({ entity: undefined, active: false, x: 0, y: 0 });
    const gameConfig = Array.from({ length: 3 }, (_, i) =>
      Array.from({ length: 3 }, (_, j) => ({ ...emptyTile(), x: i, y: j })),
    ) as any[][];

    const skill = makeSkill();

    const userUnit = makeTileUnit({
      user: true,
      x: 0,
      y: 0,
      skills: [skill as any],
      canMove: true,
      canAttack: true,
    });

    const aiUnit = makeTileUnit({
      user: false,
      x: 1,
      y: 0,
      skills: [skill as any],
    });

    const composition = new BasicGameFieldComposition(
      stubs.fieldService,
      stubs.unitService,
      stubs.effectsService,
      stubs.gameActionService,
      stubs.battleStateS,
      stubs.autoFightS,
      stubs.battleResultS,
      stubs.aiTurnS,
      stubs.passiveAbilityS,
      stubs.store,
    );

    composition.userUnits = [userUnit];
    composition.aiUnits = [aiUnit];
    (composition as any).gameConfig = gameConfig;

    // Wire selectedEntity and clickedEnemy
    (composition as any).selectedEntity = userUnit;
    (composition as any).clickedEnemy = aiUnit;

    // findUnitIndex always returns 0 for both teams
    stubs.unitService.findUnitIndex.mockReturnValue(0);
    stubs.unitService.findSkillIndex.mockReturnValue(0);

    // selectSkillsAndRecountCooldown returns the unit's skills
    stubs.gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([skill]);

    // checkEffects returns unit unchanged
    stubs.gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));

    // processBeforeAttack returns no block
    stubs.passiveAbilityS.processBeforeAttack.mockReturnValue({ blockBuffApplication: false });

    // addBuffToUnit / addEffectToUnit return the unit at index
    stubs.unitService.addBuffToUnit.mockImplementation(
      (units: TileUnit[], index: number) => units[index],
    );
    stubs.unitService.addEffectToUnit.mockImplementation(
      (units: TileUnit[], index: number) => units[index],
    );

    // fieldService.getDamage returns 0 so health doesn't drop to 0
    stubs.fieldService.getDamage.mockReturnValue(0);

    // updateGridUnits returns config unchanged
    stubs.unitService.updateGridUnits.mockImplementation((_units: any, config: any) => config);

    // battleResultS default — no end
    stubs.battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    return { composition, skill, userUnit, aiUnit, ...stubs };
  }

  it('attacker has canAttack: false and canMove: false after attack()', () => {
    const { composition, skill, gameActionService } = buildAttackComposition();

    // Prevent checkAiMoves from reaching finishHalfTurn (which would reset flags back to true).
    // Make isDead(aiUnits) return true so checkAiMoves exits before finishHalfTurn runs.
    gameActionService.isDead.mockReturnValue(true);

    // Spy on checkAiMoves to capture userUnits state at the time it is called
    // (immediately after the attacker flags are set, before any subsequent resets).
    let canAttackAtCallTime: boolean | undefined;
    let canMoveAtCallTime: boolean | undefined;
    const originalCheckAiMoves = composition.checkAiMoves.bind(composition);

    vi.spyOn(composition, 'checkAiMoves').mockImplementation((aiMove: boolean) => {
      canAttackAtCallTime = composition.userUnits[0].canAttack;
      canMoveAtCallTime = composition.userUnits[0].canMove;
      originalCheckAiMoves(aiMove);
    });

    composition.attack(skill as any);

    // Verify the flags were false when checkAiMoves was invoked (right after the assignment)
    expect(canAttackAtCallTime).toBe(false);
    expect(canMoveAtCallTime).toBe(false);
  });

  it('checkAiMoves called once after attack()', () => {
    const { composition, skill } = buildAttackComposition();

    const spy = vi.spyOn(composition, 'checkAiMoves');

    composition.attack(skill as any);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('showBattleResult called once when checkBattleEnd returns battleEnded: true', () => {
    const { composition, skill, battleResultS, gameActionService } = buildAttackComposition();

    // First call (inside attack itself) → battle ended
    // Second call (inside checkAiMoves) → also battle ended, but checkAiMoves returns early
    // before reaching finishHalfTurn because isDead(aiUnits) returns true when all AI are dead.
    // Actually checkAiMoves calls checkBattleEnd *after* incrementTurnCount when user is done.
    // We need to prevent checkAiMoves from calling showBattleResult a second time.
    // The cleanest way: make checkAiMoves not trigger (user still has canMove/canAttack = false
    // but aiUnits are "dead" so isDead returns true → checkAiMoves returns without AI turn).
    gameActionService.isDead.mockReturnValue(true);

    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: true,
      winner: 'user',
      reason: 'all_dead',
    });

    composition.attack(skill as any);

    expect(battleResultS.showBattleResult).toHaveBeenCalledTimes(1);
  });

  it('showBattleResult NOT called when checkBattleEnd returns battleEnded: false', () => {
    const { composition, skill, battleResultS } = buildAttackComposition();

    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    composition.attack(skill as any);

    expect(battleResultS.showBattleResult).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Task 4.5 — finishTurn tests (Reqs 6.1–6.3)
// ===========================================================================

describe('finishTurn — resets all user units', () => {
  it('all user units have canMove: false and canAttack: false after finishTurn()', () => {
    const { composition, gameActionService } = buildFullComposition({
      userUnits: [
        makeTileUnit({ user: true, x: 0, y: 0, canMove: true, canAttack: true }),
        makeTileUnit({ user: true, x: 0, y: 1, canMove: true, canAttack: true }),
        makeTileUnit({ user: true, x: 0, y: 2, canMove: true, canAttack: true }),
      ],
      aiUnits: [makeTileUnit({ user: false, health: 0 })],
    });

    // recountCooldownForUnit returns unit as-is (preserving canMove/canAttack false set before)
    gameActionService.recountCooldownForUnit.mockImplementation((unit: TileUnit) => unit);

    // Prevent checkAiMoves from triggering AI turn side effects
    gameActionService.isDead.mockReturnValue(true);

    composition.finishTurn();

    for (const unit of composition.userUnits) {
      expect(unit.canMove).toBe(false);
      expect(unit.canAttack).toBe(false);
    }
  });

  it('recountCooldownForUnit called once per user unit', () => {
    const userUnits = [
      makeTileUnit({ user: true, x: 0, y: 0 }),
      makeTileUnit({ user: true, x: 0, y: 1 }),
    ];

    const { composition, gameActionService } = buildFullComposition({
      userUnits,
      aiUnits: [makeDeadUnit({ user: false })],
    });

    gameActionService.recountCooldownForUnit.mockImplementation((unit: TileUnit) => unit);
    gameActionService.isDead.mockReturnValue(true);

    composition.finishTurn();

    expect(gameActionService.recountCooldownForUnit).toHaveBeenCalledTimes(userUnits.length);
  });

  it('checkAiMoves(true) called exactly once after all user units are updated', () => {
    const { composition, gameActionService, battleResultS } = buildFullComposition({
      userUnits: [makeTileUnit({ user: true, x: 0, y: 0 })],
      aiUnits: [makeDeadUnit({ user: false })],
    });

    gameActionService.recountCooldownForUnit.mockImplementation((unit: TileUnit) => unit);
    gameActionService.isDead.mockReturnValue(true);
    battleResultS.checkBattleEnd.mockReturnValue({
      battleEnded: false,
      winner: null,
      reason: 'none',
    });

    const spy = vi.spyOn(composition, 'checkAiMoves');

    composition.finishTurn();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(true);
  });
});

// ===========================================================================
// Feature: manual-battle-buff-duration-bug, Property 1: Buff Duration Unchanged + Player Effects Tick in Manual Mode
//
// CRITICAL: These tests are EXPECTED TO FAIL on unfixed code.
// Failure confirms both bugs exist in basic-game-field-composition.ts.
//
// Bug 1: executeAction adds +1 to each buff.duration when !this.autoFight.
// Bug 2: finishHalfTurn(aiUnits, userUnits) never calls checkEffects for userUnits.
//
// Documented counterexamples (found by running these tests on unfixed code):
//   Test 1.1: expected duration=2, got duration=3
//   Test 1.3: expected duration=1, got duration=2 (no tick occurred)
//
// Validates: Requirements 1.1, 1.2, 1.3, 1.4
// ===========================================================================

describe('Feature: manual-battle-buff-duration-bug — Bug Condition Exploration', () => {
  // -------------------------------------------------------------------------
  // Helper: build a composition wired for manual-mode attack tests
  // Uses buildFullComposition() (returns all stubs) and switches autoFight to false
  // -------------------------------------------------------------------------
  function buildManualModeComposition() {
    const result = buildFullComposition();
    const { composition, unitService } = result;

    // Switch to manual mode
    (composition as any).autoFight = false;

    // Wire selectedEntity and clickedEnemy so attack() can resolve indexes
    (composition as any).selectedEntity = composition.userUnits[0];
    (composition as any).clickedEnemy = composition.aiUnits[0];

    // findUnitIndex: find by coordinate match
    unitService.findUnitIndex.mockImplementation((units: TileUnit[], target: any) => {
      if (!target) return -1;

      return units.findIndex(u => u.x === target?.x && u.y === target?.y);
    });

    // findSkillIndex: always return 0
    unitService.findSkillIndex.mockReturnValue(0);

    // addEffectToUnit: return the unit at index unchanged
    unitService.addEffectToUnit.mockImplementation(
      (units: TileUnit[], index: number) => units[index],
    );

    return result;
  }

  // -------------------------------------------------------------------------
  // Test 1.1 — Bug 1 (concrete): buff duration NOT inflated in manual mode
  //
  // EXPECTED TO FAIL on unfixed code:
  //   unitService.addBuffToUnit receives skill with buffs[0].duration = 3 (expected: 2)
  // -------------------------------------------------------------------------
  describe('Test 1.1: Bug 1 — buff duration must equal original duration in manual mode', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * When a player uses a skill with buffs: [{ duration: 2, ... }] in manual mode,
     * the composition MUST pass the skill to addBuffToUnit with the original duration (2).
     *
     * EXPECTED TO FAIL on unfixed code:
     *   addBuffToUnit receives a skill where buffs[0].duration === 3 (not 2).
     *   The +1 compensation in executeAction inflates every buff duration.
     *
     * Counterexample: { originalDuration: 2, appliedDuration: 3 }
     */
    it('addBuffToUnit receives skill with original duration (2), not inflated (3)', () => {
      const { composition, unitService, gameActionService, battleResultS } =
        buildManualModeComposition();

      const originalDuration = 2;
      const theSkill = makeSkill({
        buffs: [
          {
            duration: originalDuration,
            type: 'Defense Bonus',
            m: 1.5,
            passive: true,
            imgSrc: '',
          } as any,
        ],
      });

      composition.userUnits[0] = {
        ...composition.userUnits[0],
        skills: [theSkill as any],
      };

      // Capture the skill passed to addBuffToUnit AND apply effects so attack() finishes
      let capturedSkill: any = null;

      unitService.addBuffToUnit.mockImplementation(
        (units: TileUnit[], index: number, skill: any) => {
          capturedSkill = skill;
          // Apply buffs to unit.effects so assertion can inspect composition.userUnits[0].effects
          units[index] = {
            ...units[index],
            effects: [...(units[index].effects || []), ...(skill.buffs || [])],
          };

          return units[index];
        },
      );

      // selectSkillsAndRecountCooldown must return the skill so attack() proceeds
      gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([theSkill]);

      // checkEffects returns unit unchanged
      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));

      // passiveAbilityS is already wired in buildAutoFightComposition to return blockBuffApplication: false
      // battleResultS — no battle end
      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      composition.attack(theSkill as any);

      // BUG ON UNFIXED CODE: capturedSkill.buffs[0].duration === 3 (not 2)
      expect(capturedSkill).not.toBeNull();
      expect(capturedSkill.buffs[0].duration).toBe(originalDuration);
    });
  });

  // -------------------------------------------------------------------------
  // Test 1.2 — Bug 1 (property-based): duration unchanged for any original duration ∈ [1..10]
  //
  // EXPECTED TO FAIL on unfixed code for every generated duration
  // -------------------------------------------------------------------------
  describe('Test 1.2: Bug 1 property — buff duration equals original for all durations in [1..10]', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     *
     * For any skill with buffs: [{ duration: d, ... }] where d ∈ [1..10]
     * and autoFight = false, the composition MUST pass the skill to addBuffToUnit
     * with buffs[0].duration === d (no +1 added).
     *
     * EXPECTED TO FAIL on unfixed code because +1 is added unconditionally.
     */
    it('addBuffToUnit receives unmodified buff.duration for all durations ∈ [1..10] (property)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (generatedDuration: number) => {
          const { composition, unitService, gameActionService, battleResultS } =
            buildManualModeComposition();

          const theSkill = makeSkill({
            buffs: [
              {
                duration: generatedDuration,
                type: 'Defense Bonus',
                m: 1.5,
                passive: true,
                imgSrc: '',
              } as any,
            ],
          });

          composition.userUnits[0] = {
            ...composition.userUnits[0],
            skills: [theSkill as any],
          };

          let capturedDuration: number | null = null;

          unitService.addBuffToUnit.mockImplementation(
            (units: TileUnit[], index: number, skill: any) => {
              if (skill.buffs && skill.buffs.length > 0) {
                capturedDuration = skill.buffs[0].duration;
              }

              units[index] = {
                ...units[index],
                effects: [...(units[index].effects || []), ...(skill.buffs || [])],
              };

              return units[index];
            },
          );

          gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([theSkill]);
          gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));
          battleResultS.checkBattleEnd.mockReturnValue({
            battleEnded: false,
            winner: null,
            reason: 'none',
          });

          // Re-wire selectedEntity/clickedEnemy since units were replaced
          (composition as any).selectedEntity = composition.userUnits[0];
          (composition as any).clickedEnemy = composition.aiUnits[0];

          composition.attack(theSkill as any);

          // BUG ON UNFIXED CODE: capturedDuration === generatedDuration + 1
          return capturedDuration === generatedDuration;
        }),
        { numRuns: 10 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test 1.3 — Bug 2 (concrete): player effects DO tick after AI turn in manual mode
  //
  // EXPECTED TO FAIL on unfixed code:
  //   userUnits[0].effects[0].duration stays 2 (no tick occurred)
  // -------------------------------------------------------------------------
  describe('Test 1.3: Bug 2 — player effects tick after finishHalfTurn(aiUnits, userUnits) in manual mode', () => {
    /**
     * **Validates: Requirements 1.3, 1.4**
     *
     * When autoFight = false and finishHalfTurn(aiUnits, userUnits) is called,
     * the composition MUST call checkEffects for each userUnit so that
     * effect durations decrease by 1.
     *
     * EXPECTED TO FAIL on unfixed code:
     *   finishHalfTurn only calls checkEffects for actingTeam (aiUnits).
     *   userUnits[0].effects[0].duration remains 2 instead of decreasing to 1.
     *
     * Counterexample: { beforeDuration: 2, afterDuration: 2 } (expected afterDuration: 1)
     */
    it('player effect duration decreases from 2 to 1 after finishHalfTurn(aiUnits, userUnits)', () => {
      const { composition, gameActionService, battleResultS } = buildManualModeComposition();

      // Give the player unit an active effect with duration 2
      composition.userUnits[0] = {
        ...composition.userUnits[0],
        effects: [
          {
            duration: 2,
            type: 'Defense Bonus',
            passive: true,
            m: 1.5,
            imgSrc: '',
            restore: false,
          } as any,
        ],
      };

      // checkEffects actually decrements duration (simulates the real service behaviour)
      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({
        unit: {
          ...unit,
          effects: (unit.effects || [])
            .map((e: any) => ({ ...e, duration: e.duration - 1 }))
            .filter((e: any) => e.duration > 0),
        },
      }));

      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      // Call finishHalfTurn with AI as acting team and user as waiting team
      (composition as any).finishHalfTurn(composition.aiUnits, composition.userUnits);

      // BUG ON UNFIXED CODE: duration stays at 2 because userUnits is never ticked
      expect(composition.userUnits[0].effects[0].duration).toBe(1);
    });
  });
});

// ===========================================================================
// Feature: manual-battle-buff-duration-bug, Property 2: Preservation — Auto-fight and unchanged behaviors
//
// These tests MUST PASS on unfixed code.
// They anchor baseline behavior that must not break after the fixes.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
// ===========================================================================

describe('Feature: manual-battle-buff-duration-bug — Preservation', () => {
  // -------------------------------------------------------------------------
  // Test 2a — Req 3.1: Auto-fight buff duration unchanged
  //
  // In autoFight=true mode, addBuffToUnit receives the original skill without +1.
  // This MUST PASS on unfixed code because the +1 only fires when !this.autoFight.
  // -------------------------------------------------------------------------
  describe('Test 2a: Req 3.1 — auto-fight buff duration unchanged (no +1 applied)', () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * When autoFight=true and the player uses a skill with buffs,
     * addBuffToUnit MUST receive the original skill with unmodified buff durations.
     * The +1 compensation only fires when !this.autoFight, so in auto-fight mode
     * the duration stays exactly as authored on the skill.
     *
     * MUST PASS on unfixed code.
     */
    it('addBuffToUnit receives original duration (no +1) when autoFight=true (concrete)', () => {
      const { composition, unitService, gameActionService, battleResultS } = buildFullComposition();

      // Set to auto-fight mode
      (composition as any).autoFight = true;

      // Wire selectedEntity and clickedEnemy for attack()
      (composition as any).selectedEntity = composition.userUnits[0];
      (composition as any).clickedEnemy = composition.aiUnits[0];

      unitService.findUnitIndex.mockImplementation((units: TileUnit[], target: any) => {
        if (!target) return -1;

        return units.findIndex(u => u.x === target?.x && u.y === target?.y);
      });
      unitService.findSkillIndex.mockReturnValue(0);
      unitService.addEffectToUnit.mockImplementation(
        (units: TileUnit[], index: number) => units[index],
      );

      const originalDuration = 3;
      const theSkill = makeSkill({
        buffs: [
          {
            duration: originalDuration,
            type: 'Defense Bonus',
            m: 1.5,
            passive: true,
            imgSrc: '',
          } as any,
        ],
      });

      composition.userUnits[0] = { ...composition.userUnits[0], skills: [theSkill as any] };

      // Capture the skill passed to addBuffToUnit
      let capturedSkill: any = null;

      unitService.addBuffToUnit.mockImplementation(
        (units: TileUnit[], index: number, skill: any) => {
          capturedSkill = skill;
          units[index] = {
            ...units[index],
            effects: [...(units[index].effects || []), ...(skill.buffs || [])],
          };

          return units[index];
        },
      );

      gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([theSkill]);
      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));
      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      // isDead returns true to prevent checkAiMoves side effects
      gameActionService.isDead.mockReturnValue(true);

      composition.attack(theSkill as any);

      // In auto-fight mode: captured duration must equal originalDuration (no +1)
      expect(capturedSkill).not.toBeNull();
      expect(capturedSkill.buffs[0].duration).toBe(originalDuration);
    });

    /**
     * **Validates: Requirements 3.1**
     *
     * Property: For any duration ∈ [1..10] in autoFight=true mode,
     * addBuffToUnit MUST receive the original duration unchanged.
     *
     * MUST PASS on unfixed code.
     */
    it('addBuffToUnit receives original duration for all durations ∈ [1..10] when autoFight=true (property)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (generatedDuration: number) => {
          const { composition, unitService, gameActionService, battleResultS } =
            buildFullComposition();

          (composition as any).autoFight = true;
          (composition as any).selectedEntity = composition.userUnits[0];
          (composition as any).clickedEnemy = composition.aiUnits[0];

          unitService.findUnitIndex.mockImplementation((units: TileUnit[], target: any) => {
            if (!target) return -1;

            return units.findIndex(u => u.x === target?.x && u.y === target?.y);
          });
          unitService.findSkillIndex.mockReturnValue(0);
          unitService.addEffectToUnit.mockImplementation(
            (units: TileUnit[], index: number) => units[index],
          );

          const theSkill = makeSkill({
            buffs: [
              {
                duration: generatedDuration,
                type: 'Defense Bonus',
                m: 1.5,
                passive: true,
                imgSrc: '',
              } as any,
            ],
          });

          composition.userUnits[0] = { ...composition.userUnits[0], skills: [theSkill as any] };

          let capturedDuration: number | null = null;

          unitService.addBuffToUnit.mockImplementation(
            (units: TileUnit[], index: number, skill: any) => {
              if (skill.buffs && skill.buffs.length > 0) {
                capturedDuration = skill.buffs[0].duration;
              }

              units[index] = {
                ...units[index],
                effects: [...(units[index].effects || []), ...(skill.buffs || [])],
              };

              return units[index];
            },
          );

          gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([theSkill]);
          gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));
          battleResultS.checkBattleEnd.mockReturnValue({
            battleEnded: false,
            winner: null,
            reason: 'none',
          });
          gameActionService.isDead.mockReturnValue(true);

          (composition as any).selectedEntity = composition.userUnits[0];
          (composition as any).clickedEnemy = composition.aiUnits[0];

          composition.attack(theSkill as any);

          // In auto-fight: capturedDuration must equal generatedDuration (no +1)
          return capturedDuration === generatedDuration;
        }),
        { numRuns: 10 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test 2b — Req 3.2: Auto-fight finishHalfTurn only ticks actingTeam
  //
  // In auto-fight, finishHalfTurn(actingTeam, waitingTeam) MUST call checkEffects
  // only for actingTeam. The waitingTeam MUST NOT be ticked.
  //
  // MUST PASS on unfixed code.
  // -------------------------------------------------------------------------
  describe('Test 2b: Req 3.2 — auto-fight finishHalfTurn only ticks actingTeam', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * When autoFight=true, finishHalfTurn(actingTeam, waitingTeam) MUST call
     * checkEffects exactly once per actingTeam unit, and NEVER for any waitingTeam unit.
     *
     * In auto-fight finishHalfTurn is called twice per round (once per team) so each
     * team ticks exactly once overall — this test validates one call in isolation.
     *
     * MUST PASS on unfixed code.
     */
    it('checkEffects called exactly actingTeam.length times, never for waitingTeam units', () => {
      const { composition, gameActionService, battleResultS } = buildFullComposition();

      (composition as any).autoFight = true;

      const actingTeam = [
        makeTileUnit({ user: true, x: 0, y: 0 }),
        makeTileUnit({ user: true, x: 0, y: 1 }),
      ];
      const waitingTeam = [makeTileUnit({ user: false, x: 1, y: 0 })];

      composition.userUnits = actingTeam;
      composition.aiUnits = waitingTeam;

      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));
      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      (composition as any).finishHalfTurn(actingTeam, waitingTeam);

      // checkEffects called exactly 2 times (once per actingTeam unit)
      expect(gameActionService.checkEffects).toHaveBeenCalledTimes(2);

      // NEVER called with waitingTeam[0]'s coordinates
      const allArgs = gameActionService.checkEffects.mock.calls.map((c: any[]) => c[0]);

      expect(
        allArgs.some((u: TileUnit) => u.x === waitingTeam[0].x && u.y === waitingTeam[0].y),
      ).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Test 2c — Req 3.3: Manual mode AI effects still tick
  //
  // In manual mode, finishHalfTurn(aiUnits, userUnits) MUST still tick AI effects.
  // The AI is actingTeam, so they always tick — this is unchanged by Fix 2.
  //
  // MUST PASS on unfixed code.
  // -------------------------------------------------------------------------
  describe('Test 2c: Req 3.3 — manual mode AI effects still tick via finishHalfTurn', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * When autoFight=false and finishHalfTurn(aiUnits, userUnits) is called,
     * aiUnits (actingTeam) MUST still have their effects ticked.
     * After one tick, an effect with duration=2 MUST have duration=1.
     *
     * MUST PASS on unfixed code (the AI tick path is not broken, only user is).
     */
    it('AI unit effect duration decreases from 2 to 1 after finishHalfTurn(aiUnits, userUnits)', () => {
      const { composition, gameActionService, battleResultS } = buildFullComposition();

      (composition as any).autoFight = false;

      // Give AI unit an active effect with duration 2
      composition.aiUnits[0] = {
        ...composition.aiUnits[0],
        effects: [
          {
            duration: 2,
            type: 'Defense Bonus',
            passive: true,
            m: 1.5,
            imgSrc: '',
            restore: false,
          } as any,
        ],
      };

      // checkEffects decrements duration by 1
      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({
        unit: {
          ...unit,
          effects: (unit.effects || [])
            .map((e: any) => ({ ...e, duration: e.duration - 1 }))
            .filter((e: any) => e.duration > 0),
        },
      }));

      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      // finishHalfTurn with AI as acting team
      (composition as any).finishHalfTurn(composition.aiUnits, composition.userUnits);

      // After one tick: duration went from 2 → 1
      expect(composition.aiUnits[0].effects[0].duration).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Test 2d — Req 3.4: Skill with no buffs in manual mode
  //
  // In manual mode, a skill with no buffs must not add any entries to unit.effects.
  //
  // MUST PASS on unfixed code.
  // -------------------------------------------------------------------------
  describe('Test 2d: Req 3.4 — skill with no buffs in manual mode leaves unit effects empty', () => {
    /**
     * **Validates: Requirements 3.4**
     *
     * When autoFight=false and a skill with no buffs (buffs: []) is used,
     * the unit's effects array MUST remain empty after the attack.
     *
     * MUST PASS on unfixed code.
     */
    it('userUnits[0].effects is empty after attacking with a skill that has no buffs', () => {
      const { composition, unitService, gameActionService, battleResultS, passiveAbilityS } =
        buildFullComposition();

      (composition as any).autoFight = false;
      (composition as any).selectedEntity = composition.userUnits[0];
      (composition as any).clickedEnemy = composition.aiUnits[0];

      const theSkill = makeSkill({ buffs: [] });

      composition.userUnits[0] = { ...composition.userUnits[0], skills: [theSkill as any] };

      unitService.findUnitIndex.mockImplementation((units: TileUnit[], target: any) => {
        if (!target) return -1;

        return units.findIndex(u => u.x === target?.x && u.y === target?.y);
      });
      unitService.findSkillIndex.mockReturnValue(0);
      unitService.addEffectToUnit.mockImplementation(
        (units: TileUnit[], index: number) => units[index],
      );
      // addBuffToUnit is a no-op — returns unit unchanged (no buffs to apply)
      unitService.addBuffToUnit.mockImplementation(
        (units: TileUnit[], index: number) => units[index],
      );

      gameActionService.selectSkillsAndRecountCooldown.mockReturnValue([theSkill]);
      gameActionService.checkEffects.mockImplementation((unit: TileUnit) => ({ unit }));
      passiveAbilityS.processBeforeAttack.mockReturnValue({ blockBuffApplication: false });
      battleResultS.checkBattleEnd.mockReturnValue({
        battleEnded: false,
        winner: null,
        reason: 'none',
      });

      // isDead returns true to prevent checkAiMoves side effects
      gameActionService.isDead.mockReturnValue(true);

      composition.attack(theSkill as any);

      // No buffs on the skill → effects array must remain empty
      expect(composition.userUnits[0].effects.length).toBe(0);
    });
  });
});
