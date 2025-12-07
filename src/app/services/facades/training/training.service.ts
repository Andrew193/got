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
import { UnitsConfiguratorFeatureActions } from '../../../store/actions/units-configurator.actions';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { FieldConfigActions } from '../../../store/actions/field-config.actions';
import { selectUnits } from '../../../store/reducers/units-configurator.reducer';

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

  aiCollection = signal<PreviewUnit[]>([]);
  userCollection = signal<PreviewUnit[]>([]);

  userSelCtx = computed(() => {
    return { title: 'Selected User Units', units: this.userCollection() };
  });
  aiSelCtx = computed(() => {
    return { title: 'Selected AI Units', units: this.aiCollection() };
  });

  allUnitsForFieldConfig = computed(() => {
    const sanitize = (array: PreviewUnit[], suf: string) =>
      array.map(_ => ({ ..._, name: `${_.name} ${suf}` }));

    const units: AppEntity<PreviewUnit>[] = [
      ...sanitize(this.aiCollection(), TrainingSuf.ai),
      ...sanitize(this.userCollection(), TrainingSuf.user),
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
    contextName: HeroesSelectNames.userCollection,
  };
  aiBarCtx: BarCtx = {
    isUser: false,
    title: BarCtxTitle.ai,
    contextName: HeroesSelectNames.aiCollection,
  };

  private readonly allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];

  constructor() {
    let inited = false;

    this.allUnits = this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.heroesService.helper.getSelectableUnit(this.allUnits);

    const setContext = (userUnits: UnitName[] = [], aiUnits: UnitName[] = []) => {
      this.store.dispatch(
        HeroesSelectActions.setHeroesSelectState({
          data: userUnits.map(el => ({ name: el, collection: this.userBarCtx.contextName })),
        }),
      );
      this.store.dispatch(
        HeroesSelectActions.setHeroesSelectState({
          data: aiUnits.map(el => ({ name: el, collection: this.aiBarCtx.contextName })),
        }),
      );
    };

    setContext();

    effect(() => {
      const stashedAIUnits = this.store.selectSignal(selectUnits(this.aiBarCtx.contextName))();
      const stashedUserUnits = this.store.selectSignal(selectUnits(this.userBarCtx.contextName))();

      function areEqual(a: PreviewUnit[], b: PreviewUnit[]) {
        if (a.length !== b.length) return false;

        const mapA = a.map(x => x.name).sort();
        const mapB = b.map(x => x.name).sort();

        return mapA.every((name, i) => name === mapB[i]);
      }

      const aiUnits = this.aiCollection();
      const userUnits = this.userCollection();

      if (!areEqual(userUnits, stashedUserUnits) || !areEqual(aiUnits, stashedAIUnits)) {
        if (!inited) {
          setContext(
            stashedUserUnits.map(el => el.name),
            stashedAIUnits.map(el => el.name),
          );
          inited = true;
        }

        this.aiCollection.set(stashedAIUnits);
        this.userCollection.set(stashedUserUnits);
      }
    });
  }

  getUnitKey(user = true): HeroesSelectNames.userCollection | HeroesSelectNames.aiCollection {
    return user ? HeroesSelectNames.userCollection : HeroesSelectNames.aiCollection;
  }

  cleanup() {
    this.store.dispatch(
      UnitsConfiguratorFeatureActions.drop({
        collections: [this.userBarCtx.contextName, this.aiBarCtx.contextName],
      }),
    );
    this.store.dispatch(FieldConfigActions.setFieldConfig(GAME_BOARD_FIELD));

    setTimeout(() => {
      this.localStorageService.removeItem(this.formName);
    }, 0);
  }
}
