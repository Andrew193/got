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
import { AI_POSITIONS, USER_POSITIONS } from '../campaign.constants';
import { calcCampaignReward } from '../campaign.utils';
import { CampaignProgressService } from '../services/campaign-progress.service';

export type CampaignBattleState = {
  isCampaign: true;
  battleId: string;
  userId: string;
  userUnitNames: UnitName[];
  aiUnitNames: HeroesNamesCodes[];
  aiUnitConfig: UnitConfig;
  reward: BossReward;
};

@Component({
  selector: 'app-campaign-battlefield',
  standalone: true,
  imports: [GameEntryPointComponent],
  templateUrl: './campaign-battlefield.component.html',
  styleUrl: './campaign-battlefield.component.scss',
})
export class CampaignBattlefieldComponent {
  private heroesService = inject(HeroesFacadeService);
  private nav = inject(NavigationService);
  private rewardService = inject(RewardService);
  private usersService = inject(UsersService);
  private store = inject(Store);
  private campaignProgressService = inject(CampaignProgressService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor() {
    const state = history.state as CampaignBattleState | null;

    if (!state?.isCampaign || !state.userUnitNames?.length || !state.aiUnitNames?.length) {
      this.nav.goToCampaign();

      return;
    }

    const buildTileUnit = (name: UnitName, pos: Coordinate, isUser = true) =>
      this.heroesService.getTileUnit(this.heroesService.getUnitByName(name), {
        user: isUser,
        x: pos.x,
        y: pos.y,
      });

    this.userUnits = state.userUnitNames.map((name, index) =>
      buildTileUnit(name, USER_POSITIONS[index] ?? { x: index, y: 1 }),
    );
    this.aiUnits = state.aiUnitNames.map((name, index) =>
      buildTileUnit(name, AI_POSITIONS[index] ?? { x: index % 5, y: 8 }, false),
    );
  }

  onBattleEnd([aiUnits, win]: Parameters<GameResultsRedirectType>) {
    const state = history.state as CampaignBattleState;
    const reward = state?.reward;

    if (!reward) return;

    const totalDmg = aiUnits.reduce((sum, u) => sum + (u.maxHealth - u.health), 0);
    const currency = calcCampaignReward(reward, totalDmg, win);

    this.rewardService.mostResentRewardCurrency = currency;
    this.store.dispatch(GameBoardActions.setBattleReward({ data: currency }));
  }

  gameResultsRedirect: GameResultsRedirectType = (_, win, currency) => {
    const state = history.state as CampaignBattleState;
    const doNavigate = () => {
      this.usersService
        .updateCurrency(currency || this.rewardService.mostResentRewardCurrency)
        .subscribe(() => this.nav.goToCampaign());
    };

    if (win && state?.battleId && state?.userId) {
      this.campaignProgressService
        .completeBattle(state.userId, state.battleId)
        .subscribe({ next: () => doNavigate(), error: () => doNavigate() });
    } else {
      doNavigate();
    }
  };
}
