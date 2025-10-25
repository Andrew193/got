import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  HeroesNamesCodes,
  PreviewUnit,
  SelectableUnit,
  Unit,
} from '../../../models/units-related/unit.model';
import {
  AppEntity,
  CONTROL_DATA_TYPE,
  CONTROL_TYPE,
} from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import { FormControl } from '@angular/forms';
import { RewardValues } from '../../../models/reward-based.model';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { selectAiUnits, selectUserUnits } from '../../../store/reducers/training.reducer';
import { Store } from '@ngrx/store';
import { HeroesSelectNames, TrainingSuf } from '../../../constants';
import { HeroesFacadeService } from '../heroes/heroes.service';

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

  private store = inject(Store);

  aiUnits = signal<PreviewUnit[]>([]);
  userUnits = signal<PreviewUnit[]>([]);

  userSelCtx = computed(() => {
    return { user: true, title: 'Selected User Units', units: this.userUnits() };
  });
  aiSelCtx = computed(() => {
    return { user: false, title: 'Selected AI Units', units: this.aiUnits() };
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

  userBarCtx: BarCtx = {
    isUser: true,
    title: BarCtxTitle.user,
    contextName: HeroesSelectNames.user,
  };
  aiBarCtx: BarCtx = { isUser: false, title: BarCtxTitle.ai, contextName: HeroesSelectNames.ai };

  private allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];

  constructor() {
    this.allUnits = this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.allUnits.map(el => ({ name: el.name, imgSrc: el.imgSrc }));

    const setContext = (
      userUnits: (HeroesNamesCodes | RewardValues)[] = [],
      aiUnits: (HeroesNamesCodes | RewardValues)[] = [],
    ) => {
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
      const stashedAIUnits = this.store.selectSignal(selectAiUnits)();
      const stashedUserUnits = this.store.selectSignal(selectUserUnits)();

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

  getDescKey(user = true) {
    return user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions';
  }

  getUnitKey(user = true) {
    return user ? 'userUnits' : 'aiUnits';
  }
}
