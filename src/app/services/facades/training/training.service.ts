import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  PreviewUnit,
  SelectableUnit,
  Unit,
  UnitName,
} from '../../../models/units-related/unit.model';
import {
  AppEntity,
  CONTROL_DATA_TYPE,
  CONTROL_TYPE,
} from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import { FormControl } from '@angular/forms';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { Store } from '@ngrx/store';
import { GAME_BOARD_FIELD, HeroesSelectNames, TrainingSuf } from '../../../constants';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TrainingActions } from '../../../store/actions/training.actions';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { FieldConfigActions } from '../../../store/actions/field-config.actions';
import { TrainingStateUnitType } from '../../../store/store.interfaces';
import { selectUnits } from '../../../store/reducers/training.reducer';

export enum BarCtxTitle {
  user = 'User Units',
  ai = 'AI Units',
}

type BarCtx = {
  isUser: boolean;
  title: BarCtxTitle;
  contextName: HeroesSelectNames;
};

@Injectable({
  providedIn: 'root',
})
export class TrainingFacadeService {
  heroesService = inject(HeroesFacadeService);
  private localStorageService = inject(LocalStorageService);
  formName = 'enhanced_form';

  private store = inject(Store);

  [TrainingStateUnitType.aiUnits] = signal<PreviewUnit[]>([]);
  [TrainingStateUnitType.userUnits] = signal<PreviewUnit[]>([]);

  userSelCtx = computed(() => {
    return { title: 'Selected User Units', units: this.userUnits() };
  });
  aiSelCtx = computed(() => {
    return { title: 'Selected AI Units', units: this.aiUnits() };
  });

  allUnitsForFieldConfig = computed(() => {
    const sanitize = (array: PreviewUnit[], suf: string) =>
      array.map(_ => ({ ..._, name: `${_.name} ${suf}` }));

    const units: AppEntity<PreviewUnit>[] = [
      ...sanitize(this.aiUnits(), TrainingSuf.ai),
      ...sanitize(this.userUnits(), TrainingSuf.user),
    ].map(_ => {
      return {
        alias: _.name,
        placeholder: _.name,
        mainControl: {
          type: CONTROL_TYPE.CUSTOM,
          getControl: () => new FormControl(),
          data: CONTROL_DATA_TYPE.HERO_PREVIEW,
          dataContext: _,
        },
      } satisfies AppEntity<PreviewUnit>;
    });

    return units;
  });

  showField = toObservable(this.allUnitsForFieldConfig).pipe(
    debounceTime(500),
    map(array => !!array.length),
  );

  userBarCtx: BarCtx = {
    isUser: true,
    title: BarCtxTitle.user,
    contextName: HeroesSelectNames.user,
  };
  aiBarCtx: BarCtx = { isUser: false, title: BarCtxTitle.ai, contextName: HeroesSelectNames.ai };

  private readonly allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];

  constructor() {
    this.allUnits = this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.heroesService.helper.getSelectableUnit(this.allUnits);

    const setContext = (userUnits: UnitName[] = [], aiUnits: UnitName[] = []) => {
      this.store.dispatch(
        HeroesSelectActions.setHeroesSelectState({
          name: this.userBarCtx.contextName,
          data: userUnits,
        }),
      );
      this.store.dispatch(
        HeroesSelectActions.setHeroesSelectState({
          name: this.aiBarCtx.contextName,
          data: aiUnits,
        }),
      );
    };

    setContext();

    effect(() => {
      const stashedAIUnits = this.store.selectSignal(selectUnits(TrainingStateUnitType.aiUnits))();
      const stashedUserUnits = this.store.selectSignal(
        selectUnits(TrainingStateUnitType.userUnits),
      )();

      const aiUnits = this.aiUnits();
      const userUnits = this.userUnits();

      if (
        aiUnits.length !== stashedAIUnits.length ||
        userUnits.length !== stashedUserUnits.length
      ) {
        setContext(
          stashedUserUnits.map(el => el.name),
          stashedAIUnits.map(el => el.name),
        );

        this.aiUnits.set(stashedAIUnits);
        this.userUnits.set(stashedUserUnits);
      }
    });
  }

  getUnitKey(user = true) {
    return user ? TrainingStateUnitType.userUnits : TrainingStateUnitType.aiUnits;
  }

  cleanup() {
    this.store.dispatch(TrainingActions.dropTraining());
    this.store.dispatch(FieldConfigActions.setFieldConfig(GAME_BOARD_FIELD));

    setTimeout(() => {
      this.localStorageService.removeItem(this.formName);
    }, 0);
  }
}
