import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BattleResultService } from './battle-result.service';
import { BattleStateService } from '../battle-state/battle-state.service';
import { GameService } from '../game-action/game.service';
import { ModalWindowService } from '../../modal/modal-window.service';
import { Store } from '@ngrx/store';
import { TileUnit } from '../../../models/field.model';

describe('BattleResultService', () => {
  let service: BattleResultService;
  let battleStateService: { [K in keyof BattleStateService]: ReturnType<typeof vi.fn> };
  let gameService: { [K in keyof GameService]: ReturnType<typeof vi.fn> };
  let modalWindowService: { [K in keyof ModalWindowService]: ReturnType<typeof vi.fn> };
  let store: { [K in keyof Store]: ReturnType<typeof vi.fn> };

  const createMockUnit = (health: number, user: boolean): Partial<TileUnit> => ({
    health,
    user,
    x: 0,
    y: 0,
  });

  beforeEach(() => {
    const battleStateSpy = { turnCount: 1, maxTurnCount: 20, userTotalDamage: 0, aiTotalDamage: 0 };

    const gameSpy = { isDead: vi.fn() };
    const modalSpy = { getModalConfig: vi.fn(), openModal: vi.fn() };
    const storeSpy = { selectSignal: vi.fn() };

    storeSpy.selectSignal.mockReturnValue(() => null);

    TestBed.configureTestingModule({
      providers: [
        BattleResultService,
        { provide: BattleStateService, useValue: battleStateSpy },
        { provide: GameService, useValue: gameSpy },
        { provide: ModalWindowService, useValue: modalSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(BattleResultService);
    battleStateService = TestBed.inject(BattleStateService) as {
      [K in keyof BattleStateService]: ReturnType<typeof vi.fn>;
    };
    gameService = TestBed.inject(GameService) as {
      [K in keyof GameService]: ReturnType<typeof vi.fn>;
    };
    modalWindowService = TestBed.inject(ModalWindowService) as {
      [K in keyof ModalWindowService]: ReturnType<typeof vi.fn>;
    };
    store = TestBed.inject(Store) as { [K in keyof Store]: ReturnType<typeof vi.fn> };
  });

  describe('checkBattleEnd', () => {
    it('should return none when units are null', () => {
      const result = service.checkBattleEnd(null as any, null as any);

      expect(result.battleEnded).toBe(false);
      expect(result.winner).toBe(null);
      expect(result.reason).toBe('none');
    });

    it('should detect user loss when all user units dead', () => {
      gameService.isDead.mockReturnValueOnce(true).mockReturnValueOnce(false);

      const result = service.checkBattleEnd([] as TileUnit[], [] as TileUnit[]);

      expect(result.battleEnded).toBe(true);
      expect(result.winner).toBe('ai');
      expect(result.reason).toBe('all_dead');
    });

    it('should detect user win when all AI units dead', () => {
      gameService.isDead.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const result = service.checkBattleEnd([] as TileUnit[], [] as TileUnit[]);

      expect(result.battleEnded).toBe(true);
      expect(result.winner).toBe('user');
      expect(result.reason).toBe('all_dead');
    });

    it('should detect max turns reached', () => {
      gameService.isDead.mockReturnValue(false);
      Object.defineProperty(battleStateService, 'turnCount', { value: 20, configurable: true });
      Object.defineProperty(battleStateService, 'maxTurnCount', {
        value: 20,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'userTotalDamage', {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'aiTotalDamage', {
        value: 500,
        configurable: true,
      });

      const result = service.checkBattleEnd([] as TileUnit[], [] as TileUnit[]);

      expect(result.battleEnded).toBe(true);
      expect(result.winner).toBe('user');
      expect(result.reason).toBe('max_turns');
    });

    it('should continue battle when conditions not met', () => {
      gameService.isDead.mockReturnValue(false);
      Object.defineProperty(battleStateService, 'turnCount', { value: 10, configurable: true });
      Object.defineProperty(battleStateService, 'maxTurnCount', {
        value: 20,
        configurable: true,
      });

      const result = service.checkBattleEnd([] as TileUnit[], [] as TileUnit[]);

      expect(result.battleEnded).toBe(false);
      expect(result.winner).toBe(null);
      expect(result.reason).toBe('none');
    });
  });

  describe('determineWinnerByDamage', () => {
    it('should return user when user dealt more damage', () => {
      Object.defineProperty(battleStateService, 'userTotalDamage', {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'aiTotalDamage', {
        value: 500,
        configurable: true,
      });

      const winner = service.determineWinnerByDamage();

      expect(winner).toBe('user');
    });

    it('should return ai when AI dealt more damage', () => {
      Object.defineProperty(battleStateService, 'userTotalDamage', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'aiTotalDamage', {
        value: 1000,
        configurable: true,
      });

      const winner = service.determineWinnerByDamage();

      expect(winner).toBe('ai');
    });

    it('should return ai on equal damage (tie goes to AI)', () => {
      Object.defineProperty(battleStateService, 'userTotalDamage', {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'aiTotalDamage', {
        value: 1000,
        configurable: true,
      });

      const winner = service.determineWinnerByDamage();

      expect(winner).toBe('ai');
    });
  });

  describe('showBattleResult', () => {
    it('should not show modal if battle not ended', () => {
      const result = { battleEnded: false, winner: null, reason: 'none' } as any;

      service.showBattleResult(result, [], () => {}, {} as any);

      expect(modalWindowService.openModal).not.toHaveBeenCalled();
    });

    it('should emit reward when battle ended', () => {
      const result = { battleEnded: true, winner: 'user', reason: 'all_dead' } as any;
      const rewardSetter = { emit: vi.fn() };

      service.showBattleResult(result, [], () => {}, rewardSetter);

      expect(rewardSetter.emit).toHaveBeenCalledWith([[], true]);
    });

    it('should open modal with correct config for user win', () => {
      const result = { battleEnded: true, winner: 'user', reason: 'all_dead' } as any;
      const rewardSetter = { emit: vi.fn() };

      modalWindowService.getModalConfig.mockReturnValue({} as any);

      service.showBattleResult(result, [], () => {}, rewardSetter);

      expect(modalWindowService.getModalConfig).toHaveBeenCalledWith(
        'green-b',
        'You won',
        { closeBtnLabel: 'Great' },
        expect.any(Object),
      );
      expect(modalWindowService.openModal).toHaveBeenCalled();
    });

    it('should open modal with correct config for user loss', () => {
      const result = { battleEnded: true, winner: 'ai', reason: 'all_dead' } as any;
      const rewardSetter = { emit: vi.fn() };

      modalWindowService.getModalConfig.mockReturnValue({} as any);

      service.showBattleResult(result, [], () => {}, rewardSetter);

      expect(modalWindowService.getModalConfig).toHaveBeenCalledWith(
        'red-b',
        'You lost',
        { closeBtnLabel: 'Try again later' },
        expect.any(Object),
      );
      expect(modalWindowService.openModal).toHaveBeenCalled();
    });

    it('should include damage totals in message for max_turns', () => {
      const result = { battleEnded: true, winner: 'user', reason: 'max_turns' } as any;
      const rewardSetter = { emit: vi.fn() };

      Object.defineProperty(battleStateService, 'userTotalDamage', {
        value: 1500,
        configurable: true,
      });
      Object.defineProperty(battleStateService, 'aiTotalDamage', {
        value: 800,
        configurable: true,
      });

      modalWindowService.getModalConfig.mockReturnValue({} as any);

      service.showBattleResult(result, [], () => {}, rewardSetter);

      expect(modalWindowService.getModalConfig).toHaveBeenCalledWith(
        'green-b',
        'You won by damage (1500 vs 800)',
        { closeBtnLabel: 'Great' },
        expect.any(Object),
      );
    });
  });
});
