import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AutoFightService } from './auto-fight.service';

describe('AutoFightService', () => {
  let service: AutoFightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoFightService);
  });

  afterEach(() => {
    service.stopAutoFight();
  });

  describe('fast-fight mode', () => {
    it('should execute all turns synchronously', () => {
      let turnCount = 0;

      service.startAutoFight(true, () => {
        turnCount++;

        return turnCount >= 3;
      });

      expect(turnCount).toBe(3);
    });

    it('should stop when callback returns true', () => {
      let turnCount = 0;

      service.startAutoFight(true, () => {
        turnCount++;

        return turnCount >= 5;
      });

      expect(turnCount).toBe(5);
      expect(service.isAutoFightActive()).toBe(false);
    });

    it('should set isAutoFightActive to false after completion', () => {
      service.startAutoFight(true, () => true);

      expect(service.isAutoFightActive()).toBe(false);
    });
  });

  describe('normal auto-fight mode', () => {
    it('should set isAutoFightActive to true', done => {
      service.startAutoFight(false, () => {
        expect(service.isAutoFightActive()).toBe(true);

        return true;
      });

      setTimeout(() => {
        done();
      }, 100);
    });

    it('should clear interval when callback returns true', done => {
      let turnCount = 0;

      service.startAutoFight(false, () => {
        turnCount++;

        if (turnCount >= 3) {
          expect(service.isAutoFightActive()).toBe(false);
          done();

          return true;
        }

        return false;
      });
    });

    it('should execute turns with interval timing', done => {
      let turnCount = 0;
      const startTime = Date.now();

      service.startAutoFight(false, () => {
        turnCount++;

        if (turnCount >= 2) {
          const elapsed = Date.now() - startTime;

          expect(elapsed).toBeGreaterThan(0);
          done();

          return true;
        }

        return false;
      });
    });
  });

  describe('stopAutoFight', () => {
    it('should set isAutoFightActive to false', () => {
      service.startAutoFight(false, () => false);
      expect(service.isAutoFightActive()).toBe(true);

      service.stopAutoFight();
      expect(service.isAutoFightActive()).toBe(false);
    });

    it('should clear interval', done => {
      let turnCount = 0;

      service.startAutoFight(false, () => {
        turnCount++;

        return false;
      });

      setTimeout(() => {
        service.stopAutoFight();
        const countAfterStop = turnCount;

        setTimeout(() => {
          expect(turnCount).toBe(countAfterStop);
          done();
        }, 200);
      }, 100);
    });
  });

  describe('executeSingleTurn', () => {
    it('should execute callback and return result', () => {
      const result = service.executeSingleTurn(() => true);

      expect(result).toBe(true);
    });

    it('should return false when callback returns false', () => {
      const result = service.executeSingleTurn(() => false);

      expect(result).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call stopAutoFight', () => {
      vi.spyOn(service, 'stopAutoFight');
      service.ngOnDestroy();
      expect(service.stopAutoFight).toHaveBeenCalled();
    });

    it('should stop active auto-fight', () => {
      service.startAutoFight(false, () => false);
      expect(service.isAutoFightActive()).toBe(true);

      service.ngOnDestroy();
      expect(service.isAutoFightActive()).toBe(false);
    });
  });

  describe('double-start guard', () => {
    it('should stop previous instance before starting new one', done => {
      let firstTurnCount = 0;
      let secondTurnCount = 0;

      service.startAutoFight(false, () => {
        firstTurnCount++;

        return false;
      });

      setTimeout(() => {
        const firstCount = firstTurnCount;

        service.startAutoFight(false, () => {
          secondTurnCount++;

          if (secondTurnCount >= 2) {
            expect(firstTurnCount).toBe(firstCount);
            done();

            return true;
          }

          return false;
        });
      }, 100);
    });
  });
});
