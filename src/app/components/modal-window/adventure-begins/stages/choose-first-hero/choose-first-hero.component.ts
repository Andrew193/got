import { Component, inject } from '@angular/core';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BasicHeroSelectComponent } from '../../../../abstract/basic-hero-select/basic-hero-select.component';
import { HeroesSelectComponent } from '../../../../heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../heroes-select-preview/heroes-select-preview.component';
import { StatsComponent } from '../../../../views/stats/stats.component';
import { Unit } from '../../../../../models/unit.model';
import { SceneNames } from '../../../../../constants';

@Component({
  selector: 'app-choose-first-hero',
  imports: [HeroesSelectComponent, HeroesSelectPreviewComponent, StatsComponent],
  templateUrl: './choose-first-hero.component.html',
  styleUrl: './choose-first-hero.component.scss',
})
export class ChooseFirstHeroComponent extends BasicHeroSelectComponent implements SceneComponent {
  bottomSheetRef =
    inject<MatBottomSheetRef<ChooseFirstHeroComponent, SceneContext<SceneNames.firstHero>>>(
      MatBottomSheetRef,
    );

  override maxHeroes = 1;

  constructor() {
    super();
    this.init(this.heroesService.getInitialHeroes());
  }

  runScene() {}

  stopScene() {
    this.bottomSheetRef.dismiss({ name: this.chosenUnits[0].name, repeat: false });
  }

  getSelectedHero() {
    const chosenUnit = this.chosenUnits[0];

    if (chosenUnit) {
      return this.allUnits.find(el => el.name === chosenUnit.name) as Unit;
    }

    return null;
  }
}
