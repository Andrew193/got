import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BattleStateService } from './battle-state.service';

describe('BattleStateService', () => {
  let service: BattleStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BattleStateService);
  });

  describe('initial values', () => {
    it('should have turnCount = 1', () => {
      expect(service.turnCount).toBe(1);
    });

    it('should have turnUser = true', () => {
      expect(service.turnUser).toBe(true);
    });

    it('should have userTotalDamage = 0', () => {
      expect(service.userTotalDamage).toBe(0);
    });

    it('should have aiTotalDamage = 0', () => {
      expect(service.aiTotalDamage).toBe(0);
    });

    it('should have maxTurnCount = 20', () => {
      expect(service.maxTurnCount).toBe(20);
    });

    it('should have battleActive = false', () => {
      expect(service.battleActive).toBe(false);
    });
  });

  describe('incrementTurnCount', () => {
    it('should increment turnCount by 1', () => {
      service.incrementTurnCount();
      expect(service.turnCount).toBe(2);
    });

    it('should increment multiple times correctly', () => {
      service.incrementTurnCount();
      service.incrementTurnCount();
      service.incrementTurnCount();
      expect(service.turnCount).toBe(4);
    });
  });

  describe('setTurnUser', () => {
    it('should set turnUser to false', () => {
      service.setTurnUser(false);
      expect(service.turnUser).toBe(false);
    });

    it('should set turnUser back to true', () => {
      service.setTurnUser(false);
      service.setTurnUser(true);
      expect(service.turnUser).toBe(true);
    });
  });

  describe('addUserDamage', () => {
    it('should accumulate positive damage', () => {
      service.addUserDamage(100);
      expect(service.userTotalDamage).toBe(100);
    });

    it('should accumulate multiple damage values', () => {
      service.addUserDamage(100);
      service.addUserDamage(50);
      expect(service.userTotalDamage).toBe(150);
    });

    it('should ignore zero damage', () => {
      service.addUserDamage(0);
      expect(service.userTotalDamage).toBe(0);
    });

    it('should ignore negative damage', () => {
      service.addUserDamage(-50);
      expect(service.userTotalDamage).toBe(0);
    });

    it('should not affect aiTotalDamage', () => {
      service.addUserDamage(100);
      expect(service.aiTotalDamage).toBe(0);
    });
  });

  describe('addAiDamage', () => {
    it('should accumulate positive damage', () => {
      service.addAiDamage(200);
      expect(service.aiTotalDamage).toBe(200);
    });

    it('should accumulate multiple damage values', () => {
      service.addAiDamage(200);
      service.addAiDamage(75);
      expect(service.aiTotalDamage).toBe(275);
    });

    it('should ignore zero damage', () => {
      service.addAiDamage(0);
      expect(service.aiTotalDamage).toBe(0);
    });

    it('should ignore negative damage', () => {
      service.addAiDamage(-100);
      expect(service.aiTotalDamage).toBe(0);
    });

    it('should not affect userTotalDamage', () => {
      service.addAiDamage(200);
      expect(service.userTotalDamage).toBe(0);
    });
  });

  describe('setBattleActive', () => {
    it('should set battleActive to true', () => {
      service.setBattleActive(true);
      expect(service.battleActive).toBe(true);
    });

    it('should set battleActive to false', () => {
      service.setBattleActive(true);
      service.setBattleActive(false);
      expect(service.battleActive).toBe(false);
    });
  });

  describe('resetBattleState', () => {
    it('should reset all state to defaults', () => {
      service.incrementTurnCount();
      service.incrementTurnCount();
      service.setTurnUser(false);
      service.addUserDamage(500);
      service.addAiDamage(300);
      service.setBattleActive(true);

      service.resetBattleState();

      expect(service.turnCount).toBe(1);
      expect(service.turnUser).toBe(true);
      expect(service.userTotalDamage).toBe(0);
      expect(service.aiTotalDamage).toBe(0);
      expect(service.battleActive).toBe(false);
    });

    it('should not reset maxTurnCount', () => {
      service.resetBattleState();
      expect(service.maxTurnCount).toBe(20);
    });
  });

  describe('getState', () => {
    it('should return a snapshot of current state', () => {
      service.incrementTurnCount();
      service.setTurnUser(false);
      service.addUserDamage(100);
      service.addAiDamage(200);

      const state = service.getState();

      expect(state.turnCount).toBe(2);
      expect(state.turnUser).toBe(false);
      expect(state.userTotalDamage).toBe(100);
      expect(state.aiTotalDamage).toBe(200);
      expect(state.maxTurnCount).toBe(20);
      expect(state.battleActive).toBe(false);
    });
  });

  describe('observables', () => {
    it('turnCount$ should emit updated value after incrementTurnCount', () => {
      const values: number[] = [];

      service.turnCount$.subscribe(v => values.push(v));
      service.incrementTurnCount();

      expect(values).toContain(2);
    });

    it('turnUser$ should emit updated value after setTurnUser', () => {
      const values: boolean[] = [];

      service.turnUser$.subscribe(v => values.push(v));
      service.setTurnUser(false);

      expect(values).toContain(false);
    });

    it('userTotalDamage$ should emit updated value after addUserDamage', () => {
      const values: number[] = [];

      service.userTotalDamage$.subscribe(v => values.push(v));
      service.addUserDamage(150);

      expect(values).toContain(150);
    });

    it('aiTotalDamage$ should emit updated value after addAiDamage', () => {
      const values: number[] = [];

      service.aiTotalDamage$.subscribe(v => values.push(v));
      service.addAiDamage(250);

      expect(values).toContain(250);
    });

    it('battleActive$ should emit updated value after setBattleActive', () => {
      const values: boolean[] = [];

      service.battleActive$.subscribe(v => values.push(v));
      service.setBattleActive(true);

      expect(values).toContain(true);
    });
  });
});
