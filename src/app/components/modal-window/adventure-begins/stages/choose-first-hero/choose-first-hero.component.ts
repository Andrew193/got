import { Component, inject } from '@angular/core';
import {
  SceneComponent,
  SceneContext,
} from '../../../../../models/interfaces/scenes/scene.interface';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BasicHeroSelectComponent } from '../../../../abstract/basic-hero-select/basic-hero-select.component';
import { HeroesSelectComponent } from '../../../../heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../heroes-related/heroes-select-preview/heroes-select-preview.component';
import { StatsComponent } from '../../../../views/stats/stats.component';
import { PreviewUnit, Unit } from '../../../../../models/units-related/unit.model';
import { HeroesSelectNames, SceneNames } from '../../../../../constants';
import { HeroesSelectActions } from '../../../../../store/actions/heroes-select.actions';
import { selectUnits } from '../../../../../store/reducers/units-configurator.reducer';

@Component({
  selector: 'app-choose-first-hero',
  imports: [HeroesSelectComponent, HeroesSelectPreviewComponent, StatsComponent],
  templateUrl: './choose-first-hero.component.html',
  styleUrl: './choose-first-hero.component.scss',
})
export class ChooseFirstHeroComponent
  extends BasicHeroSelectComponent<PreviewUnit>
  implements SceneComponent
{
  bottomSheetRef =
    inject<MatBottomSheetRef<ChooseFirstHeroComponent, SceneContext<SceneNames.firstHero>>>(
      MatBottomSheetRef,
    );

  override maxHeroes = 1;

  heroesContext = HeroesSelectNames.firstBattleCollection;
  chosenUnits = this.store.selectSignal(selectUnits(this.heroesContext));

  constructor() {
    super();
    this.init(this.heroesService.getInitialHeroes());
  }

  runScene() {}

  stopScene() {
    this.store.dispatch(
      HeroesSelectActions.resetHeroCollection({ collections: [this.heroesContext] }),
    );
    this.bottomSheetRef.dismiss({ name: this.chosenUnits()[0].name, repeat: false });
  }

  getSelectedHero() {
    const chosenUnit = this.chosenUnits()[0];

    if (chosenUnit) {
      return this.allUnits.find(el => el.name === chosenUnit.name) as Unit;
    }

    return null;
  }
}
