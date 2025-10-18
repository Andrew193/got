import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HeroesNamesCodes, PreviewUnit, SelectableUnit, Unit } from '../../../models/unit.model';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-select-preview/heroes-select-preview.component';
import { HeroesSelectComponent } from '../../../components/heroes-select/heroes-select.component';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import { selectAiUnits, selectUserUnits } from '../../../store/reducers/training.reducer';
import {
  dropTrainingSelectUnits,
  setAIUnits,
  setUserUnits,
} from '../../../store/actions/training.actions';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { RewardValues } from '../../../models/reward-based.model';
import { HeroesSelectNames } from '../../../constants';

type BarCtx = {
  isUser: boolean;
  title: 'User Units' | 'AI Units';
  contextName: HeroesSelectNames;
};

@Component({
  selector: 'app-training-config',
  imports: [HeroesSelectPreviewComponent, HeroesSelectComponent, NgTemplateOutlet],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingConfigComponent {
  store = inject(Store);
  nav = inject(NavigationService);

  aiUnits = signal<PreviewUnit[]>([]);
  userUnits = signal<PreviewUnit[]>([]);

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];
  aiUnitsDescriptions: boolean[] = [];
  userUnitsDescriptions: boolean[] = [];

  userBarCtx: BarCtx = { isUser: true, title: 'User Units', contextName: HeroesSelectNames.user };
  aiBarCtx: BarCtx = { isUser: false, title: 'AI Units', contextName: HeroesSelectNames.ai };

  userSelCtx = computed(() => {
    return { user: true, title: 'Selected User Units', units: this.userUnits() };
  });
  aiSelCtx = computed(() => {
    return { user: false, title: 'Selected AI Units', units: this.aiUnits() };
  });

  constructor(private heroesService: HeroesService) {
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

  public addUserUnit = (unit: SelectableUnit, user = true): boolean => {
    const unitKey = this.getUnitKey(user);
    const descKey = this.getDescKey(user);

    const currentUnits = this[unitKey]();
    const index = currentUnits.findIndex(el => el.name === unit.name);

    const update = (updatedUnits: PreviewUnit[], toReturn: boolean) => {
      this[unitKey].set(updatedUnits);

      if (unitKey === 'aiUnits') {
        this.store.dispatch(setAIUnits({ units: updatedUnits }));
      } else {
        this.store.dispatch(setUserUnits({ units: updatedUnits }));
      }

      this[descKey] = updatedUnits.map(() => false);

      return toReturn;
    };

    const addNew = index === -1 && currentUnits.length < 5;

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
    this.nav.goToTrainingBattle();
  }

  goToMainPage() {
    this.store.dispatch(dropTrainingSelectUnits());
    this.nav.goToMainPage();
  }
}
