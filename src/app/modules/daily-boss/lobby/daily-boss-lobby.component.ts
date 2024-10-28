import { Component } from '@angular/core';
import {StatsComponent} from "../../../components/stats/stats.component";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Unit} from "../../../models/unit.model";
import {SkillsRenderComponent} from "../../../components/skills-render/skills-render.component";

@Component({
  selector: 'app-daily-boss-lobby',
  standalone: true,
  imports: [
    StatsComponent,
    SkillsRenderComponent
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss'
})
export class DailyBossLobbyComponent {
  selectedHero!: Unit;
  constructor(private heroesService: HeroesService) {
    this.selectedHero = this.heroesService.getDailyBossVersion1();
  }


}
