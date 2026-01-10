import { Component, inject } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ActivatedRoute } from '@angular/router';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import {
  BossDifficulty,
  DailyBossFacadeService,
} from '../../../services/facades/daily-boss/daily-boss.service';
import { GameResultsRedirectType, TileUnit } from '../../../models/field.model';
import { UnitName } from '../../../models/units-related/unit.model';
import { RewardService } from '../../../services/reward/reward.service';

@Component({
  selector: 'app-battlefield',
  imports: [GameEntryPointComponent],
  templateUrl: './daily-boss-battlefield.component.html',
})
export class DailyBossBattlefieldComponent {
  dailyBossService = inject(DailyBossFacadeService);
  rewardService = inject(RewardService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];
  level: BossDifficulty = BossDifficulty.easy;

  constructor(
    private route: ActivatedRoute,
    private heroesService: HeroesFacadeService,
  ) {
    this.route.params.subscribe(value => {
      if (value['bossLevel']) {
        this.level = +value['bossLevel'];

        const temp = this.heroesService.helper.getEquipmentForUnit({
          ...this.heroesService.getDailyBossVersion1(),
          user: false,
          ...this.dailyBossService.uppBoss(this.level),
        });

        this.aiUnits = [this.heroesService.getTileUnit(temp)];
      }
    });

    this.route.queryParams.subscribe(value => {
      const temp = (Array.from(value['units']) as UnitName[]).map((_, index) => {
        return {
          ...this.heroesService.getUnitByName(_),
          y: 0,
          x: 1 + index,
        };
      });

      this.userUnits = temp.map(el => this.heroesService.getTileUnit(el));
    });
  }

  getReward([realAiUnits, win]: Parameters<GameResultsRedirectType>) {
    return this.dailyBossService.getRewardToCollect(
      this.level,
      realAiUnits[0].maxHealth - realAiUnits[0].health,
      win,
    );
  }

  gameResultsRedirect = () => {
    this.dailyBossService.collectReward(this.rewardService.mostResentRewardCurrency);
  };
}
