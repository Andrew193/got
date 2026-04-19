import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AiTurnService, AiTurnCallbacks } from './ai-turn.service';
import { BattleStateService } from '../battle-state/battle-state.service';
import { GameService } from '../game-action/game.service';
import { UnitService } from '../../unit/unit.service';
import { GameFieldService } from '../game-field/game-field.service';
import { EffectsService } from '../../effects/effects.service';
import { TileUnit } from '../../../models/field.model';
import { TileUnitSkill } from '../../../models/units-related/skill.model';

describe('AiTurnService', () => {
  let service: AiTurnService;
  let battleStateService: { [K in keyof BattleStateService]: ReturnType<typeof vi.fn> };
  let gameService: { [K in keyof GameService]: ReturnType<typeof vi.fn> };
  let unitService: { [K in keyof UnitService]: ReturnType<typeof vi.fn> };
  let fieldService: { [K in keyof GameFieldService]: ReturnType<typeof vi.fn> };
  let effectsService: { [K in keyof EffectsService]: ReturnType<typeof vi.fn> };

  const mockSkill: TileUnitSkill = {
    name: 'Test Skill',
    damage: 10,
    cooldown: 0,
    currentCooldown: 0,
  } as TileUnitSkill;

  const createMockUnit = (overrides: Partial<TileUnit> = {}): TileUnit =>
    ({
      id: 1,
      name: 'Test Unit',
      health: 100,
      maxHealth: 100,
      x: 0,
      y: 0,
      user: false,
      canMove: true,
      canAttack: true,
      attackRange: 1,
      rage: 10,
      willpower: 5,
      skills: [mockSkill],
      ...overrides,
    }) as TileUnit;

  const createMockCallbacks = (): { [K in keyof AiTurnCallbacks]: ReturnType<typeof vi.fn> } => ({
    makeAttackMove: vi.fn(),
    addEffectToUnit: vi.fn(),
    universalRangeAttack: vi.fn(),
    updateSkillCooldowns: vi.fn().mockReturnValue([mockSkill]),
  });

  beforeEach(() => {
    const battleStateSpy = { incrementTurnCount: vi.fn(), setTurnUser: vi.fn() };
    const gameSpy = { checkPassiveSkills: vi.fn(), getCanGetToPosition: vi.fn() };
    const unitSpy = {
      orderUnitsByDistance: vi.fn(),
      getPositionFromCoordinate: vi.fn(),
      findUnitIndex: vi.fn(),
    };
    const fieldSpy = {
      chooseAiSkill: vi.fn(),
      getShortestPathCover: vi.fn(),
      getGridFromField: vi.fn(),
      getFieldsInRadius: vi.fn(),
    };
    const effectsSpy = { applyEffect: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AiTurnService,
        { provide: BattleStateService, useValue: battleStateSpy },
        { provide: GameService, useValue: gameSpy },
        { provide: UnitService, useValue: unitSpy },
        { provide: GameFieldService, useValue: fieldSpy },
        { provide: EffectsService, useValue: effectsSpy },
        provideMockStore(),
      ],
    });

    service = TestBed.inject(AiTurnService);
    battleStateService = TestBed.inject(BattleStateService) as {
      [K in keyof BattleStateService]: ReturnType<typeof vi.fn>;
    };
    gameService = TestBed.inject(GameService) as {
      [K in keyof GameService]: ReturnType<typeof vi.fn>;
    };
    unitService = TestBed.inject(UnitService) as {
      [K in keyof UnitService]: ReturnType<typeof vi.fn>;
    };
    fieldService = TestBed.inject(GameFieldService) as {
      [K in keyof GameFieldService]: ReturnType<typeof vi.fn>;
    };
    effectsService = TestBed.inject(EffectsService) as {
      [K in keyof EffectsService]: ReturnType<typeof vi.fn>;
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('selectTarget', () => {
    it('should return the closest alive unit', () => {
      const aiUnit = createMockUnit({ x: 0, y: 0 });
      const userUnit1 = createMockUnit({ id: 2, x: 5, y: 5, health: 50, user: true });
      const userUnit2 = createMockUnit({ id: 3, x: 2, y: 2, health: 80, user: true });
      const userUnits = [userUnit1, userUnit2];

      unitService.orderUnitsByDistance.mockReturnValue([userUnit2, userUnit1]);

      const result = service.selectTarget(aiUnit, userUnits);

      expect(result).toBe(userUnit2);
      expect(unitService.orderUnitsByDistance).toHaveBeenCalledWith(
        aiUnit,
        expect.arrayContaining([userUnit1, userUnit2]),
      );
    });

    it('should return null when no alive units exist', () => {
      const aiUnit = createMockUnit({ x: 0, y: 0 });
      const deadUnit = createMockUnit({ id: 2, health: 0, user: true });
      const userUnits = [deadUnit];

      const result = service.selectTarget(aiUnit, userUnits);

      expect(result).toBeNull();
      expect(unitService.orderUnitsByDistance).not.toHaveBeenCalled();
    });

    it('should filter out dead units before ordering', () => {
      const aiUnit = createMockUnit({ x: 0, y: 0 });
      const deadUnit = createMockUnit({ id: 2, health: 0, user: true });
      const aliveUnit = createMockUnit({ id: 3, health: 50, user: true });
      const userUnits = [deadUnit, aliveUnit];

      unitService.orderUnitsByDistance.mockReturnValue([aliveUnit]);

      const result = service.selectTarget(aiUnit, userUnits);

      expect(result).toBe(aliveUnit);
      expect(unitService.orderUnitsByDistance).toHaveBeenCalledWith(aiUnit, [aliveUnit]);
    });
  });

  describe('executeAiTurn', () => {
    let aiUnits: TileUnit[];
    let userUnits: TileUnit[];
    let gameConfig: any[][];
    let callbacks: { [K in keyof AiTurnCallbacks]: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      aiUnits = [createMockUnit({ id: 1, x: 0, y: 0 })];
      userUnits = [createMockUnit({ id: 2, x: 3, y: 3, user: true })];
      gameConfig = [];
      callbacks = createMockCallbacks();

      unitService.orderUnitsByDistance.mockReturnValue(userUnits);
      unitService.getPositionFromCoordinate.mockReturnValue({ i: 0, j: 0 });
      fieldService.getGridFromField.mockReturnValue([]);
      fieldService.getShortestPathCover.mockReturnValue([]);
      fieldService.chooseAiSkill.mockReturnValue(mockSkill);
      gameService.getCanGetToPosition.mockReturnValue({ i: 1, j: 1 });
      fieldService.getFieldsInRadius.mockReturnValue([{ i: 3, j: 3 }]);
      unitService.findUnitIndex.mockReturnValue(0);
    });

    it('should call checkPassiveSkills at turn start', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(gameService.checkPassiveSkills).toHaveBeenCalledWith(aiUnits);
    });

    it('should skip dead units', () => {
      aiUnits = [createMockUnit({ id: 1, health: 0 })];

      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(unitService.orderUnitsByDistance).not.toHaveBeenCalled();
      expect(callbacks.makeAttackMove).not.toHaveBeenCalled();
    });

    it('should skip units with canMove: false', () => {
      aiUnits = [createMockUnit({ id: 1, canMove: false })];

      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(unitService.orderUnitsByDistance).not.toHaveBeenCalled();
      expect(callbacks.makeAttackMove).not.toHaveBeenCalled();
    });

    it('should call makeAttackMove when enemy is in range', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.makeAttackMove).toHaveBeenCalledWith(
        0,
        userUnits,
        expect.any(Object),
        mockSkill,
      );
    });

    it('should not call makeAttackMove when no enemy in range', () => {
      fieldService.getFieldsInRadius.mockReturnValue([{ i: 9, j: 9 }]);

      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.makeAttackMove).not.toHaveBeenCalled();
      expect(aiUnits[0].canAttack).toBe(false);
    });

    it('should call universalRangeAttack when enemy is in range', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.universalRangeAttack).toHaveBeenCalledWith(
        mockSkill,
        userUnits[0],
        userUnits,
        false,
        expect.any(Object),
      );
    });

    it.skip('should call addEffectToUnit when rage > willpower', () => {
      aiUnits = [createMockUnit({ id: 1, rage: 20 })];
      userUnits = [createMockUnit({ id: 2, willpower: 10, user: true })];
      unitService.orderUnitsByDistance.mockReturnValue(userUnits);

      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.addEffectToUnit).toHaveBeenCalledWith(userUnits, 0, mockSkill, false);
    });

    it('should not call addEffectToUnit when rage <= willpower', () => {
      aiUnits = [createMockUnit({ id: 1, rage: 5 })];
      userUnits = [createMockUnit({ id: 2, willpower: 10, user: true })];
      unitService.orderUnitsByDistance.mockReturnValue(userUnits);

      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.addEffectToUnit).not.toHaveBeenCalled();
    });

    it('should update skill cooldowns after attack', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(callbacks.updateSkillCooldowns).toHaveBeenCalledWith(aiUnits[0].skills, mockSkill);
    });

    it('should set canAttack to false after attack', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(aiUnits[0].canAttack).toBe(false);
    });

    it('should set canMove to false after moving', () => {
      service.executeAiTurn(aiUnits, userUnits, gameConfig, callbacks);

      expect(aiUnits[0].canMove).toBe(false);
    });
  });

  describe('chooseSkill', () => {
    it('should delegate to fieldService.chooseAiSkill', () => {
      const aiUnit = createMockUnit();

      fieldService.chooseAiSkill.mockReturnValue(mockSkill);

      const result = service.chooseSkill(aiUnit);

      expect(result).toBe(mockSkill);
      expect(fieldService.chooseAiSkill).toHaveBeenCalledWith(aiUnit.skills);
    });
  });

  describe('moveAiUnit', () => {
    it('should calculate shortest path and return move position', () => {
      const aiUnit = createMockUnit({ x: 0, y: 0 });
      const target = createMockUnit({ x: 5, y: 5, user: true });
      const gameConfig: any[][] = [];

      unitService.getPositionFromCoordinate
        .mockReturnValueOnce({ i: 0, j: 0 })
        .mockReturnValueOnce({ i: 5, j: 5 });
      fieldService.getGridFromField.mockReturnValue([]);
      fieldService.getShortestPathCover.mockReturnValue([
        { i: 0, j: 0 },
        { i: 1, j: 1 },
      ]);
      gameService.getCanGetToPosition.mockReturnValue({ i: 1, j: 1 });

      const result = service.moveAiUnit(aiUnit, target, gameConfig);

      expect(result).toEqual({ i: 1, j: 1 });
      expect(fieldService.getShortestPathCover).toHaveBeenCalledWith(
        [],
        { i: 0, j: 0 },
        { i: 5, j: 5 },
        true,
        false,
        true,
      );
      expect(gameService.getCanGetToPosition).toHaveBeenCalledWith(aiUnit, expect.any(Array), {
        i: 5,
        j: 5,
      });
    });
  });
});
