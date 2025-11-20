import { Component, inject } from '@angular/core';
import { StatsComponent } from '../../../components/views/stats/stats.component';
import { Unit } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HeroesSelectComponent } from '../../../components/heroes-related/heroes-select/heroes-select.component';
import {
  BossDifficulty,
  DailyBossFacadeService,
} from '../../../services/facades/daily-boss/daily-boss.service';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { TileUnit } from '../../../models/field.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { BasicHeroSelectComponent } from '../../../components/abstract/basic-hero-select/basic-hero-select.component';
import { frontRoutes, HeroesSelectNames } from '../../../constants';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';
import { TrainingMatcherCover } from '../../training/training-config/training-config.component';
import { LoaderService } from '../../../services/resolver-loader/loader.service';

@Component({
  selector: 'app-daily-boss-lobby',
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    NgTemplateOutlet,
    HeroesSelectComponent,
    HeroesSelectPreviewComponent,
    DecimalPipe,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    PageLoaderComponent,
    TrainingMatcherCover,
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss',
})
export class DailyBossLobbyComponent extends BasicHeroSelectComponent {
  nav = inject(NavigationService);
  dailyBossService = inject(DailyBossFacadeService);
  private loaderService = inject(LoaderService);

  loader = this.loaderService.getPageLoader(frontRoutes.dailyBoss);

  override context = HeroesSelectNames.dailyBossCollection;

  constructor() {
    super();
  }

  selectedHero: Unit = this.heroesService.getDailyBossVersion1();
  selectedTileHero: TileUnit = this.heroesService.getTileUnit(this.selectedHero);
  config = this.dailyBossService.difficultyConfigs;

  getBossRewardDescription = (level: BossDifficulty) =>
    this.dailyBossService.getBossRewardDescription(level);

  upBoss(version: BossDifficulty) {
    return this.heroesService.helper.getEquipmentForUnit({
      ...this.selectedHero,
      ...this.dailyBossService.uppBoss(version),
    });
  }

  openFight(bossLevel: BossDifficulty) {
    this.nav.goToDailyBossBattle(
      bossLevel,
      this.chosenUnits.map(el => el.name),
    );
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
