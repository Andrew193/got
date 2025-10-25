import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewUnit, SelectableUnit } from '../../../models/units-related/unit.model';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HeroesSelectComponent } from '../../../components/heroes-related/heroes-select/heroes-select.component';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import { TrainingActions } from '../../../store/actions/training.actions';
import { selectTrainingFieldConfig } from '../../../store/reducers/training.reducer';
import { EnhancedFormConstructorComponent } from '../../../components/form/enhancedFormConstructor/enhanced-form-constructor/enhanced-form-constructor.component';
import { FieldConfigActions } from '../../../store/actions/field-config.actions';
import { TrainingFacadeService } from '../../../services/facades/training/training.service';

@Component({
  selector: 'app-training-config',
  imports: [
    HeroesSelectPreviewComponent,
    HeroesSelectComponent,
    NgTemplateOutlet,
    EnhancedFormConstructorComponent,
  ],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingConfigComponent {
  store = inject(Store);
  nav = inject(NavigationService);
  facade = inject(TrainingFacadeService);
  gridConfig = this.store.selectSignal(selectTrainingFieldConfig());

  aiUnits = this.facade.aiUnits;
  userUnits = this.facade.userUnits;
  userSelCtx = this.facade.userSelCtx;
  aiSelCtx = this.facade.aiSelCtx;
  allUnitsForFieldConfig = this.facade.allUnitsForFieldConfig;

  userBarCtx = this.facade.userBarCtx;
  aiBarCtx = this.facade.aiBarCtx;

  getUnitKey = this.facade.getUnitKey;
  getDescKey = this.facade.getDescKey;

  allUnitsForSelect = this.facade.allUnitsForSelect;

  aiUnitsDescriptions: boolean[] = [];
  userUnitsDescriptions: boolean[] = [];

  public addUserUnit = (unit: SelectableUnit, user = true): boolean => {
    const unitKey = this.getUnitKey(user);
    const descKey = this.getDescKey(user);

    const currentUnits = this[unitKey]();
    const index = currentUnits.findIndex(el => el.name === unit.name);

    const update = (updatedUnits: PreviewUnit[], toReturn: boolean) => {
      this[unitKey].set(updatedUnits);

      if (unitKey === 'aiUnits') {
        this.store.dispatch(TrainingActions.setAIUnits({ units: updatedUnits }));
      } else {
        this.store.dispatch(TrainingActions.setUserUnits({ units: updatedUnits }));
      }

      this[descKey] = updatedUnits.map(() => false);

      return toReturn;
    };

    const addNew = index === -1 && currentUnits.length < 5;

    return update(
      addNew
        ? [...currentUnits, this.facade.heroesService.getPreviewUnit(unit.name)]
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
    this.store.dispatch(FieldConfigActions.setFieldConfig(this.gridConfig()));
    this.nav.goToTrainingBattle();
  }

  goToMainPage() {
    this.store.dispatch(TrainingActions.dropTrainingSelectUnits());
    this.nav.goToMainPage();
  }
}
