import { Component, inject } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { RewardService } from '../../../services/reward/reward.service';
import { UsersService } from '../../../services/users/users.service';
import { Coordinate, GameResultsRedirectType, TileUnit } from '../../../models/field.model';
import { HeroesNamesCodes, UnitConfig, UnitName } from '../../../models/units-related/unit.model';
import { BossReward } from '../../../models/reward-based.model';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../../store/actions/game-board.actions';
import { Currency } from '../../../services/users/users.interfaces';

export type CampaignBattleState = {
  isCampaign: true;
  userUnitNames: UnitName[];
  aiUnitNames: HeroesNamesCodes[];
  aiUnitConfig: UnitConfig;
  reward: BossReward;
};

const AI_POSITIONS: Coordinate[] = [
  { x: 3, y: 8 },
  { x: 2, y: 7 },
  { x: 4, y: 7 },
  { x: 1, y: 8 },
  { x: 5, y: 8 },
];

const USER_POSITIONS: Coordinate[] = [
  { x: 3, y: 1 },
  { x: 2, y: 2 },
  { x: 4, y: 2 },
  { x: 1, y: 1 },
  { x: 5, y: 1 },
];

@Component({
  selector: 'app-campaign-battlefield',
  standalone: true,
  imports: [GameEntryPointComponent],
  template: `
    @if (aiUnits.length && userUnits.length) {
      <app-game-entry-point
        [aiUnits]="aiUnits"
        [userUnits]="userUnits"
        (battleEndFlag)="onBattleEnd($event)"
        [gameResultsRedirect]="gameResultsRedirect" />
    }
  `,
})
export class CampaignBattlefieldComponent {
  private heroesService = inject(HeroesFacadeService);
  private nav = inject(NavigationService);
  private rewardService = inject(RewardService);
  private usersService = inject(UsersService);
  private store = inject(Store);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor() {
    const state = history.state as CampaignBattleState | null;

    if (!state?.isCampaign || !state.userUnitNames?.length || !state.aiUnitNames?.length) {
      this.nav.goToCampaign();

      return;
    }

    const getTileUnitCover = (name: UnitName, pos: Coordinate, isUser = true) => {
      return this.heroesService.getTileUnit(this.heroesService.getUnitByName(name), {
        user: isUser,
        x: pos.x,
        y: pos.y,
      });
    };

    this.userUnits = state.userUnitNames.map((name, index) =>
      getTileUnitCover(name, USER_POSITIONS[index] ?? { x: index, y: 1 }),
    );
    this.aiUnits = state.aiUnitNames.map((name, index) =>
      getTileUnitCover(name, AI_POSITIONS[index] ?? { x: index % 5, y: 8 }, false),
    );
  }

  onBattleEnd([aiUnits, win]: Parameters<GameResultsRedirectType>) {
    const state = history.state as CampaignBattleState;
    const reward = state?.reward;

    if (!reward) return;

    const totalDmg = aiUnits.reduce((sum, u) => sum + (u.maxHealth - u.health), 0);
    const currency = this.calcReward(reward, totalDmg, win);

    this.rewardService.mostResentRewardCurrency = currency;
    this.store.dispatch(GameBoardActions.setBattleReward({ data: currency }));
  }

  gameResultsRedirect: GameResultsRedirectType = (_, __, currency) => {
    this.usersService
      .updateCurrency(currency || this.rewardService.mostResentRewardCurrency)
      .subscribe(() => this.nav.goToCampaign());
  };

  private calcReward(reward: BossReward, dmg: number, win: boolean): Currency {
    const times = (dmg: number, threshold: number) => Math.floor(dmg / Math.max(threshold, 1));

    return {
      copper: times(dmg, reward.copperDMG) * reward.copper + (win ? reward.copperWin : 0),
      silver: times(dmg, reward.silverDMG) * reward.silver + (win ? reward.silverWin : 0),
      gold: times(dmg, reward.goldDMG) * reward.gold + (win ? reward.goldWin : 0),
    };
  }
}
