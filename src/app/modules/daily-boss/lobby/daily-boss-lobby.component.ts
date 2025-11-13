import { Component, inject } from '@angular/core';
import { StatsComponent } from '../../../components/views/stats/stats.component';
import { Unit } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HeroesSelectComponent } from '../../../components/heroes-related/heroes-select/heroes-select.component';
import { BossDifficulty, DailyBossService } from '../../../services/daily-boss/daily-boss.service';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { TileUnit } from '../../../models/field.model';
import { BossRewardCurrency, BossRewardsConfig } from '../../../models/reward-based.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { BasicHeroSelectComponent } from '../../../components/abstract/basic-hero-select/basic-hero-select.component';
import { CURRENCY_NAMES, frontRoutes, HeroesSelectNames } from '../../../constants';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';
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
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss',
})
export class DailyBossLobbyComponent extends BasicHeroSelectComponent {
  nav = inject(NavigationService);
  override context = HeroesSelectNames.dailyBossCollection;

  loaderService = inject(LoaderService);
  loader = this.loaderService.getPageLoader(frontRoutes.dailyBoss);

  selectedHero!: Unit;
  selectedTileHero!: TileUnit;

  config: { level: BossDifficulty; heading: string }[] = [
    { level: BossDifficulty.easy, heading: 'Super Easy' },
    { level: BossDifficulty.normal, heading: 'Easy' },
    { level: BossDifficulty.hard, heading: 'Medium' },
    { level: BossDifficulty.very_hard, heading: 'Hard' },
  ];

  constructor(public dailyBossService: DailyBossService) {
    super();
    this.selectedHero = this.heroesService.getDailyBossVersion1();
    this.selectedTileHero = this.heroesService.getTileUnit(this.selectedHero);
  }

  bossReward(level: BossDifficulty): BossRewardsConfig<BossRewardCurrency> {
    const reward = this.dailyBossService.bossReward[level];
    const coins: BossRewardCurrency[] = [
      CURRENCY_NAMES.copper,
      CURRENCY_NAMES.silver,
      CURRENCY_NAMES.gold,
    ];

    return coins.map(type => ({
      base: reward[type],
      win: reward[`${type}Win`],
      dmg: reward[`${type}DMG`],
      alias: type,
    }));
  }

  upBoss(version: number) {
    return this.heroesService.helper.getEquipmentForUnit({
      ...this.selectedHero,
      ...this.dailyBossService.uppBoss(version),
    });
  }

  openFight(bossLevel: number) {
    this.nav.goToDailyBossBattle(
      bossLevel,
      this.chosenUnits.map(el => el.name),
    );
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
