import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import {
  buildAiTurnServiceStubs,
  makeDeadUnit,
  makeSkill,
  makeTileUnit,
} from '../../../components/abstract/basic-game-field/test-utils';
import { GameFieldService } from '../game-field/game-field.service';
import { GameService } from '../game-action/game.service';
import { UnitService } from '../../unit/unit.service';
import { AiTurnService } from './ai-turn.service';

// ─── Factory ──────────────────────────────────────────────────────────────────

function buildAiService() {
  const stubs = buildAiTurnServiceStubs();
  const parentInjector = TestBed.inject(EnvironmentInjector);
  const injector = createEnvironmentInjector(
    [
      { provide: GameService, useValue: stubs.gameService },
      { provide: UnitService, useValue: stubs.unitService },
      { provide: GameFieldService, useValue: stubs.fieldService },
    ],
    parentInjector,
  );
  const service = runInInjectionContext(injector, () => new AiTurnService());

  return { service, ...stubs };
}

// ─── selectTarget — target selection ─────────────────────────────────────────

describe('selectTarget — target selection', () => {
  it('returns first unit from orderUnitsByDistance when all units alive', () => {
    const { service, unitService } = buildAiService();
    const aiUnit = makeTileUnit({ user: false, x: 5, y: 5 });
    const userUnit1 = makeTileUnit({ user: true, x: 1, y: 0 });
    const userUnit2 = makeTileUnit({ user: true, x: 2, y: 0 });
    const userUnits = [userUnit1, userUnit2];

    // orderUnitsByDistance returns units sorted by distance — first is closest
    unitService.orderUnitsByDistance.mockReturnValue([userUnit1, userUnit2]);

    const result = service.selectTarget(aiUnit, userUnits);

    expect(result).toBe(userUnit1);
    expect(unitService.orderUnitsByDistance).toHaveBeenCalledWith(aiUnit, userUnits);
  });

  it('returns null when all user units dead', () => {
    const { service } = buildAiService();
    const aiUnit = makeTileUnit({ user: false });
    const userUnits = [makeDeadUnit({ user: true }), makeDeadUnit({ user: true })];

    const result = service.selectTarget(aiUnit, userUnits);

    expect(result).toBeNull();
  });

  it('returns only alive units when array is mixed alive/dead', () => {
    const { service, unitService } = buildAiService();
    const aiUnit = makeTileUnit({ user: false });
    const deadUnit = makeDeadUnit({ user: true, x: 0, y: 0 });
    const aliveUnit = makeTileUnit({ user: true, x: 1, y: 1 });
    const userUnits = [deadUnit, aliveUnit];

    // Only alive unit passed to orderUnitsByDistance
    unitService.orderUnitsByDistance.mockReturnValue([aliveUnit]);

    const result = service.selectTarget(aiUnit, userUnits);

    expect(result).toBe(aliveUnit);
    // Dead unit should NOT be in the filtered array passed to orderUnitsByDistance
    const callArg = unitService.orderUnitsByDistance.mock.calls[0][1] as any[];

    expect(callArg).not.toContain(deadUnit);
    expect(callArg).toContain(aliveUnit);
  });

  it('returns null when userUnits is empty', () => {
    const { service } = buildAiService();
    const aiUnit = makeTileUnit({ user: false });

    const result = service.selectTarget(aiUnit, []);

    expect(result).toBeNull();
  });
});

// ─── executeAiTurn — skip conditions and attack dispatch ──────────────────────

describe('executeAiTurn — skip conditions and attack dispatch', () => {
  it('does NOT call executeAttack for dead units (health === 0)', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    const deadAiUnit = makeDeadUnit({ user: false, x: 0, y: 0 });
    const userUnit = makeTileUnit({ user: true, x: 1, y: 0 });
    const executeAttack = vi.fn();

    // Wire stubs so the unit WOULD attack if it were alive
    unitService.orderUnitsByDistance.mockReturnValue([userUnit]);
    fieldService.getFieldsInRadius.mockReturnValue([{ i: 1, j: 0 }]);
    fieldService.getShortestPathCover.mockReturnValue([{ i: 1, j: 0 }]);
    gameService.getCanGetToPosition.mockReturnValue({ i: 0, j: 0 });

    service.executeAiTurn([deadAiUnit], [userUnit], [], { executeAttack });

    expect(executeAttack).not.toHaveBeenCalled();
  });

  it('does NOT call executeAttack for units with canMove: false', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    const immobileAiUnit = makeTileUnit({ user: false, x: 0, y: 0, canMove: false });
    const userUnit = makeTileUnit({ user: true, x: 1, y: 0 });
    const executeAttack = vi.fn();

    unitService.orderUnitsByDistance.mockReturnValue([userUnit]);
    fieldService.getFieldsInRadius.mockReturnValue([{ i: 1, j: 0 }]);
    fieldService.getShortestPathCover.mockReturnValue([{ i: 1, j: 0 }]);
    gameService.getCanGetToPosition.mockReturnValue({ i: 0, j: 0 });

    service.executeAiTurn([immobileAiUnit], [userUnit], [], { executeAttack });

    expect(executeAttack).not.toHaveBeenCalled();
  });

  it('calls executeAttack exactly once when enemy is in range after movement', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    const skill = makeSkill();
    const aiUnit = makeTileUnit({ user: false, x: 0, y: 0, canMove: true, skills: [skill] });
    // User unit at position x:1, y:0 — will be found by getFieldsInRadius
    const userUnit = makeTileUnit({ user: true, x: 1, y: 0 });
    const executeAttack = vi.fn().mockReturnValue({ ...aiUnit });

    unitService.orderUnitsByDistance.mockReturnValue([userUnit]);
    unitService.findUnitIndex.mockReturnValue(0);
    // getPositionFromCoordinate returns i=x, j=y for any unit
    unitService.getPositionFromCoordinate.mockImplementation((u: any) => ({
      i: u.x,
      j: u.y,
    }));
    // After move, AI ends up at {i:0, j:0}
    gameService.getCanGetToPosition.mockReturnValue({ i: 0, j: 0 });
    fieldService.getShortestPathCover.mockReturnValue([{ i: 0, j: 0 }]);
    // getFieldsInRadius returns a position matching the user unit (x:1, y:0)
    fieldService.getFieldsInRadius.mockReturnValue([{ i: 1, j: 0 }]);
    fieldService.chooseAiSkill.mockReturnValue(skill);
    fieldService.getGridFromField.mockReturnValue([]);

    const aiUnits = [aiUnit];

    service.executeAiTurn(aiUnits, [userUnit], [], { executeAttack });

    expect(executeAttack).toHaveBeenCalledTimes(1);
  });

  it('sets canAttack: false without calling executeAttack when no enemy in range', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    const skill = makeSkill();
    const aiUnit = makeTileUnit({ user: false, x: 0, y: 0, canMove: true, skills: [skill] });
    const userUnit = makeTileUnit({ user: true, x: 9, y: 9 });
    const executeAttack = vi.fn();

    unitService.orderUnitsByDistance.mockReturnValue([userUnit]);
    unitService.getPositionFromCoordinate.mockImplementation((u: any) => ({
      i: u.x,
      j: u.y,
    }));
    gameService.getCanGetToPosition.mockReturnValue({ i: 0, j: 0 });
    fieldService.getShortestPathCover.mockReturnValue([{ i: 1, j: 0 }]);
    // No positions returned — no enemy in range
    fieldService.getFieldsInRadius.mockReturnValue([]);
    fieldService.getGridFromField.mockReturnValue([]);

    const aiUnits = [aiUnit];

    service.executeAiTurn(aiUnits, [userUnit], [], { executeAttack });

    expect(executeAttack).not.toHaveBeenCalled();
    expect(aiUnits[0].canAttack).toBe(false);
  });
});

// ─── moveAiUnit — movement position ──────────────────────────────────────────

describe('moveAiUnit — movement position', () => {
  it('returns current position when path is empty', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    const aiUnit = makeTileUnit({ user: false, x: 3, y: 4 });
    const target = makeTileUnit({ user: true, x: 7, y: 7 });
    const currentPos = { i: 3, j: 4 };

    unitService.getPositionFromCoordinate.mockImplementation((u: any) => ({
      i: u.x,
      j: u.y,
    }));
    // Empty path — no movement possible
    fieldService.getShortestPathCover.mockReturnValue([]);
    fieldService.getGridFromField.mockReturnValue([]);
    // When path is empty, getCanGetToPosition returns the unit's own position
    gameService.getCanGetToPosition.mockReturnValue(currentPos);

    const result = service.moveAiUnit(aiUnit, target, []);

    expect(result).toEqual(currentPos);
  });

  it('returns last path position when path shorter than canCross', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    // canCross: 3 but path has only 2 steps
    const aiUnit = makeTileUnit({ user: false, x: 0, y: 0, canCross: 3 });
    const target = makeTileUnit({ user: true, x: 5, y: 5 });
    const path = [
      { i: 1, j: 0 },
      { i: 2, j: 0 },
    ];
    const lastPos = path[path.length - 1];

    unitService.getPositionFromCoordinate.mockImplementation((u: any) => ({
      i: u.x,
      j: u.y,
    }));
    fieldService.getShortestPathCover.mockReturnValue(path);
    fieldService.getGridFromField.mockReturnValue([]);
    // Simulates: path shorter than canCross → use last element
    gameService.getCanGetToPosition.mockReturnValue(lastPos);

    const result = service.moveAiUnit(aiUnit, target, []);

    expect(result).toEqual(lastPos);
  });

  it('returns position at canCross step when path longer than canCross', () => {
    const { service, fieldService, unitService, gameService } = buildAiService();
    // canCross: 2, path has 5 steps — should stop at step index 1 (canCross - 1)
    const aiUnit = makeTileUnit({ user: false, x: 0, y: 0, canCross: 2 });
    const target = makeTileUnit({ user: true, x: 9, y: 9 });
    const path = [
      { i: 1, j: 0 },
      { i: 2, j: 0 },
      { i: 3, j: 0 },
      { i: 4, j: 0 },
      { i: 5, j: 0 },
    ];
    const posAtCanCross = path[aiUnit.canCross - 1]; // index 1 → {i:2, j:0}

    unitService.getPositionFromCoordinate.mockImplementation((u: any) => ({
      i: u.x,
      j: u.y,
    }));
    fieldService.getShortestPathCover.mockReturnValue(path);
    fieldService.getGridFromField.mockReturnValue([]);
    // Simulates: path longer than canCross → stop at canCross-th step
    gameService.getCanGetToPosition.mockReturnValue(posAtCanCross);

    const result = service.moveAiUnit(aiUnit, target, []);

    expect(result).toEqual(posAtCanCross);
  });
});
