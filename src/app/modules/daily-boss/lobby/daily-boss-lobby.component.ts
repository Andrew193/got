import {Component} from '@angular/core';
import {StatsComponent} from "../../../components/stats/stats.component";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Unit} from "../../../models/unit.model";
import {SkillsRenderComponent} from "../../../components/skills-render/skills-render.component";
import {NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {TabsModule} from "ngx-bootstrap/tabs";
import {createDeepCopy, trackByLevel} from "../../../helpers";
import {Router} from "@angular/router";
import {HeroesSelectComponent} from "../../../components/heroes-select/heroes-select.component";
import {DailyBossService} from "../../../services/daily-boss/daily-boss.service";
import {HeroesSelectPreviewComponent} from "../../../components/heroes-select-preview/heroes-select-preview.component";
import {frontRoutes} from "../../../constants";

@Component({
    selector: 'app-daily-boss-lobby',
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
  config: { level: number, heading: string }[] = [
    {level: 1, heading: 'Super Easy'},
    {level: 2, heading: 'Easy'},
    {level: 3, heading: 'Medium'},
    {level: 4, heading: 'Hard'}
  ];

  constructor(private heroesService: HeroesService,
              private route: Router,
              public dailyBossService: DailyBossService) {
    this.selectedHero = this.heroesService.getDailyBossVersion1();
  }

  public addUserUnit = (unit: Unit): boolean => {
    const index = this.chosenUnits.findIndex(el => el.name === unit.name);

    if (index === -1 && this.chosenUnits.length < 5) {
      this.chosenUnits = [...this.chosenUnits, unit];
      return true;
    } else {
      this.chosenUnits = this.chosenUnits.filter((_, i) => i !== index);
      return false;
    }
  };

  get bossReward() {
    return this.dailyBossService.bossReward;
  }

  upBoss(version: number) {
    return this.heroesService.getEquipmentForUnit(createDeepCopy({...this.selectedHero, ...this.dailyBossService.uppBoss(version)}))
  }

  openFight(bossLevel: number) {
    this.route.navigate([frontRoutes.dailyBoss, frontRoutes.dailyBossBattle, bossLevel], {
      queryParams: {
        units: this.chosenUnits.map((el) => el.name)
      }
    })
  }

  get allHeroes() {
    return this.heroesService.getAllHeroes();
  }

  protected readonly trackByLevel = trackByLevel;
}
