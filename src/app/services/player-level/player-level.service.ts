import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, firstValueFrom, forkJoin, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TileUnit } from '../../models/field.model';
import { HeroesNamesCodes, HeroProgressRecord } from '../../models/units-related/unit.model';
import { Currency } from '../users/users.interfaces';
import { PlayerLevelActions } from '../../store/actions/player-level.actions';
import { selectPlayerLevel, selectPlayerXp } from '../../store/selectors/player-level.selectors';
import {
  computeLevel,
  computeLevelUpReward,
  MAX_PLAYER_LEVEL,
  MILESTONE_SHARD_AMOUNT,
  MILESTONE_SHARD_RECIPIENTS_COUNT,
} from '../../constants/player-level.constants';
import { PlayerLevelApiService } from './player-level-api.service';
import { XpCalculatorService } from './xp-calculator.service';
import { UsersService } from '../users/users.service';
import { HeroProgressService } from '../facades/hero-progress/hero-progress.service';
import { ModalWindowService } from '../modal/modal-window.service';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { HeroesFacadeService } from '../facades/heroes/heroes.service';
import { ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';
import { SNACKBAR_CONFIG } from '../../constants';
import { LevelUpRewardComponent } from '../../components/modal-window/level-up-reward/level-up-reward.component';
import { InitInterface } from '../../models/interfaces/init.interface';
import { InitTaskObs } from '../../models/init.model';

export interface ShardRecipient {
  heroName: HeroesNamesCodes;
  heroImgSrc: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerLevelService implements InitInterface {
  private store = inject(Store);
  private apiService = inject(PlayerLevelApiService);
  private xpCalculator = inject(XpCalculatorService);
  private usersService = inject(UsersService);
  private heroProgressService = inject(HeroProgressService);
  private heroesService = inject(HeroesFacadeService);
  private modalService = inject(ModalWindowService);
  private localStorageService = inject(LocalStorageService);
  private snackBar = inject(MatSnackBar);

  private currentLevel = this.store.selectSignal(selectPlayerLevel);
  private currentXp = this.store.selectSignal(selectPlayerXp);

  init() {
    try {
      const userId = this.localStorageService.getUserId();

      this.apiService.load(userId).subscribe();

      return of({ ok: true, message: 'User level has been inited' } satisfies InitTaskObs);
    } catch {
      return of({ ok: false, message: 'Failed to init user level' } satisfies InitTaskObs);
    }
  }

  accrueXp(units: TileUnit[], win: boolean, mode: string): void {
    const gainedXp = this.xpCalculator.calculate(units, win, mode);

    if (gainedXp === 0) {
      return;
    }

    const oldLevel = this.currentLevel();
    const newXp = this.currentXp() + gainedXp;
    const newLevel = Math.min(computeLevel(newXp), MAX_PLAYER_LEVEL);
    const userId = this.localStorageService.getUserId();

    if (!userId) {
      return;
    }

    this.apiService
      .save(userId, { level: newLevel, xp: newXp })
      .pipe(
        catchError(err => {
          const error = err?.message ?? 'Failed to save player level';

          this.store.dispatch(PlayerLevelActions.updateFailure({ error }));
          this.snackBar.open('Failed to save XP progress.', 'Close', SNACKBAR_CONFIG);

          return of(null);
        }),
      )
      .subscribe(data => {
        if (!data) {
          return;
        }

        this.store.dispatch(PlayerLevelActions.updateSuccess({ data }));

        if (newLevel > oldLevel) {
          this.processLevelUps(oldLevel, newLevel, userId);
        }
      });
  }

  // ─── Level-up processing ────────────────────────────────────────────────────

  private processLevelUps(oldLevel: number, newLevel: number, userId: string): void {
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      this.grantLevelUpRewards(level, userId);
    }
  }

  private grantLevelUpRewards(level: number, userId: string): void {
    const currencyReward = computeLevelUpReward(level);
    const isMilestone = level % 10 === 0;
    const shardRecipients = isMilestone ? this.selectShardRecipients() : null;

    // Grant currency reward
    firstValueFrom(
      this.usersService.updateCurrency(currencyReward).pipe(
        catchError(() => {
          this.snackBar.open(
            `Failed to grant currency reward for level ${level}.`,
            'Close',
            SNACKBAR_CONFIG,
          );

          return EMPTY;
        }),
      ),
    );

    // Grant shard rewards on milestone levels
    if (isMilestone && shardRecipients && shardRecipients.length > 0) {
      const shardRequests = shardRecipients.map(r =>
        this.heroProgressService.addShards(userId, r.heroName, MILESTONE_SHARD_AMOUNT).pipe(
          catchError(() => {
            this.snackBar.open(
              `Failed to grant shards for ${r.heroName} at level ${level}.`,
              'Close',
              SNACKBAR_CONFIG,
            );

            return EMPTY;
          }),
        ),
      );

      firstValueFrom(forkJoin(shardRequests).pipe(catchError(() => of(null))));
    }

    // Open level-up reward modal
    this.openLevelUpModal(level, currencyReward, shardRecipients);
  }

  private openLevelUpModal(
    newLevel: number,
    currencyReward: Currency,
    shardRecipients: ShardRecipient[] | null,
  ): void {
    const config = this.modalService.getModalConfig(
      'level-up-header',
      `Level Up! You reached level ${newLevel}`,
      { closeBtnLabel: 'Claim' },
      {
        strategy: ModalStrategiesTypes.component,
        component: LevelUpRewardComponent,
        data: { newLevel, currencyReward, shardRecipients },
      },
    );

    this.modalService.openModal(config);
  }

  selectShardRecipients(): ShardRecipient[] {
    const progress = this.heroProgressService.getStaticData();
    const allHeroes = this.heroesService.getAllHeroes();
    const heroesMap = new Map(allHeroes.map(h => [h.name as HeroesNamesCodes, h.imgSrc]));

    const unlockedNames = (progress?.heroes ?? [])
      .filter((h: HeroProgressRecord) => h.isUnlocked)
      .map((h: HeroProgressRecord) => h.heroName);

    const lockedNames = allHeroes
      .map(h => h.name as HeroesNamesCodes)
      .filter(name => !unlockedNames.includes(name));

    const shuffled = (arr: HeroesNamesCodes[]) => [...arr].sort(() => Math.random() - 0.5);

    const selected: HeroesNamesCodes[] = [];
    const shuffledUnlocked = shuffled(unlockedNames);
    const shuffledLocked = shuffled(lockedNames);

    for (const name of shuffledUnlocked) {
      if (selected.length >= MILESTONE_SHARD_RECIPIENTS_COUNT) break;
      selected.push(name);
    }

    for (const name of shuffledLocked) {
      if (selected.length >= MILESTONE_SHARD_RECIPIENTS_COUNT) break;
      selected.push(name);
    }

    return selected.map(name => ({
      heroName: name,
      heroImgSrc: heroesMap.get(name) ?? '',
    }));
  }
}
