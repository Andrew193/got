import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeroProgressService } from '../../../services/facades/hero-progress/hero-progress.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import {
  HeroesNamesCodes,
  PlayerHeroesProgress,
  Rarity,
  UnitName,
} from '../../../models/units-related/unit.model';
import { HeroesSrcMap } from '../../../services/facades/heroes/heroes.service';
import { CampaignBattleConfig } from '../../campaign/models/campaign.models';
import { SNACKBAR_CONFIG } from '../../../constants';
import {
  ShardsDifComponent,
  ShardsDifData,
} from '../../../components/modal-window/currency/shards-dif/shards-dif.component';
import {
  BOSS_SHARD_REWARD,
  makeBanquetBattleId,
  POST_UNLOCK_SHARD_REWARD,
  UNLOCK_THRESHOLD,
} from '../banquet-hall.constants';
import { BanquetBattleState } from '../banquet-battlefield/banquet-battlefield.component';
import { BanquetHallProgressService } from './banquet-hall-progress.service';

@Injectable({ providedIn: 'root' })
export class BanquetHallFacadeService {
  private heroProgressService = inject(HeroProgressService);
  private banquetProgressService = inject(BanquetHallProgressService);
  private nav = inject(NavigationService);
  private snackBar = inject(MatSnackBar);
  private localStorageService = inject(LocalStorageService);

  startBattle(
    config: CampaignBattleConfig,
    heroName: HeroesNamesCodes,
    userUnits: UnitName[],
    aiUnits: HeroesNamesCodes[],
    userId: string,
    isPostUnlockMode: boolean,
  ): void {
    const { name: _name, ...aiUnitConfig } = config.baseOpponent;
    const battleId = makeBanquetBattleId(heroName, config.screenIndex, config.battleIndex);

    const state: BanquetBattleState = {
      isBanquet: true,
      battleId,
      userId,
      heroName,
      isBoss: config.isBoss,
      isPostUnlockMode,
      userUnitNames: userUnits,
      aiUnitNames: aiUnits,
      aiUnitConfig,
    };

    this.nav.goToBanquetBattle(state);
  }

  onBattleEnd(win: boolean, state: BanquetBattleState): Observable<void> {
    const userId = state.userId || this.localStorageService.getUserId();

    if (!win) {
      return of(void 0);
    }

    if (!state.isBoss) {
      // Non-boss win: mark battle as completed (one-time), no shards
      return this.banquetProgressService
        .completeBattle(userId, state.battleId)
        .pipe(switchMap(() => of(void 0)));
    }

    // Boss win: award shards
    const amount = state.isPostUnlockMode ? POST_UNLOCK_SHARD_REWARD : BOSS_SHARD_REWARD;

    // Final boss (isPostUnlockMode) is always replayable — server handles it gracefully.
    // Non-final boss: mark as completed first, then award shards.
    const markComplete$: Observable<unknown> = state.isPostUnlockMode
      ? of(null)
      : this.banquetProgressService.completeBattle(userId, state.battleId);

    return markComplete$.pipe(
      switchMap(() =>
        this.heroProgressService.addShards(userId, state.heroName, amount).pipe(
          switchMap(progress => {
            this.handleShardsResult(userId, state.heroName, amount, progress);

            return of(void 0);
          }),
        ),
      ),
    );
  }

  private handleShardsResult(
    userId: string,
    heroName: HeroesNamesCodes,
    amount: number,
    progress: PlayerHeroesProgress,
  ): void {
    const heroRecord = progress.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) return;

    const heroImgSrc = HeroesSrcMap[heroName]?.imgSrc ?? '';
    const rarity = Rarity.COMMON;

    if (heroRecord.shards >= UNLOCK_THRESHOLD && !heroRecord.isUnlocked) {
      this.heroProgressService.unlockHero(userId, heroName).subscribe({
        next: () => {
          this.snackBar.open(`🎉 Hero "${heroName}" has been unlocked!`, 'Great', SNACKBAR_CONFIG);
        },
        error: () => {
          this.snackBar.open(`Failed to unlock hero "${heroName}"`, 'Ok', SNACKBAR_CONFIG);
        },
      });
    } else {
      this.snackBar.openFromComponent(ShardsDifComponent, {
        ...SNACKBAR_CONFIG,
        data: { heroName, heroImgSrc, amount, rarity } as ShardsDifData,
      });
    }
  }
}
