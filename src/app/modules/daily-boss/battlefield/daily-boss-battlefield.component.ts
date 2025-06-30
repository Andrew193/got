import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {GameEntryPointComponent} from "../../../components/game-entry-point/game-entry-point.component";
import {ActivatedRoute} from "@angular/router";
import {Unit} from "../../../models/unit.model";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {DailyBossService} from "../../../services/daily-boss/daily-boss.service";

@Component({
  selector: 'app-battlefield',
  standalone: true,
  imports: [
    CommonModule,
    GameEntryPointComponent
  ],
  templateUrl: './daily-boss-battlefield.component.html',
  styleUrl: './daily-boss-battlefield.component.scss'
})
export class DailyBossBattlefieldComponent {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];

  constructor(private route: ActivatedRoute,
              private dailyBossService: DailyBossService,
              private heroesService: HeroesService) {
    this.route.params.subscribe((value) => {
      this.aiUnits.push(this.heroesService.getEquipmentForUnit(
        {
          ...this.heroesService.getDailyBossVersion1(),
          user: false, ...this.dailyBossService.uppBoss(value['bossLevel'])
        })
      )
    });
    this.route.queryParams.subscribe((value) => {
      (value['units'] as string[]).forEach((el, index) => {
        this.userUnits.push({...this.heroesService.getUnitByName(el), y: 0, x: 1 + index})
      })
    })
  }
}
