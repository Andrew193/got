import { Injectable, OnDestroy } from '@angular/core';
import { BATTLE_SPEED } from '../../../constants';

@Injectable({ providedIn: 'root' })
export class AutoFightService implements OnDestroy {
  private intervalRef: ReturnType<typeof setInterval> | null = null;
  private autoFightActive = false;

  startAutoFight(fastFight: boolean, executeTurn: () => boolean) {
    // Guard against double-start
    if (this.autoFightActive) {
      this.stopAutoFight();
    }

    this.autoFightActive = true;

    if (fastFight) {
      // Fast-fight: synchronous loop
      while (this.autoFightActive) {
        const battleEnded = executeTurn();

        if (battleEnded) {
          this.stopAutoFight();
          break;
        }
      }
    } else {
      // Normal auto-fight: interval-based
      this.intervalRef = setInterval(() => {
        const battleEnded = executeTurn();

        if (battleEnded || !this.autoFightActive) {
          this.stopAutoFight();
        }
      }, BATTLE_SPEED);
    }
  }

  executeSingleTurn(executeTurn: () => boolean): boolean {
    return executeTurn();
  }

  stopAutoFight() {
    this.autoFightActive = false;

    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  isAutoFightActive(): boolean {
    return this.autoFightActive;
  }

  ngOnDestroy() {
    this.stopAutoFight();
  }
}
