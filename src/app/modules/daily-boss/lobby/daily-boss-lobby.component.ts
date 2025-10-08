import { Component, inject } from '@angular/core';
import { StatsComponent } from '../../../components/views/stats/stats.component';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { PreviewUnit, SelectableUnit, Unit } from '../../../models/unit.model';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HeroesSelectComponent } from '../../../components/heroes-select/heroes-select.component';
import { BossDifficulty, DailyBossService } from '../../../services/daily-boss/daily-boss.service';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-select-preview/heroes-select-preview.component';
import { TileUnit } from '../../../models/field.model';
import { BossRewardCurrency, BossRewardsConfig } from '../../../models/reward-based.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';

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
  ],
  templateUrl: './daily-boss-lobby.component.html',
  styleUrl: './daily-boss-lobby.component.scss',
})
export class DailyBossLobbyComponent {
  nav = inject(NavigationService);

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];

  selectedHero!: Unit;
  selectedTileHero!: TileUnit;
  chosenUnits: PreviewUnit[] = [];
  config: { level: BossDifficulty; heading: string }[] = [
    { level: BossDifficulty.easy, heading: 'Super Easy' },
    { level: BossDifficulty.normal, heading: 'Easy' },
    { level: BossDifficulty.hard, heading: 'Medium' },
    { level: BossDifficulty.very_hard, heading: 'Hard' },
  ];

  constructor(
    private heroesService: HeroesService,
    public dailyBossService: DailyBossService,
  ) {
    this.allUnits = this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.allUnits.map(el => ({ name: el.name, imgSrc: el.imgSrc }));

    this.selectedHero = this.heroesService.getDailyBossVersion1();
    this.selectedTileHero = this.heroesService.getTileUnit(this.selectedHero);
  }

  public addUserUnit = (unit: SelectableUnit): boolean => {
    const index = this.chosenUnits.findIndex(el => el.name === unit.name);

    if (index === -1 && this.chosenUnits.length < 5) {
      this.chosenUnits = [...this.chosenUnits, this.heroesService.getPreviewUnit(unit.name)];

      return true;
    } else {
      this.chosenUnits = this.chosenUnits.filter((_, i) => i !== index);

      return false;
    }
  };

  bossReward(level: BossDifficulty): BossRewardsConfig<BossRewardCurrency> {
    const reward = this.dailyBossService.bossReward[level];
    const coins: BossRewardCurrency[] = ['copper', 'silver', 'gold'];

    return coins.map(type => ({
      base: reward[type],
      win: reward[`${type}Win`],
      dmg: reward[`${type}DMG`],
      alias: type,
    }));
  }

  upBoss(version: number) {
    return this.heroesService.getEquipmentForUnit({
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
