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
