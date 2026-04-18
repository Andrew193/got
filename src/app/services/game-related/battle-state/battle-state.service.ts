import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BattleState {
  turnCount: number;
  turnUser: boolean;
  userTotalDamage: number;
  aiTotalDamage: number;
  maxTurnCount: number;
  battleActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BattleStateService {
  private readonly DEFAULT_MAX_TURNS = 20;

  private readonly _turnCount = new BehaviorSubject<number>(1);
  private readonly _turnUser = new BehaviorSubject<boolean>(true);
  private readonly _userTotalDamage = new BehaviorSubject<number>(0);
  private readonly _aiTotalDamage = new BehaviorSubject<number>(0);
  private readonly _maxTurnCount = new BehaviorSubject<number>(this.DEFAULT_MAX_TURNS);
  private readonly _battleActive = new BehaviorSubject<boolean>(false);

  readonly turnCount$: Observable<number> = this._turnCount.asObservable();
  readonly turnUser$: Observable<boolean> = this._turnUser.asObservable();
  readonly userTotalDamage$: Observable<number> = this._userTotalDamage.asObservable();
  readonly aiTotalDamage$: Observable<number> = this._aiTotalDamage.asObservable();
  readonly battleActive$: Observable<boolean> = this._battleActive.asObservable();

  get turnCount(): number {
    return this._turnCount.value;
  }

  get turnUser(): boolean {
    return this._turnUser.value;
  }

  get userTotalDamage(): number {
    return this._userTotalDamage.value;
  }

  get aiTotalDamage(): number {
    return this._aiTotalDamage.value;
  }

  get maxTurnCount(): number {
    return this._maxTurnCount.value;
  }

  get battleActive(): boolean {
    return this._battleActive.value;
  }

  incrementTurnCount(): void {
    this._turnCount.next(this._turnCount.value + 1);
  }

  setTurnUser(isUser: boolean): void {
    this._turnUser.next(isUser);
  }

  addUserDamage(damage: number): void {
    if (damage <= 0) return;

    this._userTotalDamage.next(this._userTotalDamage.value + damage);
  }

  addAiDamage(damage: number): void {
    if (damage <= 0) return;

    this._aiTotalDamage.next(this._aiTotalDamage.value + damage);
  }

  setBattleActive(active: boolean): void {
    this._battleActive.next(active);
  }

  resetBattleState(): void {
    this._turnCount.next(1);
    this._turnUser.next(true);
    this._userTotalDamage.next(0);
    this._aiTotalDamage.next(0);
    this._battleActive.next(false);
  }

  getState(): BattleState {
    return {
      turnCount: this.turnCount,
      turnUser: this.turnUser,
      userTotalDamage: this.userTotalDamage,
      aiTotalDamage: this.aiTotalDamage,
      maxTurnCount: this.maxTurnCount,
      battleActive: this.battleActive,
    };
  }
}
