import { Component } from '@angular/core';
import {StatsComponent} from "../../../components/stats/stats.component";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Unit} from "../../../models/unit.model";
import {SkillsRenderComponent} from "../../../components/skills-render/skills-render.component";
import {NgForOf, NgTemplateOutlet} from "@angular/common";
import {TabsModule} from "ngx-bootstrap/tabs";
import {createDeepCopy} from "../../../helpers";
import {BossReward} from "../../../interface";
import {Router} from "@angular/router";
import {frontRoutes} from "../../../app.routes";

@Component({
  selector: 'app-daily-boss-lobby',
  standalone: true,
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    NgForOf,
    TabsModule,
    NgTemplateOutlet
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss'
})
export class DailyBossLobbyComponent {
  selectedHero!: Unit;
  constructor(private heroesService: HeroesService,
              private route: Router) {
    this.selectedHero = this.heroesService.getDailyBossVersion1();
  }

  bossReward: {[key: number]: BossReward} = {
    1: {
      copper: 10000,
      copperWin: 100000,
      copperDMG: 2500,
      silver: 100,
      silverWin: 100,
      silverDMG: 15000,
      gold: 50,
      goldWin: 50,
      goldDMG: 35000,
    },
    2: {
      copper: 30000,
      copperWin: 300000,
      copperDMG: 25000,
      silver: 300,
      silverWin: 1000,
      silverDMG: 150000,
      gold: 150,
      goldWin: 300,
      goldDMG: 350000,
    },
    3: {
      copper: 90000,
      copperWin: 1000000,
      copperDMG: 150000,
      silver: 900,
      silverWin: 3000,
      silverDMG: 200000,
      gold: 450,
      goldWin: 1000,
      goldDMG: 500000,
    },
    4: {
      copper: 300000,
      copperWin: 2300000,
      copperDMG: 250000,
      silver: 3000,
      silverWin: 5000,
      silverDMG: 1000000,
      gold: 1000,
      goldWin: 3000,
      goldDMG: 2000000,
    }
  }

  upBoss(version: number) {
    const versions:{[key: number]: any} = {
      1: {},
      2: {
        level: 20,
        rank: 2,
        eq1Level: 50,
        eq2Level: 50,
        eq3Level: 50,
        eq4Level: 50,
      },
      3: {
        level: 40,
        rank: 4,
        eq1Level: 100,
        eq2Level: 100,
        eq3Level: 100,
        eq4Level: 100,
      },
      4: {
        level: 60,
        rank: 6,
        eq1Level: 200,
        eq2Level: 200,
        eq3Level: 200,
        eq4Level: 200,
      }
    }
    const copy = createDeepCopy({...this.selectedHero, ...versions[version]});

    return this.heroesService.getEquipmentForUnit(copy)
  }

  openFight(bossLevel: number) {
    this.route.navigateByUrl(frontRoutes.dailyBoss + "/" + frontRoutes.dailyBossBattle + `/${bossLevel}`)
  }
}
