import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { TestBed } from '@angular/core/testing';

import {
  makeDeadUnit,
  makeTileUnit,
  buildBattleResultServiceStubs,
} from '../../../components/abstract/basic-game-field/test-utils';
import { BattleResultService } from './battle-result.service';
import { BattleStateService } from '../battle-state/battle-state.service';
import { GameService } from '../game-action/game.service';
import { ModalWindowService } from '../../modal/modal-window.service';
import { PlayerLevelService } from '../../player-level/player-level.service';

// ─── Factory ─────────────────────────────────────────────────────────────────

function buildBattleResultService(turnCount = 0, maxTurnCount = 20, userDamage = 0, aiDamage = 0) {
  const stubs = buildBattleResultServiceStubs();

  stubs.battleStateService.turnCount = turnCount;
  stubs.battleStateService.maxTurnCount = maxTurnCount;
  stubs.battleStateService.userTotalDamage = userDamage;
  stubs.battleStateService.aiTotalDamage = aiDamage;

  const modalWindowStub = { openModal: vi.fn(), getModalConfig: vi.fn(() => ({})) };
  const playerLevelStub = { accrueXp: vi.fn(), getGainedXp: vi.fn(() => 0) };
  const storeStub = { dispatch: vi.fn(), selectSignal: vi.fn(() => () => null) };

  // Create an isolated injector that provides all stub tokens so Angular never
  // resolves real providers. BattleResultService uses inject() field initializers,
  // which require a valid injection context.
  const parentInjector = TestBed.inject(EnvironmentInjector);
  const injector = createEnvironmentInjector(
    [
      { provide: BattleStateService, useValue: stubs.battleStateService },
      { provide: GameService, useValue: stubs.gameService },
      { provide: ModalWindowService, useValue: modalWindowStub },
      { provide: PlayerLevelService, useValue: playerLevelStub },
      { provide: Store, useValue: storeStub },
    ],
    parentInjector,
  );

  const service = runInInjectionContext(injector, () => new BattleResultService());

  return { service, ...stubs };
}

// ─── checkBattleEnd — elimination outcomes ────────────────────────────────────

describe('checkBattleEnd — elimination outcomes', () => {
  it('returns battleEnded: true, winner: ai, reason: all_dead when all user units dead', () => {
    const { service, gameService } = buildBattleResultService();

    const userUnits = [makeDeadUnit(), makeDeadUnit()];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result).toEqual({ battleEnded: true, winner: 'ai', reason: 'all_dead' });
  });

  it('returns battleEnded: true, winner: user, reason: all_dead when all AI units dead', () => {
    const { service, gameService } = buildBattleResultService();

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeDeadUnit({ user: false }), makeDeadUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result).toEqual({ battleEnded: true, winner: 'user', reason: 'all_dead' });
  });

  it('returns battleEnded: false when both sides alive and turnCount < maxTurnCount', () => {
    // turnCount=5, maxTurnCount=20 — well within limit
    const { service, gameService } = buildBattleResultService(5, 20);

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result).toEqual({ battleEnded: false, winner: null, reason: 'none' });
  });
});

// ─── checkBattleEnd — turn-limit outcome ─────────────────────────────────────

describe('checkBattleEnd — turn-limit outcome', () => {
  it('returns battleEnded: true, reason: max_turns when turnCount === maxTurnCount', () => {
    const { service, gameService } = buildBattleResultService(20, 20);

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result.battleEnded).toBe(true);
    expect(result.reason).toBe('max_turns');
  });

  it('returns battleEnded: true, reason: max_turns when turnCount > maxTurnCount', () => {
    const { service, gameService } = buildBattleResultService(25, 20);

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result.battleEnded).toBe(true);
    expect(result.reason).toBe('max_turns');
  });

  it('returns winner: user when userDamage > aiDamage at turn limit', () => {
    // userDamage=200, aiDamage=100
    const { service, gameService } = buildBattleResultService(20, 20, 200, 100);

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result.winner).toBe('user');
  });

  it('returns winner: ai when aiDamage > userDamage at turn limit', () => {
    // userDamage=50, aiDamage=200
    const { service, gameService } = buildBattleResultService(20, 20, 50, 200);

    const userUnits = [makeTileUnit({ user: true })];
    const aiUnits = [makeTileUnit({ user: false })];

    gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

    const result = service.checkBattleEnd(userUnits, aiUnits);

    expect(result.winner).toBe('ai');
  });
});

// ─── determineWinnerByDamage — tie-breaking rule ──────────────────────────────

describe('determineWinnerByDamage — tie-breaking rule', () => {
  it('returns user when userDamage > aiDamage', () => {
    const { service } = buildBattleResultService(0, 20, 300, 100);

    const result = (service as any).determineWinnerByDamage();

    expect(result).toBe('user');
  });

  it('returns ai when aiDamage > userDamage', () => {
    const { service } = buildBattleResultService(0, 20, 100, 300);

    const result = (service as any).determineWinnerByDamage();

    expect(result).toBe('ai');
  });

  it('returns ai when userDamage === aiDamage (tie goes to AI)', () => {
    const { service } = buildBattleResultService(0, 20, 150, 150);

    const result = (service as any).determineWinnerByDamage();

    expect(result).toBe('ai');
  });
});

// ─── Property 4: checkBattleEnd — false for all valid mid-battle states ───────

describe('Property 4: checkBattleEnd — false for all valid mid-battle states', () => {
  it('returns battleEnded: false for all valid mid-battle states (property)', () => {
    /**
     * Validates: Requirements 10.3, 13.1, 13.2, 13.3
     */
    const midBattleArbitrary = fc
      .record({
        userDamage: fc.integer({ min: 0, max: 10_000 }),
        aiDamage: fc.integer({ min: 0, max: 10_000 }),
        maxTurnCount: fc.integer({ min: 1, max: 100 }),
        turnCount: fc.integer({ min: 0, max: 99 }),
      })
      .filter(({ turnCount, maxTurnCount }) => turnCount < maxTurnCount);

    fc.assert(
      fc.property(midBattleArbitrary, ({ userDamage, aiDamage, maxTurnCount, turnCount }) => {
        const { service, gameService } = buildBattleResultService(
          turnCount,
          maxTurnCount,
          userDamage,
          aiDamage,
        );

        const userUnits = [makeTileUnit({ user: true, health: 100 })];
        const aiUnits = [makeTileUnit({ user: false, health: 100 })];

        gameService.isDead.mockImplementation((units: any[]) => units.every(u => u.health <= 0));

        const result = service.checkBattleEnd(userUnits, aiUnits);

        return result.battleEnded === false;
      }),
      { numRuns: 200 },
    );
  });
});
