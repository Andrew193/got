import { Component } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ActivatedRoute } from '@angular/router';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { DailyBossService } from '../../../services/daily-boss/daily-boss.service';
import { TileUnit } from '../../../models/field.model';

@Component({
  selector: 'app-battlefield',
  imports: [GameEntryPointComponent],
  templateUrl: './daily-boss-battlefield.component.html',
})
export class DailyBossBattlefieldComponent {
  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor(
    private route: ActivatedRoute,
    private dailyBossService: DailyBossService,
    private heroesService: HeroesService,
  ) {
    this.route.params.subscribe(value => {
      const temp = this.heroesService.getEquipmentForUnit({
        ...this.heroesService.getDailyBossVersion1(),
        user: false,
        ...this.dailyBossService.uppBoss(value['bossLevel']),
      });

      this.aiUnits = [this.heroesService.getTileUnit(temp)];
    });
    this.route.queryParams.subscribe(value => {
      const temp = (value['units'] as string[]).map((el, index) => {
        return {
          ...this.heroesService.getUnitByName(el),
          y: 0,
          x: 1 + index,
        };
      });

      this.userUnits = temp.map(this.heroesService.getTileUnit);
    });
  }
}
