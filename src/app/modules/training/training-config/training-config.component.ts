import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewUnit, SelectableUnit, Unit } from '../../../models/unit.model';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-select-preview/heroes-select-preview.component';
import { HeroesSelectComponent } from '../../../components/heroes-select/heroes-select.component';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-training-config',
  imports: [HeroesSelectPreviewComponent, HeroesSelectComponent, NgTemplateOutlet],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingConfigComponent {
  nav = inject(NavigationService);

  aiUnits: PreviewUnit[] = [];
  userUnits: PreviewUnit[] = [];

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];
  aiUnitsDescriptions: boolean[] = [];
  userUnitsDescriptions: boolean[] = [];

  userBarCtx = { isUser: true, title: 'User Units' };
  aiBarCtx = { isUser: false, title: 'AI Units' };
  userSelCtx = { user: true, title: 'Selected User Units', units: this.userUnits };
  aiSelCtx = { user: false, title: 'Selected AI Units', units: this.aiUnits };

  constructor(private heroesService: HeroesService) {
    this.allUnits = this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.allUnits.map(el => ({ name: el.name, imgSrc: el.imgSrc }));
  }

  getDescKey(user = true) {
    return user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions';
  }

  getUnitKey(user = true) {
    return user ? 'userUnits' : 'aiUnits';
  }

  public addUserUnit = (unit: SelectableUnit, user = true): boolean => {
    const unitKey = this.getUnitKey(user);
    const descKey = this.getDescKey(user);

    const currentUnits = this[unitKey];
    const index = currentUnits.findIndex(el => el.name === unit.name);

    const update = (updatedUnits: PreviewUnit[], toReturn: boolean) => {
      this[unitKey] = updatedUnits;
      this[descKey] = updatedUnits.map(() => false);

      return toReturn;
    };

    const addNew = index === -1 && currentUnits.length < 5;

    queueMicrotask(() => {
      if (user) {
        this.userSelCtx = { ...this.userSelCtx, units: this.userUnits };
      } else {
        this.aiSelCtx = { ...this.aiSelCtx, units: this.aiUnits };
      }
    });

    return update(
      addNew
        ? [...currentUnits, this.heroesService.getPreviewUnit(unit.name)]
        : currentUnits.filter((_, i) => i !== index),
      addNew,
    );
  };

  public toggleDescription = (user: boolean, index: number) => {
    const descKey = this.getDescKey(user);
    const next = [...this[descKey]];

    next[index] = !next[index];

    this[descKey] = next;
  };

  public getDescriptionState = (user: boolean, index: number) => {
    return this[this.getDescKey(user)][index];
  };

  openFight() {
    const getUnits = (getUser: boolean) => {
      return this.allUnits
        .filter(unit => {
          return this[this.getUnitKey(getUser)].findIndex(v => v.name === unit.name) !== -1;
        })
        .map((el, i) => ({ ...el, x: 2 + i, y: getUser ? 1 : 8, user: getUser }));
    };

    this.nav.goToTrainingBattle({ userUnits: getUnits(true), aiUnits: getUnits(false) });
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
