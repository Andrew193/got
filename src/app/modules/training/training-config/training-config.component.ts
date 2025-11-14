import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  AddUserUnitCallbackReturnValue,
  PreviewUnit,
  SelectableUnit,
} from '../../../models/units-related/unit.model';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HeroesSelectComponent } from '../../../components/heroes-related/heroes-select/heroes-select.component';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import { UnitsConfiguratorFeatureActions } from '../../../store/actions/units-configurator.actions';
import {
  selectCanStartBattle,
  selectTrainingFieldConfig,
} from '../../../store/reducers/units-configurator.reducer';
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
    AsyncPipe,
  ],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingConfigComponent implements OnInit {
  store = inject(Store);
  nav = inject(NavigationService);
  facade = inject(TrainingFacadeService);
  gridConfig = this.store.selectSignal(selectTrainingFieldConfig());
  canStartFight = this.store.select(selectCanStartBattle());

  aiCollection = this.facade.aiCollection;
  userCollection = this.facade.userCollection;
  userSelCtx = this.facade.userSelCtx;
  aiSelCtx = this.facade.aiSelCtx;
  allUnitsForFieldConfig = this.facade.allUnitsForFieldConfig;
  showField = this.facade.showField;
  formName = this.facade.formName;

  userBarCtx = this.facade.userBarCtx;
  aiBarCtx = this.facade.aiBarCtx;

  getUnitKey = this.facade.getUnitKey;

  allUnitsForSelect = this.facade.allUnitsForSelect;

  public addUserUnit = (unit: SelectableUnit, user = true): AddUserUnitCallbackReturnValue => {
    const unitKey = this.getUnitKey(user);

    const currentUnits = this[unitKey]();
    const index = currentUnits.findIndex(el => el.name === unit.name);

    const update = (unit: PreviewUnit, toReturn: boolean) => {
      this[unitKey].update(model => [...model, unit]);

      if (toReturn) {
        this.store.dispatch(
          UnitsConfiguratorFeatureActions.addUnit({ data: { ...unit, collection: unitKey } }),
        );
      } else {
        this.store.dispatch(
          UnitsConfiguratorFeatureActions.removeUnit({ key: unit.name, collection: unitKey }),
        );
      }

      return { shouldAdd: toReturn } satisfies AddUserUnitCallbackReturnValue;
    };

    const addNew = index === -1 && currentUnits.length < 5;

    return update(
      addNew
        ? this.facade.heroesService.getPreviewUnit(unit.name)
        : currentUnits.filter((_, i) => i === index)[0],
      addNew,
    );
  };

  openFight() {
    this.store.dispatch(UnitsConfiguratorFeatureActions.setUnitUpdate({ canUpdateUnit: false }));
    this.store.dispatch(FieldConfigActions.setFieldConfig(this.gridConfig()));
    this.nav.goToTrainingBattle();
  }

  goToMainPage() {
    this.facade.cleanup();
    this.nav.goToMainPage();
  }

  ngOnInit() {
    this.store.dispatch(UnitsConfiguratorFeatureActions.setUnitUpdate({ canUpdateUnit: true }));
  }
}
