import { createActionGroup, props } from '@ngrx/store';
import { HeroesSelectStateEntity, StoreNames } from '../store.interfaces';
import { HeroesSelectNames } from '../../constants';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/units-related/unit.model';

export const HeroesSelectActions = createActionGroup({
  source: StoreNames.heroesSelect,
  events: {
    setHeroesSelectState: props<{
      data: HeroesSelectStateEntity[];
    }>(),
    removeHeroFromCollection: props<{
      collection: HeroesSelectNames;
      name: RewardValues | HeroesNamesCodes;
    }>(),
    addHeroToCollection: props<{
      collection: HeroesSelectNames;
      name: RewardValues | HeroesNamesCodes;
    }>(),
    resetHeroCollection: props<{ collections: HeroesSelectNames[] }>(),
  },
});
