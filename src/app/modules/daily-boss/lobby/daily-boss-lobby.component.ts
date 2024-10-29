import { Component } from '@angular/core';
import {StatsComponent} from "../../../components/stats/stats.component";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Unit} from "../../../models/unit.model";
import {SkillsRenderComponent} from "../../../components/skills-render/skills-render.component";
import {NgForOf} from "@angular/common";
import {TabsModule} from "ngx-bootstrap/tabs";
import {createDeepCopy} from "../../../helpers";

@Component({
  selector: 'app-daily-boss-lobby',
  standalone: true,
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    NgForOf,
    TabsModule
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss'
})
export class DailyBossLobbyComponent {
  selectedHero!: Unit;
  constructor(private heroesService: HeroesService) {
    this.selectedHero = this.heroesService.getDailyBossVersion1();
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

}
