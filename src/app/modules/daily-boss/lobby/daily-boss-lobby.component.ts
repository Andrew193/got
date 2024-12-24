import { Component } from '@angular/core';
import {StatsComponent} from "../../../components/stats/stats.component";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Unit} from "../../../models/unit.model";
import {SkillsRenderComponent} from "../../../components/skills-render/skills-render.component";
import {NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {TabsModule} from "ngx-bootstrap/tabs";
import {createDeepCopy} from "../../../helpers";
import {Router} from "@angular/router";
import {frontRoutes} from "../../../app.routes";
import {HeroesSelectComponent} from "../../../components/heroes-select/heroes-select.component";
import {DailyBossService} from "../../../services/daily-boss/daily-boss.service";
import {HeroesSelectPreviewComponent} from "../../../components/heroes-select-preview/heroes-select-preview.component";

@Component({
  selector: 'app-daily-boss-lobby',
  standalone: true,
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    NgForOf,
    TabsModule,
    NgTemplateOutlet,
    HeroesSelectComponent,
    HeroesSelectPreviewComponent,
    NgIf
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss'
})
export class DailyBossLobbyComponent {
  selectedHero!: Unit;
  chosenUnits: Unit[] = [];
  constructor(private heroesService: HeroesService,
              private route: Router,
              public dailyBossService: DailyBossService) {
    this.selectedHero = this.heroesService.getDailyBossVersion1();
  }

  public addUserUnit = (unit: Unit) => {
    if (this.chosenUnits.findIndex((el) => el.name === unit.name) === -1 && this.chosenUnits.length < 5) {
      this.chosenUnits.push(unit);
    } else {
      this.chosenUnits.splice(this.chosenUnits.findIndex((el) => el.name === unit.name), 1)
    }
  }

  public checkSelected = (unit: Unit) => {
    return this.chosenUnits.findIndex((el) => el.name === unit.name) !== -1
  }

  get bossReward() {
    return this.dailyBossService.bossReward;
  }

  upBoss(version: number) {
    const levelConfig = this.dailyBossService.uppBoss(version);

    return this.heroesService.getEquipmentForUnit(createDeepCopy({...this.selectedHero, ...levelConfig}))
  }

  openFight(bossLevel: number) {
    this.route.navigate([frontRoutes.dailyBoss,frontRoutes.dailyBossBattle,bossLevel], {
      queryParams: {
        units: this.chosenUnits.map((el)=>el.name)
      }
    })
  }

  get allHeroes() {
    return this.heroesService.getAllHeroes();
  }
}
